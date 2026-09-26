import { Link } from "react-router";
import { X, Sparkles, Zap, Crown } from "lucide-react";

export default function SoftPaywall({ reason, limit, used, upgradeTo, onClose }) {
  const isFreeToStarter = upgradeTo === 'starter';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">You reached the free limit</h3>
              <p className="text-green-100 text-sm">{used}/{limit} folosite luna asta</p>
            </div>
          </div>
          <p className="text-green-50 text-sm mt-3 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h4 className="font-extrabold text-xl text-gray-900 mb-1">
              Unlock unlimited
            </h4>
            <p className="text-gray-500 text-sm">for a single one-time payment</p>
          </div>

          {/* Offer */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h5 className="font-bold text-gray-900">Starter Lifetime</h5>
                <p className="text-xs text-gray-500">One-time payment, lifetime access</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-gray-900">€29</span>
              <span className="text-sm text-gray-500 line-through">€120</span>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">-76%</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex gap-2"><span className="text-green-600">✓</span> 3 pets, 100 AI questions/month</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Unlimited scans, no ads</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Export PDF + suport prioritar</li>
            </ul>

            <Link 
              to="/pricing" 
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3.5 rounded-xl transition shadow-lg shadow-green-200"
            >
              Unlock for €29 lifetime 🚀
            </Link>
            <p className="text-[11px] text-center text-gray-400 mt-2.5">30-day guarantee • Secure Stripe payment</p>
          </div>

          {/* Secondary option */}
          <Link to="/pricing" className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2">
            See all plans →
          </Link>

          <button onClick={onClose} className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 mt-1">
            Continue with the free plan
          </button>
        </div>
      </div>
    </div>
  );
}

// Small inline banner variant
export function LimitBanner({ used, limit, type }) {
  const percentage = (used / limit) * 100;
  const isWarning = percentage >= 80;
  
  return (
    <div className={`rounded-xl p-3 border flex items-center justify-between gap-3 ${isWarning ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-gray-700">
            {type === 'ai' ? 'AI Chats' : 'Scans'}: {used}/{limit}
          </span>
          {isWarning && <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">ALMOST AT LIMIT</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${isWarning ? 'bg-orange-500' : 'bg-green-500'}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      {isWarning && (
        <Link to="/pricing" className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-black transition shrink-0">
          Upgrade €29
        </Link>
      )}
    </div>
  );
}
