import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, ShoppingBag, Clock, ExternalLink, 
  Flame, Search, Filter, X, Star 
} from "lucide-react";
import { useState, useEffect } from "react";
import sql from "../api/utils/sql";

// --- BACKEND ---
export async function loader() {
  // 1. Luăm Oferta Zilei
  const dailyDeal = await sql`SELECT * FROM products WHERE is_daily_deal = TRUE LIMIT 1`;
  
  // 2. Luăm toate celelalte produse
  const products = await sql`SELECT * FROM products WHERE is_daily_deal = FALSE ORDER BY id DESC`;

  return { deal: dailyDeal[0], allProducts: products };
}

// --- FRONTEND ---
export default function ShopPage() {
  const { deal, allProducts } = useLoaderData();
  const navigate = useNavigate();
  
  // Stare pentru Căutare și Filtrare
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [timeLeft, setTimeLeft] = useState("");

  // Categorii disponibile
  const categories = ["All", "Food", "Toys", "Tech", "Grooming"];

  // Logica de Filtrare
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Cronometru
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* 1. HEADER + SEARCH */}
        <div className="bg-white p-4 rounded-3xl border border-green-100 shadow-sm mb-8 sticky top-4 z-50">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Buton Back & Titlu */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => navigate("/dashboard")} className="bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 transition">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        Pet Shop <ShoppingBag size={20} className="text-green-600" />
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search toys, food, gear..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categorii (Scrollable) */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                            activeCategory === cat 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* 2. DAILY DEAL (Doar dacă nu se caută ceva specific) */}
        {deal && searchTerm === "" && activeCategory === "All" && (
            <div className="mb-10 bg-white rounded-[28px] border border-green-100 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-4 py-1 rounded-br-xl z-10 animate-pulse flex items-center gap-1">
                    <Flame size={12} /> FLASH SALE
                </div>
                
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-50 p-8 flex items-center justify-center">
                        <img src={deal.image_url} alt={deal.title} className="max-h-48 object-contain hover:scale-110 transition duration-500" />
                    </div>
                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-extrabold text-gray-900">{deal.title}</h2>
                            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1">
                                <Clock size={12} /> {timeLeft}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">{deal.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-400 line-through">{deal.old_price}</span>
                                <span className="text-3xl font-black text-gray-900">{deal.price}</span>
                            </div>
                            <a href={deal.affiliate_link} target="_blank" className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-1">
                                Buy Now <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 3. PRODUCT GRID */}
        <div className="mb-4 flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500" size={18} />
            <h3 className="font-bold text-gray-900">
                {searchTerm || activeCategory !== "All" ? "Search Results" : "Recommended For You"}
            </h3>
        </div>

        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <a 
                        key={product.id} 
                        href={product.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white p-4 rounded-3xl border border-green-100 shadow-sm hover:shadow-xl hover:border-green-200 transition flex flex-col h-full"
                    >
                        <div className="h-40 bg-gray-50 rounded-2xl flex items-center justify-center p-4 mb-4 group-hover:bg-green-50/30 transition">
                            <img src={product.image_url} alt={product.title} className="h-full object-contain group-hover:scale-110 transition duration-300" />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {product.category || "Item"}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-green-700 transition">
                                {product.title}
                            </h4>
                            <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                                <span className="font-extrabold text-lg text-gray-900">{product.price}</span>
                                <div className="bg-white border border-gray-200 p-2 rounded-full text-gray-400 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition">
                                    <ShoppingBag size={16} />
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-gray-400">No products found matching your filters.</p>
                <button onClick={() => {setSearchTerm(""); setActiveCategory("All");}} className="mt-2 text-green-600 font-bold text-sm hover:underline">
                    Clear Filters
                </button>
            </div>
        )}

      </div>
    </div>
  );
}