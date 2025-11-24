import { Link } from "react-router";
import { ArrowLeft, Check, Star, Camera, Zap, ShieldCheck } from "lucide-react";

export default function UpgradePage() {
  
  // Funcție simulată de plată
  const handleUpgrade = (plan) => {
    alert(`Coming Soon: Această funcție va deschide Stripe pentru planul ${plan}.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Upgrade your <span className="text-green-600">Pack</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          You tried to access a Premium feature. Choose a plan below to unlock the full power of PetAssistant.
        </p>
      </div>

      {/* TABEL PREȚURI */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                
        {/* 1. THE CHIHUAHUA ($5) */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">The Chihuahua</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">$5</span>
                <span className="text-gray-400">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mb-8 h-10">Perfect for single pet owners who need the basics.</p>
            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> 1 Pet Profile</li>
                <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> Basic Health Log</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check size={18} /> No AI Analysis</li>
            </ul>
            <button onClick={() => handleUpgrade('Chihuahua')} className="block w-full py-3 px-6 text-center rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:border-green-600 hover:text-green-600 transition">
                Choose Chihuahua
            </button>
        </div>

        {/* 2. THE LABRADOR ($10) */}
        <div className="bg-white p-8 rounded-3xl border-2 border-green-500 shadow-xl relative z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
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
                <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Unlimited Reminders</li>
                <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Basic AI Chat</li>
            </ul>
            <button onClick={() => handleUpgrade('Labrador')} className="block w-full py-4 px-6 text-center rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                Choose Labrador
            </button>
        </div>

        {/* 3. THE GREAT DANE ($25) - TARGETUL NOSTRU */}
        <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
            
            <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Star size={16} fill="currentColor" /> The Great Dane
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$25</span>
                <span className="text-gray-400">/mo</span>
            </div>
            <p className="text-sm text-gray-400 mb-8 h-10">Ultimate protection. Required for Smart Scan.</p>
            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-200"><Check size={18} className="text-orange-400" /> <strong>Unlimited Pets</strong></li>
                <li className="flex items-center gap-3 text-sm text-gray-200"><Camera size={18} className="text-orange-400" /> <strong>Smart Scan AI</strong> (Unlocked)</li>
                <li className="flex items-center gap-3 text-sm text-gray-200"><Activity size={18} className="text-orange-400" /> 24/7 Emergency Vet Finder</li>
                <li className="flex items-center gap-3 text-sm text-gray-200"><ShieldCheck size={18} className="text-orange-400" /> Priority Support</li>
            </ul>
            <button onClick={() => handleUpgrade('Great Dane')} className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-900/50">
                Unlock Great Dane
            </button>
        </div>

      </div>
    </div>
  );
}