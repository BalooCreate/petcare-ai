// ============================================================
//  STRIPE WEBHOOK — WORKING ROUTE
//
//  ⚠️  WHY THIS IS A `page.jsx` AND NOT A `route.js`:
//  src/app/routes.ts registers ONLY `page.jsx` files.
//  `route.js` files (a Next.js convention) are never
//  servite -> de aceea webhook-ul vechi returna 405.
//  Aici folosim `action`, care este mecanismul real din React Router.
//
//  ENDPOINT: POST https://petassists.com/api/webhooks/stripe
//  EVENIMENTE: checkout.session.completed, charge.refunded,
//              customer.subscription.deleted, invoice.payment_failed
//
//  WHY IT MATTERS: if a customer pays but closes
//  the browser before reaching /dashboard?session_id=...,
//  the dashboard check never runs. The webhook
//  activates the plan server-side, so the customer is not left out.
// ============================================================

import Stripe from "stripe";
import sql from "../../utils/sql";
import { activatePlan, revokePlan } from "../../../../lib/usage.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Find the user by Stripe customer id. */
async function findUserByCustomer(customerId) {
  if (!customerId) return null;
  try {
    const rows = await sql`SELECT id FROM users WHERE stripe_customer_id = ${customerId}`;
    return rows[0]?.id || null;
  } catch (e) {
    console.error("findUserByCustomer error:", e.message);
    return null;
  }
}

/** GET — simple liveness check for the endpoint (useful for monitoring). */
export async function loader() {
  return new Response("Stripe webhook endpoint is live.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

/** POST — evenimentul trimis de Stripe. */
export async function action({ request }) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is missing — the webhook cannot validate payments");
    return jsonResponse({ error: "Stripe not configured" }, 500);
  }

  const stripe = new Stripe(secretKey);
  let event;

  // SECURITY: fail closed. Without the signing secret, anyone who knows this URL could
  // POST a fake {"type":"checkout.session.completed"} and grant themselves a paid plan.
  // If you need to test webhooks locally, use `stripe listen` and set the secret it prints.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is missing — refusing to process an unverified webhook");
    return jsonResponse(
      { error: "Webhook signing secret not configured. Set STRIPE_WEBHOOK_SECRET in Render." },
      500
    );
  }
  if (!signature) {
    return jsonResponse({ error: "Missing Stripe-Signature header" }, 400);
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("Stripe event received:", event.type);

  try {
    switch (event.type) {
      // ---------- PAYMENT SUCCEEDED ----------
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session?.metadata?.userId;
        const plan = session?.metadata?.plan;
        const type = session?.metadata?.type === "lifetime" ? "lifetime" : "monthly";
        const customerId = typeof session?.customer === "string" ? session.customer : null;
        const isPaid = session?.payment_status === "paid" || session?.status === "complete";

        if (isPaid && userId && plan) {
          await activatePlan(userId, plan, { type, customerId });
        } else {
          console.warn("checkout.session.completed without valid data", {
            isPaid, userId, plan,
          });
        }
        break;
      }

      // ---------- RESTITUIRE / REFUND ----------
      case "charge.refunded": {
        const charge = event.data.object;
        const customerId = typeof charge?.customer === "string" ? charge.customer : null;
        const userId = await findUserByCustomer(customerId);
        if (userId) {
          await revokePlan(userId);
          console.log(`Plan revoked after refund: user=${userId}`);
        }
        break;
      }

      // ---------- ABONAMENT ANULAT ----------
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = typeof sub?.customer === "string" ? sub.customer : null;
        const userId = await findUserByCustomer(customerId);
        if (userId) {
          await revokePlan(userId);
          console.log(`Abonament anulat, plan revocat: user=${userId}`);
        }
        break;
      }

      // ---------- SUBSCRIPTION PAYMENT FAILED ----------
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = typeof invoice?.customer === "string" ? invoice.customer : null;
        const userId = await findUserByCustomer(customerId);
        if (userId) {
          console.warn(`Subscription payment failed for user=${userId} — plan is not changed automatically`);
        }
        break;
      }

      default:
        // Ignore the remaining events, but confirm receipt
        break;
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("Eroare la procesarea webhook-ului:", err);
    // Return 200 so Stripe does not retry forever on logic errors
    return jsonResponse({ received: true, warning: "processed with errors" });
  }
}

// React Router requires a default export for a `page.jsx` route.
// Nobody visits this page in a browser (Stripe only sends POST).
export default function StripeWebhookPage() {
  return null;
}
