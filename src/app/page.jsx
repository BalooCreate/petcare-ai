import { Link } from "react-router";
import { PawPrint, Calendar, Activity, ShieldCheck, Check, Star, Camera, MessageCircle, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="flex items-center gap-2">
           <div className="bg-green-100 p-2 rounded-lg">
             <PawPrint className="text-green-600" size={24} />
           </div>
           <span className="font-extrabold text-xl tracking-tight text-gray-900">PetAssistant</span>
        </div>
        <div className="flex gap-4">
           <Link to="/login" className="px-5 py-2.5 font-bold text-sm text-gray-600 hover:text-green-600 transition">
             Log In
           </Link>
           <Link to="/signup" className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100">
             Start Free Trial
           </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="text-center pt-20 pb-24 px-6 bg-gradient-to-b from-white to-green-50/30">
         <div className="flex justify-center mb-4 text-green-500 gap-2 animate-bounce">
            <PawPrint size={20} /> <span className="text-pink-400">♥</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
           Your Pet's <br/> <span className="text-green-600">Smart Assistant</span>
         </h1>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
           Manage pet care routines, track health records, and get AI-powered advice. <br/>
           <span className="font-bold text-gray-800">Try it risk-free for 14 days.</span>
         </p>
         
         <div className="flex justify-center gap-4">
            <Link to="/signup" className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-xl shadow-green-200 transform hover:-translate-y-1">
               Start 14-Day Free Trial
            </Link>
         </div>
      </div>

      {/* FEATURES */}
      <div className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
                <p className="text-gray-500 mt-2">Premium tools for your furry friend.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Icons section same as before - simplified for brevity */}
                <div className="bg-gray-50 p-6 rounded-2xl"><Calendar className="text-green-600 mb-4" /> <h3 className="font-bold">Smart Scheduling</h3></div>
                <div className="bg-gray-50 p-6 rounded-2xl"><MessageCircle className="text-blue-600 mb-4" /> <h3 className="font-bold">AI Assistant</h3></div>
                <div className="bg-gray-50 p-6 rounded-2xl"><Activity className="text-purple-600 mb-4" /> <h3 className="font-bold">Health Tracking</h3></div>
                <div className="bg-gray-50 p-6 rounded-2xl"><ShieldCheck className="text-orange-600 mb-4" /> <h3 className="font-bold">Secure Data</h3></div>
            </div>
         </div>
      </div>

      {/* PRICING SECTION - UPDATED FOR TRIAL */}
      <div className="py-24 px-6 bg-white border-t border-gray-100">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
                    Choose Your Pack <span className="text-3xl">🐶</span>
                </h2>
                <p className="text-gray-500 mt-4">
                    All plans include a <span className="font-bold text-green-600">14-day free trial</span>. Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* THE CHIHUAHUA */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition">
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">The Chihuahua</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-extrabold text-gray-900">$5</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-600 font-bold mb-6">Billed after 14 days</p>
                    
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> 1 Pet Profile</li>
                        <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> Basic Health Log</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:border-green-600 hover:text-green-600 transition">
                        Try Free for 14 Days
                    </Link>
                </div>

                {/* THE LABRADOR */}
                <div className="bg-white p-8 rounded-3xl border-2 border-green-500 shadow-xl transform scale-105 relative z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Most Popular
                    </div>
                    <h3 className="text-lg font-bold text-green-600 uppercase tracking-widest mb-2">The Labrador</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-5xl font-extrabold text-gray-900">$10</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-600 font-bold mb-6">Billed after 14 days</p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Up to 3 Pets</li>
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Basic AI Chat</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-4 px-6 text-center rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                        Start 14-Day Free Trial
                    </Link>
                </div>

                {/* THE GREAT DANE */}
                <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800 text-white relative overflow-hidden">
                    <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Star size={16} fill="currentColor" /> The Great Dane
                    </h3>
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-extrabold text-white">$25</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-xs text-orange-400 font-bold mb-6">Billed after 14 days</p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Check size={18} className="text-orange-400" /> <strong>Unlimited Pets</strong></li>
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Camera size={18} className="text-orange-400" /> <strong>Smart Scan AI</strong></li>
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Activity size={18} className="text-orange-400" /> 24/7 Emergency Vet</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg">
                        Start 14-Day Free Trial
                    </Link>
                </div>

            </div>
         </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white py-12 text-center border-t border-gray-100">
         <p className="text-gray-400 text-sm">© 2025 PetAssistant.</p>
      </div>

    </div>
  );
}