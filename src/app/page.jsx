import { Link } from "react-router";
import { PawPrint, Calendar, Activity, ShieldCheck, Check, Star, Camera, MessageCircle, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* 1. NAVBAR */}
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
             Get Started
           </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="text-center pt-20 pb-24 px-6 bg-gradient-to-b from-white to-green-50/30">
         <div className="flex justify-center mb-4 text-green-500 gap-2 animate-bounce">
            <PawPrint size={20} /> <span className="text-pink-400">♥</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
           Your Pet's <br/> <span className="text-green-600">Smart Assistant</span>
         </h1>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
           Manage pet care routines, track health records, and get AI-powered advice to keep your furry friends happy and healthy.
         </p>
         
         <div className="flex justify-center gap-4">
            <Link to="/signup" className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-xl shadow-green-200 transform hover:-translate-y-1">
               Go to Dashboard
            </Link>
            <button className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
               Learn More
            </button>
         </div>

         <div className="mt-10 flex justify-center gap-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
            <span className="flex items-center gap-1">★ 10,000+ Happy Parents</span>
            <span className="flex items-center gap-1">★ 4.9/5 App Rating</span>
         </div>
      </div>

      {/* 3. FEATURES GRID */}
      <div className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Everything Your Pet Needs</h2>
                <p className="text-gray-500 mt-2">From daily care reminders to emergency health advice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 mb-6 shadow-sm">
                      <Calendar size={24} />
                   </div>
                   <h3 className="font-bold text-lg mb-2">Smart Scheduling</h3>
                   <p className="text-sm text-gray-500">Never miss feeding time, walks, or vet appointments with intelligent reminders.</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                      <MessageCircle size={24} />
                   </div>
                   <h3 className="font-bold text-lg mb-2">AI Pet Assistant</h3>
                   <p className="text-sm text-gray-500">Get instant answers to pet care questions from our AI-powered chatbot.</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 mb-6 shadow-sm">
                      <Activity size={24} />
                   </div>
                   <h3 className="font-bold text-lg mb-2">Health Tracking</h3>
                   <p className="text-sm text-gray-500">Log symptoms, medications, and vet visits with photo documentation.</p>
                </div>

                {/* Feature 4 */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
                      <ShieldCheck size={24} />
                   </div>
                   <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                   <p className="text-sm text-gray-500">Your pet's data is encrypted and protected with enterprise-grade security.</p>
                </div>
            </div>
         </div>
      </div>

      {/* 4. TESTIMONIALS */}
      <div className="bg-gray-50 py-20 px-6 border-y border-gray-100">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Loved by Pet Parents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
                    <p className="text-sm text-gray-600 italic">"PetAssistant helped me keep track of my dog's medication schedule. Life changing!"</p>
                    <p className="text-xs font-bold mt-4">- Sarah M.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
                    <p className="text-sm text-gray-600 italic">"The AI chatbot answered my cat's behavior questions instantly. Amazing."</p>
                    <p className="text-xs font-bold mt-4">- Mike R.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-yellow-400 text-xs mb-2">★★★★★</div>
                    <p className="text-sm text-gray-600 italic">"Finally all my pet's health records in one place. So convenient."</p>
                    <p className="text-xs font-bold mt-4">- Elena T.</p>
                </div>
            </div>
         </div>
      </div>

      {/* 5. PRICING SECTION (AICI ESTE TABELUL CERUT) */}
      <div className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
                    Choose Your Pack <span className="text-3xl">🐶</span>
                </h2>
                <p className="text-gray-500 mt-4">Simple pricing tailored to your pet family size.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* --- THE CHIHUAHUA --- */}
                <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition">
                    <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">The Chihuahua</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-gray-900">$5</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 h-10">Perfect for single pet owners who need the basics.</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> 1 Pet Profile</li>
                        <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> Basic Health Log</li>
                        <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> Reminders</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} className="text-gray-300" /> No AI Analysis</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:border-green-600 hover:text-green-600 transition">
                        Select Plan
                    </Link>
                </div>

                {/* --- THE LABRADOR --- */}
                <div className="bg-white p-8 rounded-3xl border-2 border-green-500 shadow-xl transform scale-105 relative z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                        Most Popular
                    </div>
                    <h3 className="text-lg font-bold text-green-600 uppercase tracking-widest mb-2">The Labrador</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-extrabold text-gray-900">$10</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 h-10">Great for growing families with active pets.</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Up to 3 Pets</li>
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Full Health History</li>
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Unlimited Reminders</li>
                        <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Basic AI Chat</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-4 px-6 text-center rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                        Start Free Trial
                    </Link>
                </div>

                {/* --- THE GREAT DANE (GOLD) --- */}
                <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
                    
                    <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Star size={16} fill="currentColor" /> The Great Dane
                    </h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-extrabold text-white">$25</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-8 h-10">Ultimate protection & AI tools for serious pet parents.</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Check size={18} className="text-orange-400" /> <strong>Unlimited Pets</strong></li>
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Camera size={18} className="text-orange-400" /> <strong>Smart Scan AI</strong> (Food, Rx, Toys)</li>
                        <li className="flex items-center gap-3 text-sm text-gray-200"><Activity size={18} className="text-orange-400" /> 24/7 Emergency Vet Finder</li>
                        <li className="flex items-center gap-3 text-sm text-gray-200"><ShieldCheck size={18} className="text-orange-400" /> Priority Support</li>
                    </ul>
                    <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-900/50">
                        Get Gold Access
                    </Link>
                </div>

            </div>
         </div>
      </div>

      {/* 6. FOOTER (VERDE) */}
      <div className="bg-green-600 text-white py-20 text-center px-6">
         <h2 className="text-3xl font-bold mb-4">Ready to Give Your Pet the Best Care?</h2>
         <p className="text-green-100 mb-8 max-w-xl mx-auto">Join thousands of pet parents who trust PetAssistant for their pet's health and happiness.</p>
         <Link to="/signup" className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-lg inline-block">
            Start Your Free Trial 🐾
         </Link>
      </div>

      <div className="bg-gray-900 text-gray-500 py-8 text-center text-xs border-t border-gray-800">
         <p>© 2025 PetAssistant. All rights reserved. Built with ♥ for pet lovers.</p>
      </div>

    </div>
  );
}