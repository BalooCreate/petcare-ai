import { useLoaderData, Link, redirect } from "react-router";
import {
  Plus,
  Calendar,
  Activity,
  MessageCircle,
  Clock,
  PawPrint,
  FileText,
  Camera,
  Settings,
} from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND ---
export async function loader({ request }) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    if (!userId) return redirect("/login");

    const pets = await sql`
      SELECT * FROM pets 
      WHERE owner_id = ${userId} 
      ORDER BY created_at DESC
    `;

    const schedules = await sql`
      SELECT * FROM schedules 
      ORDER BY date ASC 
      LIMIT 3
    `;

    return { pets, schedules };
  } catch {
    return { pets: [], schedules: [] };
  }
}

function getAge(dateString) {
  if (!dateString) return "";
  const today = new Date();
  const birth = new Date(dateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? `${age} years old` : "Baby";
}

// --- FRONTEND ---
export default function DashboardPage() {
  const { pets, schedules } = useLoaderData();

  return (
    <div className="min-h-screen bg-[#F1FFF6] p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-5xl space-y-10 mt-4">

        {/* HEADER */}
        <div className="flex justify-between items-end pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <div className="bg-green-100 p-2 rounded-lg shadow-sm">
              <PawPrint className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">PetAssistant</h1>
              <p className="text-[10px] text-gray-400 font-medium mt-1">GO TO HOME</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-xs font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Settings size={14} /> Settings
            </Link>

            <Link
              to="/chat"
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-green-700 shadow-md"
            >
              <MessageCircle size={14} /> AI Chat
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Add Pet */}
          <Link className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition flex flex-col items-center text-center hover:-translate-y-1"
            to="/pets/add"
          >
            <div className="bg-green-50 text-green-600 p-3 rounded-full mb-2 group-hover:bg-green-100">
              <Plus size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Add Pet</h3>
            <p className="text-[10px] text-gray-400">Register new</p>
          </Link>

          {/* Schedules */}
          <Link className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition flex flex-col items-center text-center hover:-translate-y-1"
            to="/schedules"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-2">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Schedules</h3>
            <p className="text-[10px] text-gray-400">Vets & Vaccines</p>
          </Link>

          {/* Health */}
          <Link className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition flex flex-col items-center text-center hover:-translate-y-1"
            to="/health"
          >
            <div className="bg-purple-50 text-purple-600 p-3 rounded-full mb-2">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Health Log</h3>
            <p className="text-[10px] text-gray-400">Records</p>
          </Link>

          {/* Scan */}
          <Link className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-orange-200 transition flex flex-col items-center text-center hover:-translate-y-1"
            to="/scan"
          >
            <div className="bg-orange-50 text-orange-600 p-3 rounded-full mb-2">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">
              Smart Scan{" "}
              <span className="text-[8px] bg-orange-200 px-1 rounded font-bold">GOLD</span>
            </h3>
            <p className="text-[10px] text-gray-400">Food, Toys & Rx</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --- MY PETS --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-4 pb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="text-red-400 text-xs">♥</span> My Pets
              </h2>
              <Link to="/pets/add" className="text-gray-300 hover:text-green-600">
                <Plus size={16} />
              </Link>
            </div>

            <div className="space-y-2">
              {pets.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs bg-green-50 rounded-lg border border-dashed border-green-200">
                  No pets yet. Click + to add one.
                </div>
              ) : (
                pets.map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/pets/${pet.id}`}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center mr-3">
                      {pet.image_url ? (
                        <img src={pet.image_url} className="h-full w-full object-cover" />
                      ) : (
                        <PawPrint size={16} className="text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-gray-900 capitalize">
                        {pet.name}
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        {pet.breed || pet.species} • {getAge(pet.birth_date)}
                      </p>
                    </div>

                    <div className="text-gray-300 group-hover:text-green-600">&rarr;</div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* --- UPCOMING CARE --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
            <div className="flex justify-between items-center mb-4 pb-2">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Upcoming Care
              </h2>
              <Link className="text-[10px] text-blue-600 font-bold" to="/schedules">
                Manage
              </Link>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <Calendar size={24} className="mx-auto mb-2 text-gray-300" />
                No upcoming tasks.
              </div>
            ) : (
              schedules.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between mb-2"
                >
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{item.title}</h4>
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Logs */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                <FileText size={14} className="text-purple-500" /> Recent Health Logs
              </h2>
              <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-[10px] text-gray-400 text-center">
                No health records yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
