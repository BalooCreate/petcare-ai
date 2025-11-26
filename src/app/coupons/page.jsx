import { useLoaderData, Link, Form } from "react-router";
import { ArrowLeft, Lock, Copy, ExternalLink, Crown, CheckCircle } from "lucide-react";
import { useState } from "react";
import sql from "../../api/utils/sql";

// ⚠️ ID-ul planului de $25 din Stripe (cel pus în Pricing)
// Trebuie să fie identic cu ce ai pus în baza de date la 'plan' sau în Stripe
const VIP_PLAN_ID = "price_1SXSTjGCoG5d3tHJF1MjCqpm"; 

export async function loader({ request }) {
  // 1. Identificăm userul
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { isVip: false, coupons: [] };

  // 2. Verificăm ce plan are userul
  const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  const userPlan = userResult[0]?.plan;

  // Verificăm dacă e planul de $25 (Great Dane)
  // Nota: Uneori Stripe pune ID-ul, alteori tu pui text. Verificăm ambele.
  const isVip = userPlan === VIP_PLAN_ID || userPlan === 'greatdane';

  // 3. Luăm cupoanele (doar dacă e VIP, altfel luăm doar câteva "fake" pt blur)
  let coupons = [];
  if (isVip) {
    coupons = await sql`SELECT * FROM coupons ORDER BY id DESC`;
  } else {
    // Date false doar ca să se vadă în spate la blur
    coupons = [
        { store_name: 'Chewy', discount_amount: '20%', description: 'Unlock to see code' },
        { store_name: 'Petco', discount_amount: '15%', description: 'Unlock to see code' },
        { store_name: 'BarkBox', discount_amount: 'FREE', description: 'Unlock to see code' },
    ];
  }

  return { isVip, coupons };
}

export default function CouponsPage() {
  const { isVip, coupons } = useLoaderData();
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
            <Link to="/dashboard" className="bg-gray-800 p-2 rounded-full border border-gray-700 hover:bg-gray-700 transition">
                <ArrowLeft size={20} className="text-gray-400" />
            </Link>
            <div className="text-right">
                <h1 className="text-2xl font-bold text-white flex items-center justify-end gap-2">
                    VIP Rewards <Crown className="text-yellow-500 fill-yellow-500" />
                </h1>
                <p className="text-xs text-gray-400">Exclusive discounts for Great Dane members</p>
            </div>
        </div>

        {/* ZONA PRINCIPALA */}
        <div className="relative">
            
            {/* BLUR OVERLAY (Dacă NU e VIP) */}
            {!isVip && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-gray-900/60 flex flex-col items-center justify-center rounded-3xl border border-gray-700 p-8 text-center">
                    <div className="bg-gray-800 p-6 rounded-full mb-6 shadow-2xl shadow-yellow-900/20 border border-gray-700">
                        <Lock size={48} className="text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Unlock $500+ in Savings</h2>
                    <p className="text-gray-300 max-w-md mb-8">
                        Upgrade to the <strong>Great Dane Plan ($25/mo)</strong> to access exclusive coupon codes for Chewy, Petco, and Amazon.
                    </p>
                    <Link to="/pricing" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-10 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                        Upgrade Now <Crown size={18} />
                    </Link>
                </div>
            )}

            {/* GRID CUPOANE */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!isVip ? 'opacity-20 pointer-events-none select-none' : ''}`}>
                {coupons.map((coupon, index) => (
                    <div key={index} className="bg-gray-800 rounded-2xl p-0 overflow-hidden border border-gray-700 flex flex-col shadow-lg">
                        
                        {/* Partea de Sus: Logo & Discount */}
                        <div className={`p-6 ${coupon.logo_bg_color || 'bg-blue-600'} flex justify-between items-center`}>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">
                                {coupon.store_name}
                            </h3>
                            <div className="bg-white text-black px-3 py-1 rounded-lg font-bold shadow-sm">
                                {coupon.discount_amount} OFF
                            </div>
                        </div>

                        {/* Partea de Jos: Detalii & Cod */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <p className="text-gray-300 text-sm mb-6">
                                {coupon.description}
                            </p>

                            {isVip ? (
                                <div className="flex gap-3">
                                    {/* Zona Cod - Click to Copy */}
                                    <div className="flex-1 bg-black/30 border border-gray-600 border-dashed rounded-lg p-3 flex items-center justify-between relative group cursor-pointer hover:bg-black/50 transition"
                                         onClick={() => copyToClipboard(coupon.code, index)}>
                                        <span className="font-mono text-yellow-400 font-bold tracking-widest">
                                            {coupon.code}
                                        </span>
                                        {copiedId === index ? (
                                            <span className="text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Copied</span>
                                        ) : (
                                            <Copy size={16} className="text-gray-500 group-hover:text-white transition" />
                                        )}
                                    </div>

                                    {/* Buton Link */}
                                    <a href={coupon.link} target="_blank" className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition flex items-center justify-center">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            ) : (
                                // Placeholder vizual pentru cei fără acces
                                <div className="h-12 bg-gray-700 rounded-lg animate-pulse"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
      </div>
    </div>
  );
}