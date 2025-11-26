import { useLoaderData, Link } from "react-router";
import { ArrowLeft, ShoppingBag, Clock, ExternalLink, Flame, Tag, Star } from "lucide-react";
import { useState, useEffect } from "react";
import sql from "../../api/utils/sql";

// --- BACKEND: Luăm produsele ---
export async function loader() {
  // 1. Luăm Oferta Zilei (Daily Deal)
  const dailyDeal = await sql`SELECT * FROM products WHERE is_daily_deal = TRUE LIMIT 1`;
  
  // 2. Luăm restul recomandărilor
  const recommendations = await sql`SELECT * FROM products WHERE is_daily_deal = FALSE`;

  return { deal: dailyDeal[0], products: recommendations };
}

// --- FRONTEND ---
export default function ShopPage() {
  const { deal, products } = useLoaderData();
  const [timeLeft, setTimeLeft] = useState("");

  // Logica Cronometrului (Numără până la miezul nopții)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Următorul miez de noapte
      const diff = tomorrow - now;

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm">
                <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">Pet Shop 🛍️</h1>
                <p className="text-xs text-gray-500">Curated deals for your furry friend</p>
            </div>
        </div>

        {/* 1. ZONA DEAL OF THE DAY (24H) */}
        {deal && (
            <div className="mb-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-1 shadow-xl transform hover:scale-[1.01] transition duration-300">
                <div className="bg-white rounded-[22px] overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Imagine Produs */}
                    <div className="md:w-1/2 bg-white p-8 flex items-center justify-center relative">
                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                            <Flame size={12} /> HOT DEAL
                        </div>
                        <img src={deal.image_url} alt={deal.title} className="max-h-64 object-contain hover:scale-110 transition duration-500" />
                    </div>

                    {/* Detalii & Timer */}
                    <div className="md:w-1/2 p-8 flex flex-col justify-center bg-orange-50/30">
                        <div className="flex items-center gap-2 text-orange-600 font-bold mb-2 text-sm">
                            <Clock size={16} /> Offer ends in: <span className="font-mono bg-orange-100 px-2 rounded">{timeLeft}</span>
                        </div>
                        
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{deal.title}</h2>
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">{deal.description}</p>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-extrabold text-gray-900">{deal.price}</span>
                            <span className="text-lg text-gray-400 line-through mb-1">{deal.old_price}</span>
                        </div>

                        <a 
                            href={deal.affiliate_link} 
                            target="_blank" 
                            rel="noopener noreferrer" // Important pentru afiliere
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition"
                        >
                            Grab this Deal <ExternalLink size={18} />
                        </a>
                        <p className="text-[10px] text-center text-gray-400 mt-3">We earn a commission if you buy via this link.</p>
                    </div>
                </div>
            </div>
        )}

        {/* 2. RECOMANDĂRI GENERALE (Grid) */}
        <div className="flex items-center gap-2 mb-6">
            <Star className="text-yellow-500 fill-yellow-500" size={20} />
            <h3 className="text-xl font-bold text-gray-900">Top Picks for You</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <a 
                    key={product.id} 
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden flex flex-col"
                >
                    <div className="h-48 p-6 flex items-center justify-center bg-gray-50 group-hover:bg-white transition">
                        <img src={product.image_url} alt={product.title} className="h-full object-contain group-hover:scale-110 transition duration-300" />
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-1">
                            <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                {product.category || "General"}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition">
                            {product.title}
                        </h4>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">{product.old_price}</span>
                                <span className="text-lg font-bold text-gray-900">{product.price}</span>
                            </div>
                            <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:bg-green-600 transition">
                                <ShoppingBag size={18} />
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>

      </div>
    </div>
  );
}