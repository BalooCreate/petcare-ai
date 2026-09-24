import Stripe from "stripe";
import sql from "../../utils/sql";

// Webhook Stripe pentru a activa planurile Lifetime și Monthly după plată

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY missing");
    return new Response("Stripe not configured", { status: 500 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("STRIPE_WEBHOOK_SECRET missing, skipping signature verification (doar pentru dev)");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // Pentru dev fără webhook secret, parsează body-ul direct
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature verification failed", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("Stripe event received:", event.type);

  // Gestionează evenimentele de succes
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || "starter";
    const type = session.metadata?.type || "lifetime";

    console.log(`Payment success for user ${userId}, plan ${plan}, type ${type}`);

    if (userId) {
      try {
        // Activează planul
        if (type === "lifetime") {
          await sql`
            UPDATE users 
            SET plan = ${plan}, 
                plan_type = 'lifetime',
                lifetime_paid = true,
                stripe_customer_id = ${session.customer || null}
            WHERE id = ${userId}
          `;
        } else {
          // Monthly subscription
          await sql`
            UPDATE users 
            SET plan = ${plan}, 
                plan_type = 'monthly',
                lifetime_paid = false,
                stripe_customer_id = ${session.customer || null}
            WHERE id = ${userId}
          `;
        }

        // Resetează limitele pentru noul plan (upgrade instant)
        await sql`
          UPDATE usage_limits 
          SET ai_chats_used = 0, scans_used = 0, reset_date = NOW() + INTERVAL '1 month'
          WHERE user_id = ${userId}
        `;

        console.log(`User ${userId} upgraded to ${plan} ${type}`);
      } catch (err) {
        console.error("Error updating user after payment", err);
        return new Response("Error updating user", { status: 500 });
      }
    }
  }

  // Gestionează anularea abonamentului
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      // Downgrade la free
      await sql`
        UPDATE users 
        SET plan = 'free', plan_type = 'free', lifetime_paid = false
        WHERE stripe_customer_id = ${customerId} AND lifetime_paid = false
      `;
      console.log(`Subscription cancelled for customer ${customerId}, downgraded to free`);
    } catch (err) {
      console.error("Error downgrading user", err);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// Pentru React Router, trebuie să exportăm și GET pentru test
export async function GET() {
  return new Response("Stripe webhook endpoint is working. Use POST for events.", { status: 200 });
}
