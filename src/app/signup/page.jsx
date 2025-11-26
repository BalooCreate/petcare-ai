import { Form, redirect, useActionData, Link } from "react-router";
import { PawPrint, User, Mail, Lock, ArrowRight, CreditCard } from "lucide-react";
import sql from "../api/utils/sql";
import Stripe from "stripe";

// --- BACKEND: Logică Stripe Trial ---
export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // 1. Luăm planul din URL (ex: ?plan=price_123...)
  const url = new URL(request.url);
  const planId = url.searchParams.get("plan"); 

  // Fallback: Dacă nu a ales plan, îi dăm pe cel mediu (LABRADOR). 
  // ⚠️ Înlocuiește cu ID-ul tău de la planul de $10
  const finalPriceId = planId || 'price_1SXSTJGCoG5d3tHJm7Z4ilvP'; 

  if (!email || !password || !name) return { error: "All fields are required!" };

  try {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) return { error: "Email already registered!" };

    // 2. Creăm userul (dar cu status 'pending')
    const newUser = await sql`
      INSERT INTO users (name, email, password, plan)
      VALUES (${name}, ${email}, ${password}, 'pending')
      RETURNING id
    `;
    const userId = newUser[0].id;

    // 3. Creăm sesiunea Stripe cu 14 zile GRATIS
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: finalPriceId, quantity: 1 }],
      subscription_data: { trial_period_days: 14 }, // AICI E CHEIA SUCCESULUI
      customer_email: email,
      metadata: { userId: userId.toString() },
      // Unde se întoarce după plată (modifică cu domeniul tău de Render)
      success_url: `https://petcare-ai-ib3h.onrender.com/login?trial=active`,
      cancel_url: `https://petcare-ai-ib3h.onrender.com/signup`,
    });

    return redirect(session.url);

  } catch (err) {
    console.error(err);
    return { error: "Error setup. Check Stripe keys." };
  }
}

// --- FRONTEND ---
export default function SignupPage() {
  const actionData = useActionData();
  return (
    <div className="min-h-screen bg-green-50/50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white border border-green-100 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full bg-green-100 text-green-800 text-[10px] font-bold text-center py-1 uppercase tracking-widest">
            Card Required for Free Trial
        </div>
        
        <div className="text-center mb-6 mt-4">
            <PawPrint className="text-green-600 mx-auto mb-2" size={32} />
            <h1 className="text-2xl font-bold">Start 14-Day Free Trial</h1>
        </div>

        {actionData?.error && <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center">{actionData.error}</div>}

        <Form method="post" className="space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-3 text-green-600/60" size={18} />
                <input type="text" name="name" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-green-600/60" size={18} />
                <input type="email" name="email" placeholder="Email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-green-600/60" size={18} />
                <input type="password" name="password" placeholder="Password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" required />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-500 flex gap-2">
                <CreditCard className="shrink-0 text-gray-400" size={16} />
                <p>Redirecting to secure payment. <strong>$0.00 charged today.</strong> Cancel anytime before day 14.</p>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2">
                Continue to Payment <ArrowRight size={18} />
            </button>
        </Form>
      </div>
    </div>
  );
}