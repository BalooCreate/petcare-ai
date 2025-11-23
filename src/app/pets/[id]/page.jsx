import { useLoaderData, Link } from "react-router";
import { ArrowLeft, Weight, Calendar, PawPrint, FileText, Activity, AlertTriangle, Zap, Hash } from "lucide-react";
import sql from "../../api/utils/sql"; 

// --- BACKEND ---
export async function loader({ params }) {
  try {
    const petId = params.id;
    const result = await sql`SELECT * FROM pets WHERE id = ${petId}`;
    if (result.length === 0) throw new Error("Pet not found");
    return { pet: result[0] };
  } catch (err) {
    throw new Response("Pet not found", { status: 404 });
  }
}

function getAge(dateString) {
  if (!dateString) return "N/A";
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} years` : "<1 year";
}

// --- FRONTEND ---
export default function PetProfilePage() {
  const { pet } = useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 transition gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Pet ID: #{pet.id}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COL 1: MAIN CARD */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center sticky top-6">
                    {/* Photo */}
                    <div className="w-40 h-40 rounded-full bg-gray-50 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative">
                        {pet.image_url ? (
                            <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                            <PawPrint size={56} className="text-gray-300" />
                        )}
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-1">{pet.name}</h1>
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-6 inline-block">
                        {pet.species}
                    </span>

                    <div className="w-full space-y-4 text-left bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">
                                Breed
                            </span>
                            <span className="font-bold text-gray-700">{pet.breed || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">
                                Weight
                            </span>
                            <span className="font-bold text-gray-700">{pet.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">
                                Age
                            </span>
                            <span className="font-bold text-gray-700">{getAge(pet.birth_date)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COL 2: HEALTH & GOLD INFO */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* CARD 1: ALERGII & SAFETY (CRITIC PENTRU GOLD) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle size={20} /> Critical Health Info
                        </h2>
                        <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase">Important</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Alergii */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Known Allergies</label>
                            {pet.allergies ? (
                                <p className="text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                    🚫 {pet.allergies}
                                </p>
                            ) : (
                                <p className="text-gray-400 italic bg-gray-50 p-3 rounded-lg">No known allergies.</p>
                            )}
                        </div>
                        {/* Microcip */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Microchip Number</label>
                            <p className="text-gray-700 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-2">
                                <Hash size={16} className="text-gray-400" />
                                {pet.chip_number || "Not registered"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CARD 2: LIFESTYLE & NOTES */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Activity Level</label>
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${
                                    pet.activity_level === 'high' ? 'bg-orange-100 text-orange-700' : 
                                    pet.activity_level === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 capitalize block">
                                        {pet.activity_level || "Normal"} Energy
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {pet.activity_level === 'high' ? 'Needs lots of play & walks!' : 
                                         pet.activity_level === 'low' ? 'Prefers relaxing naps.' : 'Balanced lifestyle.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-50 pt-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> Medical Notes
                        </h2>
                        <div className="bg-blue-50/50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-blue-100">
                            {pet.details ? pet.details : "No medical notes added yet."}
                        </div>
                    </div>
                </div>

                {/* CARD 3: VACCINES (Placeholder) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60 hover:opacity-100 transition">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-purple-500" /> Vaccination History
                        </h2>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200 uppercase font-bold">Coming Soon</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-1/3 opacity-30"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Track upcoming shots automatically.</p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}