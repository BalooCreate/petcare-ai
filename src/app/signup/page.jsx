import { Form, redirect, useActionData, Link, useSearchParams } from "react-router";
import { PawPrint, User, Mail, Lock, ArrowRight, Gift, Zap, Shield, Clock } from "lucide-react";
import sql from "../api/utils/sql";
import Stripe from "stripe";

// Mapare planuri la Stripe Price IDs - PUNE ID-urile tale reale din Stripe Dashboard
// Pentru test, dacă nu ai ID-uri, va merge pe FREE automat
const STRIPE_PRICES = {
  // Abonamente lunare
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "price_1SXSTJGCoG5d3tHJm7Z4ilvP",
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_1SXSTjGCoG5d3tHJF1MjCqpm",
  // Plăți unice Lifetime - trebuie create ca Products de tip one-time în Stripe
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
    return { error: "Toate câmpurile sunt obligatorii!" };
  }

  // Validare email simplu
  if (!email.includes("@")) {
    return { error: "Email invalid!" };
  }

  try {
    // Verifică dacă există deja
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return { error: "Email deja înregistrat! Încearcă să te loghezi." };
    }

    // Determină planul final
    let finalPlan = "free";
    let planType = "free";
    
    if (planParam.includes("starter")) finalPlan = "starter";
    else if (planParam.includes("pro")) finalPlan = "pro";
    else finalPlan = "free";

    if (planParam.includes("lifetime")) planType = "lifetime";
    else if (planParam.includes("monthly")) planType = "monthly";
    else planType = "free";

    // === CAZUL 1: FREE FOREVER - FĂRĂ STRIPE, FĂRĂ CARD ===
    if (finalPlan === "free" || planParam === "free") {
      const newUser = await sql`
        INSERT INTO users (name, email, password, plan, plan_type, lifetime_paid)
        VALUES (${name}, ${email}, ${password}, 'free', 'free', false)
        RETURNING id
      `;
      const userId = newUser[0].id;

      // Creează și usage_limits
      try {
        await sql`
          INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
          VALUES (${userId}, 0, 0, NOW() + INTERVAL '1 month')
        `;
      } catch (e) {
        console.log("usage_limits table maybe not exists yet, skipping", e.message);
      }

      // Login automat + redirect la onboarding (adaugă animal)
      return redirect("/pets/add?welcome=true", {
        headers: {
          "Set-Cookie": `user_id=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`, // 30 zile
        },
      });
    }

    // === CAZUL 2: PLATĂ - STARTER / PRO LIFETIME SAU MONTHLY ===
    // Creează user cu status pending
    const newUser = await sql`
      INSERT INTO users (name, email, password, plan, plan_type, lifetime_paid)
      VALUES (${name}, ${email}, ${password}, ${finalPlan}, ${planType}, false)
      RETURNING id
    `;
    const userId = newUser[0].id;

    // Dacă nu avem cheie Stripe configurată, fallback la free (pentru dev)
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

    // LIFETIME = plată unică
    if (planType === "lifetime") {
      const priceId = STRIPE_PRICES[`${finalPlan}_lifetime`];
      
      // Dacă nu ai priceId pentru lifetime, creează un produs one-time dinamic de $29/$49
      const amount = finalPlan === "starter" ? 2900 : 4900; // în cenți
      const productName = finalPlan === "starter" ? "PetAssistant Starter - Lifetime" : "PetAssistant Pro Family - Lifetime";

      if (!priceId) {
        // Creăm sesiune cu preț dinamic
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment', // plată unică
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: productName,
                  description: finalPlan === "starter" 
                    ? "3 animale, 100 AI/lună, scan nelimitat, fără reclame, pe viață"
                    : "Animale nelimitate, AI nelimitat, share familie, pe viață"
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          customer_email: email,
          metadata: { userId: userId.toString(), plan: finalPlan, type: "lifetime" },
          success_url: `${baseUrl}/dashboard?upgrade=success&plan=${finalPlan}`,
          cancel_url: `${baseUrl}/pricing?cancelled=true`,
        });
      } else {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: email,
          metadata: { userId: userId.toString(), plan: finalPlan, type: "lifetime" },
          success_url: `${baseUrl}/dashboard?upgrade=success&plan=${finalPlan}`,
          cancel_url: `${baseUrl}/pricing?cancelled=true`,
        });
      }
    } else {
      // MONTHLY = abonament
      const priceId = STRIPE_PRICES[`${finalPlan}_monthly`] || STRIPE_PRICES.starter_monthly;
      
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email,
        metadata: { userId: userId.toString(), plan: finalPlan, type: "monthly" },
        success_url: `${baseUrl}/dashboard?upgrade=success&plan=${finalPlan}`,
        cancel_url: `${baseUrl}/pricing?cancelled=true`,
        // Fără trial, plată directă - dar poți adăuga trial_period_days: 7 dacă vrei
      });
    }

    return redirect(session.url);

  } catch (err) {
    console.error("Signup error:", err);
    return { error: "Eroare la înregistrare. Încearcă din nou. " + err.message };
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
  let planPrice = "$0";
  let planDetails = "Fără card, activare instant";
  
  if (isStarter && isLifetime) {
    planName = "Starter Lifetime";
    planPrice = "$29 pe viață";
    planDetails = "Plată unică, acces pe viață";
  } else if (isStarter) {
    planName = "Starter Monthly";
    planPrice = "$4.99/lună";
    planDetails = "Anulezi oricând";
  } else if (isPro && isLifetime) {
    planName = "Pro Family Lifetime";
    planPrice = "$49 pe viață";
    planDetails = "Animale nelimitate, pe viață";
  } else if (isPro) {
    planName = "Pro Family Monthly";
    planPrice = "$9.99/lună";
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
              <>Începe gratis în <br /><span className="text-green-600">20 secunde</span> 🐾</>
            ) : (
              <>Aproape gata! <br /><span className="text-green-600">{planName}</span> 🚀</>
            )}
          </h1>
          
          <p className="text-gray-500 mb-8">
            {isFree 
              ? "Fără card. Fără bătăi de cap. Creezi contul și adaugi primul animal instant."
              : `Ai ales ${planName} pentru ${planPrice}. Creează contul și vei fi redirecționat la plată securizată.`
            }
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-green-100 p-2 rounded-lg h-fit"><Gift size={18} className="text-green-600" /></div>
              <div><p className="font-bold text-sm">Fără card pentru Free</p><p className="text-xs text-gray-500">Planul gratuit nu expiră niciodată, nu cere card.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="bg-blue-100 p-2 rounded-lg h-fit"><Zap size={18} className="text-blue-600" /></div>
              <div><p className="font-bold text-sm">Setup în 20 secunde</p><p className="text-xs text-gray-500">Email, nume, parolă și ești în dashboard.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="bg-purple-100 p-2 rounded-lg h-fit"><Shield size={18} className="text-purple-600" /></div>
              <div><p className="font-bold text-sm">Date securizate</p><p className="text-xs text-gray-500">Criptate, nu le vindem, le poți exporta oricând.</p></div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-white rounded-2xl border shadow-sm">
            <div className="flex gap-1 text-yellow-400 mb-2">
              <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
            </div>
            <p className="text-sm text-gray-700 italic">“Am început gratis, după 2 zile am luat Lifetime $29. Best decision!”</p>
            <p className="text-xs font-bold mt-2">— Maria, 2 pisici • Starter Lifetime</p>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="w-full max-w-md mx-auto bg-white border border-green-100 shadow-2xl rounded-[2rem] p-8 relative overflow-hidden">
          {isFree ? (
            <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-[11px] font-bold text-center py-2 uppercase tracking-widest">
              🎉 Free Forever • Fără card necesar
            </div>
          ) : (
            <div className="absolute top-0 left-0 w-full bg-gray-900 text-white text-[11px] font-bold text-center py-2 uppercase tracking-widest flex items-center justify-center gap-2">
              <Zap size={12} className="text-orange-400" /> {planName} • {planPrice} • Plată securizată Stripe
            </div>
          )}
          
          <div className="text-center mb-6 mt-6">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <PawPrint className="text-green-600" size={28} />
              </div>
              <h2 className="text-2xl font-bold">
                {isFree ? "Creează cont gratuit" : `Creează cont • ${planName}`}
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
                  <input type="text" name="name" placeholder="Nume complet" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required />
              </div>
              <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="email" name="email" placeholder="Email" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required />
              </div>
              <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input type="password" name="password" placeholder="Parolă (min 6 caractere)" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-sm" required minLength={6} />
              </div>

              {isFree ? (
                <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 flex gap-2.5">
                    <Clock className="shrink-0 text-green-600 mt-0.5" size={16} />
                    <div className="text-xs text-green-800 leading-relaxed">
                      <strong>Ce se întâmplă după?</strong> Intri direct în dashboard și adaugi primul animal. Fără email de confirmare, fără card. Poți face upgrade oricând la $29 pe viață.
                    </div>
                </div>
              ) : (
                <div className="bg-gray-900 text-white p-3.5 rounded-xl flex gap-2.5">
                    <Shield className="shrink-0 text-orange-400 mt-0.5" size={16} />
                    <div className="text-xs leading-relaxed">
                      <strong className="text-white">Plată securizată prin Stripe</strong><br />
                      <span className="text-gray-400">Vei fi redirecționat la checkout. {isLifetime ? "Plată unică, acces pe viață." : "Abonament lunar, anulezi oricând."}</span>
                    </div>
                </div>
              )}

              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2 text-[15px]">
                  {isFree ? (
                    <>Începe Gratis Acum <ArrowRight size={18} /></>
                  ) : (
                    <>Continuă la Plată <ArrowRight size={18} /></>
                  )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-gray-400">
                  Prin înregistrare ești de acord cu <Link to="/terms" className="underline hover:text-gray-600">Termenii</Link> și <Link to="/privacy" className="underline hover:text-gray-600">Privacy</Link>
                </p>
              </div>
          </Form>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">Ai deja cont? <Link to="/login" className="text-green-600 font-bold hover:underline">Loghează-te</Link></p>
          </div>

          {isFree && (
            <div className="mt-4 text-center">
              <Link to="/pricing" className="text-xs text-gray-400 hover:text-gray-600">Vrei Lifetime $29? Vezi planurile →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
