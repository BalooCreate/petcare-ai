import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  Plus, Calendar, Activity, Settings, 
  ShoppingBag, TicketPercent, ArrowRight, ScanLine 
} from "lucide-react";
import sql from "../../api/utils/sql";

// --- BACKEND: Citim datele din baza de date ---
export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { pets: [], user: null };

  const pets = await sql`SELECT * FROM pets WHERE owner_id = ${userId}`;
  const user = await sql`SELECT name, plan FROM users WHERE id = ${userId}`;

  return { pets, user: user[0] };
}

// --- FRONTEND: Design-ul Paginii ---
export default function DashboardPage() {
  const { pets, user } = useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* 1. HEADER: Salut și Buton Adăugare */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Hello, {user?.name || "Friend"}! 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Welcome back to your pet care hub.</p>
            </div>
            <div className="flex gap-3">
                {/* Buton Rapid Scanare AI */}
                <Link 
                    to="/scan" 
                    className="bg-white text-green-700 border border-green-200 px-5 py-3 rounded-xl font-bold shadow-sm hover:shadow-md flex items-center gap-2 transition"
                >
                    <ScanLine size={20} /> AI Scan
                </Link>
                {/* Buton Adăugare Animal */}
                <Link 
                    to="/pets/add" 
                    className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} /> Add Pet
                </Link>
            </div>
        </div>

        {/* 2. MENIU RAPID (AICI SUNT BUTOANELE NOI!) */}
        <div className="mb-10">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Services & Rewards</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* BUTON 1: SHOP (Nou) */}
                <Link to="/shop" className="bg-white p-5 rounded-3xl border border-green-100 shadow-sm hover:shadow-md hover:border-orange-200 transition group flex flex-col items-center text-center gap-3">
                    <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 group-hover:scale-110 transition">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Pet Shop</h3>
                        <p className="text-[10px] text-gray-400 font-medium">Daily Deals</p>
                    </div>
                </Link>

                {/* BUTON 2: COUPONS (Nou) */}
                <Link to="/coupons" className="bg-white p-5 rounded-3xl border border-green-100 shadow-sm hover:shadow-md hover:border-purple-200 transition group flex flex-col items-center text-center gap-3">
                    <div className="bg-purple-50 p-3 rounded-2xl text-purple-500 group-hover:scale-110 transition">
                        <TicketPercent size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Coupons</h3>
                        <p className="text-[10px] text-gray-400 font-medium">VIP Rewards</p>
                    </div>
                </Link>

                {/* BUTON 3: HEALTH */}
                <Link to="/health" className="bg-white p-5 rounded-3xl border border-green-100 shadow-sm hover:shadow-md hover:border-blue-200 transition group flex flex-col items-center text-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-500 group-hover:scale-110 transition">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Health Logs</h3>
                        <p className="text-[10px] text-gray-400 font-medium">Medical History</p>
                    </div>
                </Link>

                {/* BUTON 4: SCHEDULES */}
                <Link to="/schedules" className="bg-white p-5 rounded-3xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition group flex flex-col items-center text-center gap-3">
                    <div className="bg-green-50 p-3 rounded-2xl text-green-600 group-hover:scale-110 transition">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Schedules</h3>
                        <p className="text-[10px] text-gray-400 font-medium">Calendar</p>
                    </div>
                </Link>

            </div>
        </div>

        {/* 3. LISTA ANIMALE */}
        <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">My Pets</h2>

            {pets.length === 0 ? (
                <div className="bg-white border border-dashed border-green-200 rounded-3xl p-8 text-center">
                    <p className="text-gray-400 text-sm mb-4">No pets added yet.</p>
                    <Link to="/pets/add" className="text-green-600 font-bold hover:underline">Add your first pet</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map(pet => (
                        <Link key={pet.id} to={`/pets/${pet.id}`} className="group bg-white p-5 rounded-3xl shadow-sm border border-green-100 hover:border-green-300 hover:shadow-md transition flex items-center gap-4 relative overflow-hidden">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                                {pet.image_url ? (
                                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">🐾</span>
                                )}
                            </div>
                            {/* Info */}
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition">{pet.name}</h3>
                                <p className="text-xs text-gray-500 capitalize">{pet.species} • {pet.breed || "-"}</p>
                            </div>
                            {/* Arrow */}
                            <div className="absolute right-5 text-gray-300 group-hover:text-green-500 transition">
                                <ArrowRight size={18} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>

        {/* 4. Footer Settings */}
        <div className="mt-12 flex justify-center border-t border-green-100 pt-6 pb-10">
             <Link to="/settings" className="text-gray-400 hover:text-gray-600 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition">
                <Settings size={14} /> Account Settings
             </Link>
        </div>

      </div>
    </div>
  );
}
