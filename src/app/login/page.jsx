import { Form, redirect, useActionData, Link } from "react-router";
import { PawPrint, Mail, Lock, LogIn } from "lucide-react";
// 👇 AICI ERA GREȘEALA: Doar două puncte (../), nu patru (../../)
import sql from "../api/utils/sql";

// --- BACKEND: Login Check ---
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

    // AICI E SCHIMBAREA: Setăm Cookie-ul cu ID-ul utilizatorului
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": `user_id=${user.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    });

    // 2. SUCCESS -> Redirect to Dashboard
    return redirect("/dashboard"); 

  } catch (err) {
    console.error(err);
    return { error: "Server error. Please try again." };
  }
}

// --- FRONTEND: Login Form ---
export default function LoginPage() {
  const actionData = useActionData();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 font-sans text-gray-800">
      
      <div className="mb-8 text-center">
        <Link to="/" className="bg-green-100 p-3 rounded-full inline-block mb-3 hover:bg-green-200 transition">
            <PawPrint className="text-green-600" size={32} />
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back!</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to access your Dashboard.</p>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-100 shadow-xl rounded-2xl p-8">
        
        {actionData?.error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 text-center">
              {actionData.error}
            </div>
        )}

        <Form method="post" className="space-y-5">
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                    </div>
                    <input type="email" name="email" placeholder="name@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white" required />
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-green-600 hover:underline">Forgot Password?</a>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                    </div>
                    <input type="password" name="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 focus:bg-white" required />
                </div>
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                Sign In <LogIn size={18} />
            </button>

        </Form>

        <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">Don't have an account?</p>
            <Link to="/signup" className="text-green-600 font-bold hover:underline text-sm">
                Sign Up Free
            </Link>
        </div>

      </div>
    </div>
  );
}