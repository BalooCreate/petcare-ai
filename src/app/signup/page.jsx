import { Form, redirect, useActionData, Link } from "react-router";
import { PawPrint, User, Mail, Lock, ArrowRight } from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND: Create Account (Neschimbat) ---
export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password || !name) {
    return { error: "All fields are required!" };
  }

  try {
    // 1. Check if email exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return { error: "This email is already registered!" };
    }

    // 2. Create user (Default plan: 'free')
    await sql`
      INSERT INTO users (name, email, password, plan)
      VALUES (${name}, ${email}, ${password}, 'free')
    `;

    // 3. Redirect to Login
    return redirect("/login");
  } catch (err) {
    console.error(err);
    return { error: "Error creating account. Please try again." };
  }
}

// --- FRONTEND: Sign Up Form (Modificat pentru tema Verde) ---
export default function SignupPage() {
  const actionData = useActionData();

  return (
    // 1. FUNDAL VERDE PAL
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="bg-white p-3 rounded-full inline-block mb-3 shadow-md border border-green-100">
            <PawPrint className="text-green-600" size={32} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Join PetAssistant</h1>
        <p className="text-sm text-gray-500 mt-2">Create an account to protect your pet's health.</p>
      </div>

      {/* 2. CARD STILIZAT */}
      <div className="w-full max-w-md bg-white border border-green-100 shadow-2xl rounded-3xl p-8">
        
        {actionData?.error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center font-medium">
              {actionData.error}
            </div>
        )}

        <Form method="post" className="space-y-5">
            
            {/* Name Input */}
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-green-600/60" /> {/* Iconiță verde */}
                    </div>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Alex Smith" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white" 
                        required 
                    />
                </div>
            </div>

            {/* Email Input */}
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-green-600/60" />
                    </div>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="alex@example.com" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white" 
                        required 
                    />
                </div>
            </div>

            {/* Password Input */}
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-green-600/60" />
                    </div>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white" 
                        required 
                    />
                </div>
            </div>

            {/* 3. BUTON ROTUNJIT (PILL) */}
            <button 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2"
            >
                Create Account <ArrowRight size={18} />
            </button>

        </Form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
            <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline text-sm transition">
                Sign In here
            </Link>
        </div>

      </div>
    </div>
  );
}