import { Form, redirect, useActionData, Link } from "react-router";
import { PawPrint, Mail, Lock, LogIn } from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND: Login Check (Neschimbat) ---
export async function action({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) return { error: "Please enter email and password!" };

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
    
    if (users.length === 0) {
      return { error: "Invalid email or password." };
    }

    const user = users[0];

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": `user_id=${user.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    });

  } catch (err) {
    console.error(err);
    return { error: "Server error. Please try again." };
  }
}

// --- FRONTEND: Login Form (Modificat pentru tema Verde) ---
export default function LoginPage() {
  const actionData = useActionData();

  return (
    // 1. FUNDAL VERDE PAL (bg-green-50)
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      
      <div className="mb-8 text-center">
        <Link to="/" className="bg-white p-3 rounded-full inline-block mb-3 shadow-md hover:shadow-lg transition border border-green-100">
            {/* Iconița acum iese în evidență pe alb */}
            <PawPrint className="text-green-600" size={32} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Welcome Back!</h1>
        <p className="text-sm text-gray-500 mt-2">Sign in to access your Dashboard.</p>
      </div>

      {/* 2. CARD ALB CU CONTUR VERDE SUBTIL */}
      <div className="w-full max-w-md bg-white border border-green-100 shadow-2xl rounded-3xl p-8">
        
        {actionData?.error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 text-center font-medium">
              {actionData.error}
            </div>
        )}

        <Form method="post" className="space-y-5">
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-green-600/60" /> {/* Iconiță ușor verzuie */}
                    </div>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="name@example.com" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition focus:bg-white" 
                        required 
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1 ml-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-green-600 hover:text-green-700 font-semibold hover:underline">Forgot Password?</a>
                </div>
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

            {/* 3. BUTON VERDE COMPLET (Pill Shape) */}
            <button 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2"
            >
                Sign In <LogIn size={18} />
            </button>

        </Form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 mb-2">Don't have an account?</p>
            <Link to="/signup" className="text-green-600 font-bold hover:text-green-700 hover:underline text-sm transition">
                Create Free Account
            </Link>
        </div>

      </div>
    </div>
  );
}