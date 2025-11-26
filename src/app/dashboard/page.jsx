import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  Plus, Calendar, Activity, Settings, 
  ShoppingBag, TicketPercent, ArrowRight, 
  Camera, MessageCircle, PawPrint, 
  Clock, FileText // <--- Am adăugat astea aici
} from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND ---
export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { pets: [], user: null };

  const pets = await sql`SELECT * FROM pets WHERE owner_id = ${userId}`;
  const user = await sql`SELECT name, plan FROM users WHERE id = ${userId}`;

  return { pets, user: user[0] };
}

// --- FRONTEND ---
export default function DashboardPage() {
  const { pets, user } = useLoaderData();

  return (
    <div className="min-h-screen bg-green-50/30 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* 1. HEADER */}
        <div className="flex items-center justify-between mb-10 mt-4">
            <Link to="/" className="group block cursor-pointer">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:bg-green-200 transition">
                        <PawPrint size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition">PetAssistant</h1>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1 font-bold uppercase tracking-wider group-hover:text-green-600 flex items-center gap-1 transition">
                    ← Go to Home
                </p>
            </Link>

            <div className="flex gap-3">
                <Link to="/settings" className="bg-white text-gray-600 px-4 py-2 rounded-lg font-bold text-xs border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition">
                    <Settings size={14} /> Settings
                </Link>
                <Link to="/scan" className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-green-700 flex items-center gap-2 transition">
                    <MessageCircle size={16} /> AI Chat / Scan
                </Link>
            </div>
        </div>

        {/* 2. GRILA PRINCIPALĂ DE ACȚIUNI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            
            {/* Add Pet */}
            <Link to="/pets/add" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="bg-green-50 p-4 rounded-full text-green-600 mb-4 group-hover:scale-110 transition">
                    <Plus size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Add Pet</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Register new</p>
            </Link>

            {/* Schedules */}
            <Link to="/schedules" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="bg-blue-50 p-4 rounded-full text-blue-500 mb-4 group-hover:scale-110 transition">
                    <Calendar size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Schedules</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Vets & Vaccines</p>
            </Link>

            {/* Health Logs */}
            <Link to="/health" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="bg-purple-50 p-4 rounded-full text-purple-500 mb-4 group-hover:scale-110 transition">
                    <Activity size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Health Log</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Records</p>
            </Link>

            {/* Smart Scan */}
            <Link to="/scan" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group relative overflow-hidden">
                <div className="bg-orange-50 p-4 rounded-full text-orange-500 mb-4 group-hover:scale-110 transition">
                    <Camera size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Smart Scan</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Food, Toys & Rx</p>
                <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-yellow-200">GOLD</span>
            </Link>

            {/* Pet Shop */}
            <Link to="/shop" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="bg-red-50 p-4 rounded-full text-red-500 mb-4 group-hover:scale-110 transition">
                    <ShoppingBag size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Pet Shop</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Daily Deals</p>
            </Link>

            {/* Coupons */}
            <Link to="/coupons" className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group">
                <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4 group-hover:scale-110 transition">
                    <TicketPercent size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Coupons</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">VIP Rewards</p>
            </Link>

        </div>

        {/* 3. SECTIUNEA DE JOS (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Stânga: My Pets */}
            <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-red-400">♥</span> My Pets
                    </h2>
                    <Link to="/pets/add" className="text-xs text-gray-400 hover:text-green-600 transition">+</Link>
                </div>

                <div className="space-y-3">
                    {pets.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                            <p className="text-xs text-gray-400">No pets yet.</p>
                        </div>
                    ) : (
                        pets.map(pet => (
                            <Link key={pet.id} to={`/pets/${pet.id}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 transition flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                                    {pet.image_url ? (
                                        <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg">🐾</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 truncate">{pet.name}</h4>
                                    <p className="text-[10px] text-gray-400 truncate uppercase">{pet.species}</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300" />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Dreapta: Upcoming & Logs */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Upcoming Care */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[180px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" /> Upcoming Care
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 cursor-pointer">Manage</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="bg-gray-50 p-3 rounded-xl text-gray-300 mb-2">
                            <Calendar size={24} />
                        </div>
                        <p className="text-xs text-gray-400">No upcoming tasks.</p>
                    </div>
                </div>

                {/* Recent Health Logs */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={14} className="text-purple-500" /> Recent Health Logs
                        </h3>
                    </div>
                    <div className="h-12 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center">
                        <p className="text-[10px] text-gray-300">No health records yet.</p>
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}