import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  Plus, Calendar, Activity, Settings, 
  ShoppingBag, TicketPercent, ArrowRight, 
  Camera, MessageCircle, PawPrint, Clock, FileText 
} from "lucide-react";
import sql from "../../api/utils/sql";

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

// --- FRONTEND OPTIMIZAT MOBIL ---
export default function DashboardPage() {
  const { pets, user } = useLoaderData();

  return (
    <div className="min-h-screen bg-green-50/30 p-4 md:p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* 1. HEADER (Compact pe mobil) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
            
            {/* Logo & Home Link */}
            <div className="flex items-center justify-between">
                <Link to="/" className="group block cursor-pointer">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <PawPrint size={20} className="md:w-6 md:h-6" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">PetAssistant</h1>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 ml-1 font-bold uppercase tracking-wider">
                        ← Go to Home
                    </p>
                </Link>

                {/* Pe mobil, punem butoanele sub logo sau lângă, depinde de spațiu. 
                    Aici le punem într-un rând separat sub logo pe ecrane f. mici, sau dreapta pe tableta */}
            </div>

            {/* Butoane Acțiune (Settings & AI) - Optimizate să încapă */}
            <div className="flex gap-2 sm:gap-3">
                <Link to="/settings" className="flex-1 sm:flex-none justify-center bg-white text-gray-600 px-3 py-2.5 rounded-xl font-bold text-xs border border-gray-200 shadow-sm active:scale-95 transition flex items-center gap-1.5">
                    <Settings size={16} /> Settings
                </Link>
                <Link to="/scan" className="flex-1 sm:flex-none justify-center bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 active:scale-95 transition flex items-center gap-1.5">
                    <MessageCircle size={16} /> AI Chat
                </Link>
            </div>
        </div>

        {/* 2. GRILA PRINCIPALĂ (Carduri pătrate, nu lungi) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8">
            
            {/* Add Pet */}
            <Link to="/pets/add" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-green-50 p-3 md:p-4 rounded-full text-green-600 mb-2 md:mb-4">
                    <Plus size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Add Pet</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Register</p>
            </Link>

            {/* Schedules */}
            <Link to="/schedules" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-blue-50 p-3 md:p-4 rounded-full text-blue-500 mb-2 md:mb-4">
                    <Calendar size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Schedules</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Calendar</p>
            </Link>

            {/* Health Logs */}
            <Link to="/health" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-purple-50 p-3 md:p-4 rounded-full text-purple-500 mb-2 md:mb-4">
                    <Activity size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Health</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Records</p>
            </Link>

            {/* Smart Scan (Fără GOLD) */}
            <Link to="/scan" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-orange-50 p-3 md:p-4 rounded-full text-orange-500 mb-2 md:mb-4">
                    <Camera size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Smart Scan</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">AI Tool</p>
            </Link>

            {/* Pet Shop */}
            <Link to="/shop" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-red-50 p-3 md:p-4 rounded-full text-red-500 mb-2 md:mb-4">
                    <ShoppingBag size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Pet Shop</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deals</p>
            </Link>

            {/* Coupons */}
            <Link to="/coupons" className="bg-white p-4 md:p-8 rounded-2xl border border-green-100 shadow-sm active:scale-95 transition flex flex-col items-center text-center group aspect-square justify-center">
                <div className="bg-indigo-50 p-3 md:p-4 rounded-full text-indigo-500 mb-2 md:mb-4">
                    <TicketPercent size={20} className="md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Coupons</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rewards</p>
            </Link>

        </div>

        {/* 3. SECTIUNEA DE JOS (Listă) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stânga: My Pets */}
            <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-red-400">♥</span> My Pets
                    </h2>
                    <Link to="/pets/add" className="text-xs text-gray-400 hover:text-green-600 p-2 transition">+</Link>
                </div>

                <div className="space-y-3">
                    {pets.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center shadow-sm">
                            <p className="text-xs text-gray-400">No pets yet.</p>
                        </div>
                    ) : (
                        pets.map(pet => (
                            <Link key={pet.id} to={`/pets/${pet.id}`} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 transition flex items-center gap-4">
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
            <div className="lg:col-span-2 space-y-4">
                
                {/* Upcoming Care */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" /> Upcoming
                        </h3>
                        <span className="text-[10px] font-bold text-blue-600 cursor-pointer">View All</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 text-center">
                        <p className="text-[10px] text-gray-400">No upcoming tasks.</p>
                    </div>
                </div>

                {/* Recent Health Logs */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={14} className="text-purple-500" /> Recent Logs
                        </h3>
                    </div>
                    <div className="h-10 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center">
                        <p className="text-[10px] text-gray-300">Empty history.</p>
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}