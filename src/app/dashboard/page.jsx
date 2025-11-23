import { useLoaderData, Link, useNavigate } from "react-router";
import { 
  Plus, Calendar, Activity, MessageCircle, 
  Clock, PawPrint, FileText, Camera 
} from "lucide-react";
import sql from "../api/utils/sql"; 

// --- BACKEND ---
export async function loader({ request }) {
  try {
    // 1. Citim ID-ul din Cookie
    const cookieHeader = request.headers.get("Cookie");
    const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    // Dacă nu e logat, îl trimitem la Login
    if (!userId) return redirect("/login");

    // 2. Luăm DOAR animalele acestui utilizator (WHERE owner_id = userId)
    const pets = await sql`
      SELECT * FROM pets 
      WHERE owner_id = ${userId} 
      ORDER BY created_at DESC
    `;
    
    return { pets };
  } catch (err) {
    return { pets: [] };
  }
}

function getAge(dateString) {
  if (!dateString) return "";
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} years old` : "Baby";
}

// --- FRONTEND ---
export default function DashboardPage() {
  const { pets } = useLoaderData();

  const comingSoon = () => alert("Feature coming soon!");

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800 flex justify-center">
      
      <div className="w-full max-w-5xl space-y-8 mt-4">

        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
            
            {/* Link către Home */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="bg-green-100 p-2 rounded-lg">
                    <PawPrint className="text-green-600" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-none">PetAssistant</h1>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">GO TO HOME</p>
                </div>
            </Link>

            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 hidden sm:inline">Welcome, Owner</span>
                
                {/* Chat Button */}
                <button 
                    onClick={comingSoon}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-green-700 transition shadow-sm shadow-green-100"
                >
                    <MessageCircle size={14} /> AI Chat
                </button>
            </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. Add Pet */}
            <Link to="/pets/add" className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-md transition cursor-pointer group hover:-translate-y-0.5">
                <div className="bg-green-50 text-green-600 p-2.5 rounded-full mb-2 group-hover:bg-green-100 transition">
                    <Plus size={20} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Add Pet</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Register new</p>
            </Link>

            {/* 2. Schedules */}
            <Link to="/schedules" className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-md transition cursor-pointer hover:-translate-y-0.5">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full mb-2">
                    <Calendar size={20} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Schedules</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Vets & Vaccines</p>
            </Link>

            {/* 3. Health Log */}
            <div onClick={comingSoon} className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-md transition cursor-pointer hover:-translate-y-0.5">
                <div className="bg-purple-50 text-purple-600 p-2.5 rounded-full mb-2">
                    <Activity size={20} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Health Log</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Records</p>
            </div>

            {/* 4. SMART SCAN (GOLD) */}
            <Link to="/scan" className="bg-white p-4 rounded-xl border border-orange-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-md transition cursor-pointer hover:-translate-y-0.5 ring-1 ring-orange-50">
                <div className="bg-orange-50 text-orange-600 p-2.5 rounded-full mb-2">
                    <Camera size={20} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    Smart Scan <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-extrabold">GOLD</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Food, Toys & Rx</p>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* My Pets List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 lg:col-span-1 h-fit">
                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-red-400 text-xs">♥</span> My Pets
                    </h2>
                    <Link to="/pets/add" className="text-gray-300 hover:text-green-600 transition">
                        <Plus size={16} />
                    </Link>
                </div>

                <div className="space-y-2">
                    {pets.length === 0 ? (
                        <div className="text-center py-6 text-gray-300 text-xs">
                            No pets found.
                        </div>
                    ) : (
                        pets.map(pet => (
                            <Link 
                                to={`/pets/${pet.id}`} 
                                key={pet.id} 
                                className="flex items-center p-2 bg-gray-50 rounded-lg border border-transparent hover:border-green-100 hover:bg-green-50/50 transition cursor-pointer group"
                            >
                                <div className="h-9 w-9 rounded-full bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center mr-3">
                                    {pet.image_url ? (
                                        <img src={pet.image_url} alt={pet.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <PawPrint size={16} className="text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold text-gray-900 capitalize group-hover:text-green-700">{pet.name}</h3>
                                    <p className="text-[10px] text-gray-500">
                                        {pet.breed || pet.species} • {getAge(pet.birth_date)}
                                    </p>
                                </div>
                                <div className="text-gray-300 group-hover:text-green-500">&rarr;</div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Upcoming Care */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 lg:col-span-2">
                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" /> Upcoming Care
                    </h2>
                    <button className="text-[10px] text-blue-600 font-bold hover:underline">View All</button>
                </div>

                <div className="space-y-3">
                    {/* Demo Tasks */}
                    <div className="flex items-center justify-between p-3 border border-gray-50 bg-[#F8F9FA] rounded-lg hover:border-blue-100 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 p-1.5 rounded text-base">🐕</div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-900">Morning Walk</h3>
                                <p className="text-[10px] text-gray-500">Today, 08:00 AM</p>
                            </div>
                        </div>
                        <Clock size={14} className="text-gray-300" />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-50 bg-[#F8F9FA] rounded-lg hover:border-blue-100 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-1.5 rounded text-base">🥣</div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-900">Dinner Time</h3>
                                <p className="text-[10px] text-gray-500">Today, 06:00 PM</p>
                            </div>
                        </div>
                        <Clock size={14} className="text-gray-300" />
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="mt-6 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={14} className="text-purple-500" /> Recent Logs
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F8F9FA] rounded-lg border border-gray-50">
                        <div className="bg-white p-1.5 rounded shadow-sm text-red-500">
                            <Activity size={14} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-900">Annual Vaccination</h3>
                            <p className="text-[10px] text-gray-500">Rex • Nov 23, 11:58 AM</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}