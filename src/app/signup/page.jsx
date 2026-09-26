import { Form, redirect, useActionData, Link, useSearchParams } from "react-router";
import { PawPrint, User, Mail, Lock, ArrowRight, Gift, Zap, Shield, Clock } from "lucide-react";
import sql from "../api/utils/sql";
import Stripe from "stripe";
import { ensureSchema } from "../../lib/usage.js";

// Optional Stripe Price IDs, set as environment variables in Render:
//   STRIPE_PRICE_STARTER_MONTHLY, STRIPE_PRICE_PRO_MONTHLY,
//   STRIPE_PRICE_STARTER_LIFETIME, STRIPE_PRICE_PRO_LIFETIME
//
// ALL OF THEM ARE OPTIONAL. If a variable is missing, the price is built inline at
// checkout time (the product is created by Stripe on the fly), so the site sells with
// zero setup in the Stripe dashboard. Setting them only makes reporting tidier.
//
// NOTE: no hardcoded price IDs here on purpose - a leftover test-mode price would break
// checkout when a live key is used ("No such price").
const STRIPE_PRICES = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  starter_lifetime: process.env.STRIPE_PRICE_STARTER_LIFETIME,
  pro_lifetime: process.env.STRIPE_PRICE_PRO_LIFETIME,
};

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan") || "free";

  if (!email || !password || !name) {
    return { error: "All fields are required!" };
  }

  // Validare email simplu
  if (!email.includes("@")) {
    return { error: "Email invalid!" };
  }

  try {
    // Make sure the freemium columns exist before we INSERT into users.
    // (Fixes: `column "plan_type" of relation "users" does not exist`)
    await ensureSchema();

    // Check if the account already exists
    const existingUser = await sql`SELECT id, password FROM users WHERE email = ${email}`;
    let userId = null;
    let isExistingUser = false;

    if (existingUser.length > 0) {
      // Existing account: allow UPGRADE (not a new account) only if password matches
      const isPaidRequest = planParam.includes("starter") || planParam.includes("pro");
      if (!isPaidRequest) {
        return { error: "Email already registered! Try logging in instead." };
      }
      if (String(existingUser[0].password) !== String(password)) {
        return { error: "An account with this email already exists. The password does not match." };
      }
      userId = existingUser[0].id;
      isExistingUser = true;
    }

    // Determine the final plan
    let finalPlan = "free";
    let planType = "free";
    
    if (planParam.includes("starter")) finalPlan = "starter";
    else if (planParam.includes("pro")) finalPlan = "pro";
    else finalPlan = "free";

    if (planParam.includes("lifetime")) planType = "lifetime";
    else if (planParam.includes("monthly")) planType = "monthly";
    else planType = "free";

    // === CASE 1: FREE FOREVER - NO STRIPE, NO CARD ===
    if (finalPlan === "free" || planParam === "free") {
      const newUser = await sql`
        INSERT INTO users (name, email, password, plan, plan_type, lifetime_paid)
        VALUES (${name}, ${email}, ${password}, 'free', 'free', false)
        RETURNING id
      `;
      const userId = newUser[0].id;

      // Also create usage_limits row
      try {
        await sql`
          INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
          VALUES (${userId}, 0, 0, NOW() + INTERVAL '1 month')
        `;
      } catch (e) {
        console.log("usage_limits table maybe not exists yet, skipping", e.message);
      }

      // Auto-login + redirect to onboarding (add a pet)
      return redirect("/pets/add?welcome=true", {
        headers: {
          "Set-Cookie": `user_id=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`, // 30 zile
        },
      });
    }

    // === CASE 2: PAYMENT - STARTER / PRO LIFETIME OR MONTHLY ===
    // SECURITY: the account is created on FREE. The paid plan is activated
    // ONLY after payment confirmation (see the /dashboard loader).
    if (!isExistingUser) {
      const newUser = await sql`
        INSERT INTO users (name, email, password, plan, plan_type, lifetime_paid)
        VALUES (${name}, ${email}, ${password}, 'free', 'pending', false)
        RETURNING id
      `;
      userId = newUser[0].id;

      try {
        await sql`
          INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
          VALUES (${userId}, 0, 0, NOW() + INTERVAL '1 month')
          ON CONFLICT (user_id) DO NOTHING
        `;
      } catch (e) {
        console.log("usage_limits table maybe not exists yet, skipping", e.message);
      }
    }

    // If no Stripe key is configured, fall back to free (for dev)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("STRIPE_SECRET_KEY missing, fallback to free");
      return redirect("/dashboard", {
        headers: {
          "Set-Cookie": `user_id=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.VITE_APP_URL || "https://petassists.com";

    let session;

    // LIFETIME = one-time payment
    if (planType === "lifetime") {
      const priceId = STRIPE_PRICES[`${finalPlan}_lifetime`];
      
      // Without a lifetime priceId, create a dynamic one-time price of €29/€49
      const amount = finalPlan === "starter" ? 2900 : 4900; // in cents
      const productName = finalPlan === "starter" ? "PetAssistant Starter - Lifetime" : "PetAssistant Pro Family - Lifetime";

      if (!priceId) {
        // Create session with dynamic price
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment', // one-time payment
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: productName,
                  description: finalPlan === "starter" 
                    ? "3 pets, 100 AI questions/month, unlimited scans, no ads, lifetime access"
                    : "Unlimited pets, unlimited AI, family sharing, lifetime access"
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          customer_email: email,
          metadata: { userId: userId.toString(), plan: finalPlan, type: "lifetime" },
          success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${finalPlan}`,
          cancel_url: `${baseUrl}/pricing?cancelled=true`,
        });
      } else {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: email,
          metadata: { userId: userId.toString(), plan: finalPlan, type: "lifetime" },
          success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${finalPlan}`,
          cancel_url: `${baseUrl}/pricing?cancelled=true`,
        });
      }
    } else {
      // MONTHLY = subscription.
      // If STRIPE_PRICE_*_MONTHLY is configured we use that price; otherwise the subscription
      // price is built inline so the site works with NO product set up in Stripe.
      const priceId = STRIPE_PRICES[`${finalPlan}_monthly`];
      const monthlyAmount = finalPlan === "pro" ? 999 : 499; // cents: €9.99 / €4.99
      const monthlyName = finalPlan === "pro"
        ? "PetAssistant Pro Family - Monthly"
        : "PetAssistant Starter - Monthly";
      const monthlyDescription = finalPlan === "pro"
        ? "Unlimited pets, unlimited AI, family sharing"
        : "3 pets, 100 AI questions/month, unlimited scans, no ads";

      const monthlyCommon = {
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        metadata: { userId: userId.toString(), plan: finalPlan, type: "monthly" },
        subscription_data: {
          metadata: { userId: userId.toString(), plan: finalPlan, type: "monthly" },
        },
        success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${finalPlan}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        // No trial, direct payment - you can add trial_period_days: 7 if you want
      };

      session = await stripe.checkout.sessions.create(priceId ? {
        ...monthlyCommon,
        line_items: [{ price: priceId, quantity: 1 }],
      } : {
        ...monthlyCommon,
        line_items: [{
          price_data: {
            currency: 'eur',
            unit_amount: monthlyAmount,
            recurring: { interval: 'month' },
            product_data: { name: monthlyName, description: monthlyDescription },
          },
          quantity: 1,
        }],
      });
    }

    return redirect(session.url);

  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Registration failed. Please try again. " + err.message };
  }
}

export default function SignupPage() {
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  const isFree = plan === "free" || !plan.includes("starter") && !plan.includes("pro");
  const isStarter = plan.includes("starter");
  const isPro = plan.includes("pro");
  const isLifetime = plan.includes("lifetime");

  let planName = "Free Forever";
  let planPrice = "€0";
  let planDetails = "No card, instant activation";
  
  if (isStarter && isLifetime) {
    planName = "Starter Lifetime";
    planPrice = "€29 lifetime";
    planDetails = "One-time payment, lifetime access";
  } else if (isStarter) {
    planName = "Starter Monthly";
    planPrice = "€4.99/month";
    planDetails = "Cancel anytime";
  } else if (isPro && isLifetime) {
    planName = "Pro Family Lifetime";
    planPrice = "€49 lifetime";
    planDetails = "Unlimited pets, lifetime access";
  } else if (isPro) {
    planName = "Pro Family Monthly";
    planPrice = "€9.99/month";
    planDetails = "Totul nelimitat";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center items-center p-4 font-sans text-gray-800">
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* LEFT - BENEFITS */}
        <div className="hidden md:block p-8">
          <Link to="/" className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border text-xs font-bold text-gray-600 mb-8 hover:text-green-600">
            <PawPrint size={16} className="text-green-600" /> PetAssistant • Free Forever
          </Link>
          
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            {isFree ? (
              <>Start free in <br /><span className="text-green-600">20 seconds</span> 🐾</>
            ) : (
              <>Almost done! <br /><span className="text-green-600">{planName}</span> 🚀</>
            )}
          </h1>
          
          <p className="text-gray-500 mb-8">
            {isFree 
              ? "No card. No hassle. Create your account and add your first pet instantly."
              : `You chose ${planName} for ${planPrice}. Create your account and you will be redirected to secure checkout.`
            }
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-green-100 p-2 rounded-lg h-fit"><Gift size={18} className="text-green-600" /></div>
              <div><p className="font-bold text-sm">No card for Free</p><p className="text-xs text-gray-500">The free plan never expires and never asks for a card.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="bg-blue-100 p-2 rounded-lg h-fit"><Zap size={18} className="text-blue-600" /></div>
              <div><p className="font-bold text-sm">Set up in 20 seconds</p><p className="text-xs text-gray-500">Email, name, password and you are in your dashboard.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="bg-purple-100 p-2 rounded-lg h-fit"><Shield size={18} className="text-purple-600" /></div>
              <div><p className="font-bold text-sm">Secure data</p><p className="text-xs text-gray-500">Encrypted, never sold, exportable anytime.</p></div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-white rounded-2xl border shadow-sm">
            <div className="flex gap-1 text-yellow-400 mb-2">
              <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
            </div>
            <p className="text-sm text-gray-700 italic">“I started free, and 2 days later I got the €29 Lifetime. Best decision!”</p>
            <p className="text-xs font-bold mt-2">— Maria, 2 cats • Starter Lifetime</p>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="w-full max-w-md mx-auto bg-white border border-green-100 shadow-2xl rounded-[2rem] p-8 relative overflow-hidden">
          {isFree ? (
            <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-[11px] font-bold text-center py-2 uppercase tracking-widest">
              🎉 Free Forever • No credit card needed
            </div>
          ) : (
            <div className="absolute top-0 left-0 w-full bg-gray-900 text-white text-[11px] font-bold text-center py-2 uppercase tracking-widest flex items-center justify-center gap-2">
              <Zap size={12} className="text-orange-400" /> {planName} • {planPrice} • Secure Stripe payment
            </div>
          )}
          
          <div className="text-center mb-6 mt-6">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <PawPrint className="text-green-600" size={28} />
              </div>
              <h2 className="text-2xl font-bold">
                {isFree ? "Create free account" : `Create account • ${planName}`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{planDetails}</p>
          </div>

          {actionData?.error && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm text-center border border-red-200 font-medium">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
              <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="text" name="name" placeholder="Full name" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required />
              </div>
              <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="email" name="email" placeholder="Email" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required />
              </div>
              <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="password" name="password" placeholder="Password (min 6 characters)" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required minLength={6} />
              </div>

              {isFree ? (
                <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 flex gap-2.5">
                    <Clock className="shrink-0 text-green-600 mt-0.5" size={16} />
                    <div className="text-xs text-green-800 leading-relaxed">
                      <strong>What happens next?</strong> You go straight to your dashboard and add your first pet. No confirmation email, no card. You can upgrade anytime to €29 lifetime.
                    </div>
                </div>
              ) : (
                <div className="bg-gray-900 text-white p-3.5 rounded-xl flex gap-2.5">
                    <Shield className="shrink-0 text-orange-400 mt-0.5" size={16} />
                    <div className="text-xs leading-relaxed">
                      <strong className="text-white">Secure payment via Stripe</strong><br />
                      <span className="text-gray-400">You will be redirected to checkout. {isLifetime ? "One-time payment, lifetime access." : "Monthly subscription, cancel anytime."}</span>
                    </div>
                </div>
              )}

              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2 text-[15px]">
                  {isFree ? (
                    <>Start Free Now <ArrowRight size={18} /></>
                  ) : (
                    <>Continue to Payment <ArrowRight size={18} /></>
                  )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-gray-400">
                  By signing up you agree to our <Link to="/terms" className="underline hover:text-gray-600">Terms</Link> and <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
                </p>
              </div>
          </Form>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link></p>
          </div>

          {isFree && (
            <div className="mt-4 text-center">
              <Link to="/pricing" className="text-xs text-gray-400 hover:text-gray-600">Want Lifetime €29? See the plans →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
