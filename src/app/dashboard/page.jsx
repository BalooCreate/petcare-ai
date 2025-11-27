import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  Plus, Calendar, Activity, Settings, 
  ShoppingBag, TicketPercent, ArrowRight, 
  Camera, MessageCircle, PawPrint, Clock, FileText 
} from "lucide-react";
import sql from "../api/utils/sql"; // Am corectat calea (../../) ca sa fim siguri
import InstallBanner from "../../components/InstallBanner"; // <--- IMPORTUL NOII COMPONENTE

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

// --- FRONTEND COMPACT (DASHBOARD REAL) ---
export default function DashboardPage() {
  const { pets, user } = useLoaderData();

  return (
    <div className="min-h-screen bg-green-50/30 p-4 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        
        {/* 1. HEADER COMPACT */}
        <div className="flex items-center justify-between mb-6 mt-2">
            <Link to="/" className="group block cursor-pointer">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <PawPrint size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">PetAssistant</h1>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 ml-1 font-bold uppercase tracking-wider">
                    ← Home
                </p>
            </Link>

            <div className="flex gap-2">
                <Link to="/settings" className="bg-white text-gray-600 px-3 py-1.5 rounded-lg font-bold text-xs border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition">
                    <Settings size={14} /> Settings
                </Link>
                <Link to="/scan" className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-green-700 flex items-center gap-2 transition">
                    <MessageCircle size={14} /> AI Chat
                </Link>
            </div>
        </div>

        {/* === 🆕 BUTONUL DE INSTALARE APLICAȚIE === */}
        {/* Apare doar dacă telefonul permite instalarea */}
        <InstallBanner />
        {/* ========================================= */}

        {/* 2. GRILA DE ACȚIUNI (6 BUTOANE COMPACTE) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            
            {/* Add Pet */}
            <Link to="/pets/add" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-green-50 p-3 rounded-full text-green-600 group-hover:scale-110 transition">
                    <Plus size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Add Pet</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">New Profile</p>
                </div>
            </Link>

            {/* Schedules */}
            <Link to="/schedules" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-blue-50 p-3 rounded-full text-blue-500 group-hover:scale-110 transition">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Schedules</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Calendar</p>
                </div>
            </Link>

            {/* Health Logs */}
            <Link to="/health" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-purple-50 p-3 rounded-full text-purple-500 group-hover:scale-110 transition">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Health Log</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Records</p>
                </div>
            </Link>

            {/* Smart Scan */}
            <Link to="/scan" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 group-hover:scale-110 transition">
                    <Camera size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Smart Scan</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">AI Tool</p>
                </div>
            </Link>

            {/* Pet Shop */}
            <Link to="/shop" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-red-50 p-3 rounded-full text-red-500 group-hover:scale-110 transition">
                    <ShoppingBag size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Pet Shop</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Daily Deals</p>
                </div>
            </Link>

            {/* Coupons */}
            <Link to="/coupons" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-500 group-hover:scale-110 transition">
                    <TicketPercent size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Coupons</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rewards</p>
                </div>
            </Link>

        </div>

        {/* 3. INFO SECUNDARE (Split View Compact) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stânga: My Pets */}
            <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-red-400">♥</span> My Pets
                    </h2>
                    <Link to="/pets/add" className="text-xs text-gray-400 hover:text-green-600 transition font-bold">+</Link>
                </div>

                <div className="space-y-2">
                    {pets.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No pets added.</p>
                    ) : (
                        pets.map(pet => (
                            <Link key={pet.id} to={`/pets/${pet.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center overflow-hidden shrink-0">
                                    {pet.image_url ? <img src={pet.image_url} className="w-full h-full object-cover"/> : "🐾"}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-gray-800 truncate">{pet.name}</h4>
                                </div>
                                <ArrowRight size={12} className="text-gray-300 ml-auto" />
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Dreapta: Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                    <div className="flex justify-center mb-2 text-blue-500"><Clock size={20} /></div>
                    <h3 className="text-xs font-bold text-gray-900">Upcoming</h3>
                    <p className="text-[10px] text-gray-400">No tasks.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                    <div className="flex justify-center mb-2 text-purple-500"><FileText size={20} /></div>
                    <h3 className="text-xs font-bold text-gray-900">Logs</h3>
                    <p className="text-[10px] text-gray-400">Empty.</p>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}