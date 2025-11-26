import { Link } from "react-router";
import { Check, ArrowLeft } from "lucide-react";

// ⚠️ AICI PUI ID-URILE TALE REALE DIN STRIPE
const PLANS = {
    chihuahua: "prod_TURLZhcdEAEapC", // ID-ul pentru $5
    labrador: "prod_TURMS8jigGelIr",  // ID-ul pentru $10
    greatdane: "prod_TURMm5LotWLcdB"  // ID-ul pentru $25
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center py-20">
      <div className="w-full max-w-6xl">
        
        <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-600 mb-6 bg-white px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Choose Your Pack 🐾</h1>
            <p className="text-lg text-gray-500">Start with a <span className="text-green-600 font-bold">14-Day Free Trial</span>. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PLAN $5 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition hover:-translate-y-1">
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">The Chihuahua</h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">$5</span><span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-gray-600">
                    <li className="flex gap-3"><Check size={18} className="text-green-500" /> 1 Pet Profile</li>
                    <li className="flex gap-3"><Check size={18} className="text-green-500" /> Basic Health Log</li>
                </ul>
                <Link to={`/signup?plan=${PLANS.chihuahua}`} className="block w-full py-3 text-center border-2 border-green-600 text-green-700 font-bold rounded-xl hover:bg-green-50 transition">
                    Try Free (14 Days)
                </Link>
            </div>

            {/* PLAN $10 */}
            <div className="bg-white p-8 rounded-3xl border-2 border-green-500 shadow-2xl relative transform md:scale-105">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Most Popular</div>
                <h3 className="text-green-600 font-bold text-xs uppercase tracking-widest mb-2">The Labrador</h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">$10</span><span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-gray-600">
                    <li className="flex gap-3"><Check size={18} className="text-green-500" /> Up to 3 Pets</li>
                    <li className="flex gap-3"><Check size={18} className="text-green-500" /> AI Scanner & Alerts</li>
                </ul>
                <Link to={`/signup?plan=${PLANS.labrador}`} className="block w-full py-3 text-center bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition">
                    Start 14-Day Free Trial
                </Link>
            </div>

            {/* PLAN $25 */}
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 text-gray-300">
                <h3 className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-2">The Great Dane</h3>
                <div className="flex items-baseline gap-1 mb-6 text-white">
                    <span className="text-4xl font-extrabold">$25</span><span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm">
                    <li className="flex gap-3"><Check size={18} className="text-orange-500" /> Unlimited Pets</li>
                    <li className="flex gap-3"><Check size={18} className="text-orange-500" /> 24/7 Vet AI Priority</li>
                </ul>
                <Link to={`/signup?plan=${PLANS.greatdane}`} className="block w-full py-3 text-center bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition">
                    Start 14-Day Free Trial
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}