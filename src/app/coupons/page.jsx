import { useLoaderData, Link } from "react-router";
import { ArrowLeft, Lock, Copy, ExternalLink, Crown, CheckCircle, TicketPercent } from "lucide-react";
import { useState } from "react";
import sql from "../api/utils/sql";

// ⚠️ ID-ul planului de $25 din Stripe
const VIP_PLAN_ID = "price_1SXSTjGCoG5d3tHJF1MjCqpm"; 

export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { isVip: false, coupons: [] };

  const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  const userPlan = userResult[0]?.plan;

  const isVip = userPlan === VIP_PLAN_ID || userPlan === 'greatdane';

  let coupons = [];
  if (isVip) {
    coupons = await sql`SELECT * FROM coupons ORDER BY id DESC`;
  } else {
    // Date false pentru efectul vizual din spate
    coupons = [
        { store_name: 'Chewy', discount_amount: '20%', description: 'Unlock to see code', logo_bg_color: 'bg-blue-600' },
        { store_name: 'Petco', discount_amount: '15%', description: 'Unlock to see code', logo_bg_color: 'bg-red-600' },
        { store_name: 'BarkBox', discount_amount: 'FREE', description: 'Unlock to see code', logo_bg_color: 'bg-blue-400' },
        { store_name: 'Amazon', discount_amount: '10%', description: 'Unlock to see code', logo_bg_color: 'bg-yellow-500' },
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
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        
        {/* HEADER */}
        <div className="bg-white p-4 rounded-3xl border border-green-100 shadow-sm mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 transition text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        VIP Rewards <Crown size={20} className="text-yellow-500 fill-yellow-500" />
                    </h1>
                    <p className="text-xs text-gray-500">Exclusive discounts for members</p>
                </div>
            </div>
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600 hidden sm:block">
                <TicketPercent size={24} />
            </div>
        </div>

        {/* ZONA PRINCIPALĂ */}
        <div className="relative">
            
            {/* BLUR OVERLAY (LOCK SCREEN) */}
            {!isVip && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center rounded-3xl border border-green-100 p-8 text-center">
                    <div className="bg-white p-6 rounded-full mb-6 shadow-xl border border-green-100">
                        <Lock size={48} className="text-green-600" />
                    </div>
                    
                    {/* 👇 AICI AM SCHIMBAT TEXTUL */}
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Unlock Exclusive Rewards</h2>
                    
                    <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                        Upgrade to the <strong>Great Dane Plan ($25/mo)</strong> to access exclusive coupon codes for Chewy, Petco, and Amazon.
                    </p>
                    <Link to="/pricing" className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                        Upgrade Now <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                    </Link>
                </div>
            )}

            {/* GRID CUPOANE */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!isVip ? 'opacity-40 pointer-events-none select-none grayscale-[0.5]' : ''}`}>
                {coupons.map((coupon, index) => (
                    <div key={index} className="bg-white rounded-3xl p-0 overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition flex flex-col">
                        
                        <div className={`p-6 ${coupon.logo_bg_color || 'bg-gray-100'} flex justify-between items-center`}>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">
                                {coupon.store_name}
                            </h3>
                            <div className="bg-white text-gray-900 px-3 py-1 rounded-lg font-bold shadow-sm text-sm border border-gray-100">
                                {coupon.discount_amount} OFF
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <p className="text-gray-600 text-sm mb-6 font-medium">
                                {coupon.description}
                            </p>

                            {isVip ? (
                                <div className="flex gap-3">
                                    <button 
                                        className="flex-1 bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-3 flex items-center justify-between group hover:bg-green-100 transition"
                                        onClick={() => copyToClipboard(coupon.code, index)}
                                    >
                                        <span className="font-mono text-green-700 font-bold tracking-widest text-lg">
                                            {coupon.code}
                                        </span>
                                        {copiedId === index ? (
                                            <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Copied</span>
                                        ) : (
                                            <Copy size={16} className="text-green-400 group-hover:text-green-600 transition" />
                                        )}
                                    </button>

                                    <a href={coupon.link} target="_blank" className="bg-gray-900 hover:bg-black text-white p-3.5 rounded-xl transition flex items-center justify-center shadow-md">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                            ) : (
                                <div className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
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