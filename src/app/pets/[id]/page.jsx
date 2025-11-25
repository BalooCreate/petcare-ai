import { useLoaderData, Link, Form, redirect } from "react-router";
import { ArrowLeft, PawPrint, FileText, Activity, Trash2, AlertTriangle, Zap, Hash, Pencil, Calendar, Weight, Dna } from "lucide-react";
import sql from "../../api/utils/sql";

// --- BACKEND: Read data ---
export async function loader({ params }) {
  try {
    const result = await sql`SELECT * FROM pets WHERE id = ${params.id}`;
    if (result.length === 0) throw new Response("Pet not found", { status: 404 });
    return { pet: result[0] };
  } catch (err) {
    throw new Response("Pet not found", { status: 404 });
  }
}

// --- BACKEND: Delete ---
export async function action({ params, request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await sql`DELETE FROM pets WHERE id = ${params.id}`;
    return redirect("/dashboard");
  }
}

// Helper pentru vârstă
function getAge(dateString) {
  if (!dateString) return "N/A";
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} years` : "<1 year";
}

// Helper pentru activitate (Iconiță + Text + Culoare)
function getActivityBadge(level) {
    switch (level) {
        case 'low': return { text: "Low / Chill", color: "bg-blue-100 text-blue-700", icon: "🛋️" };
        case 'high': return { text: "Hyper Active", color: "bg-orange-100 text-orange-700", icon: "⚡" };
        default: return { text: "Normal", color: "bg-green-100 text-green-700", icon: "🐕" };
    }
}

// --- FRONTEND: PET PROFILE ---
export default function PetProfilePage() {
  const { pet } = useLoaderData();
  const activityData = getActivityBadge(pet.activity_level);

  const handleDelete = (e) => {
    if (!window.confirm("Are you sure you want to delete this profile? This cannot be undone.")) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-800 flex justify-center pb-20">
      <div className="w-full max-w-6xl">
        
        {/* HEADER: Back Button */}
        <div className="mb-6 flex justify-between items-center">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-gray-500 hover:text-green-700 transition gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full border border-green-100 shadow-sm hover:shadow-md"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:block">
                Profile ID: #{pet.id.toString().slice(0,6)}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* --- LEFT COLUMN: IDENTITY CARD (4 cols) --- */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100 flex flex-col items-center text-center relative overflow-hidden">
                    
                    {/* Background decorativ */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-white z-0"></div>

                    {/* Imagine */}
                    <div className="relative z-10 w-44 h-44 rounded-full bg-white mb-4 overflow-hidden border-4 border-white shadow-lg ring-4 ring-green-50 flex items-center justify-center">
                        {pet.image_url ? (
                            <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                            <PawPrint size={64} className="text-gray-200" />
                        )}
                    </div>
                    
                    {/* Nume & Specie */}
                    <div className="relative z-10 mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 capitalize mb-1">{pet.name}</h1>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                           {pet.species === 'dog' ? '🐕 Dog' : pet.species === 'cat' ? '🐈 Cat' : pet.species}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="w-full grid grid-cols-3 gap-2 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 relative z-10">
                        <div className="text-center">
                            <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Breed</span>
                            <span className="block text-sm font-bold text-gray-700 truncate">{pet.breed || "-"}</span>
                        </div>
                        <div className="text-center border-l border-r border-gray-200 px-2">
                            <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Age</span>
                            <span className="block text-sm font-bold text-gray-700">{getAge(pet.birth_date)}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Weight</span>
                            <span className="block text-sm font-bold text-gray-700">{pet.weight} kg</span>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="w-full mt-8 space-y-3 relative z-10">
                        <Link 
                            to="edit" 
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-full font-bold transition shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5"
                        >
                            <Pencil size={18} /> Edit Profile
                        </Link>

                        <Form method="post" onSubmit={handleDelete}>
                            <input type="hidden" name="intent" value="delete" />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-bold py-3 rounded-full transition border border-transparent hover:border-red-100">
                                <Trash2 size={16} /> Delete Profile
                            </button>
                        </Form>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: DETAILS & HEALTH (8 cols) --- */}
            <div className="lg:col-span-8 space-y-6">
                 
                 {/* 1. Quick Info Cards Row */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Activity Level */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${activityData.color.split(' ')[0]}`}>
                            {activityData.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Activity Level</p>
                            <p className={`font-bold ${activityData.color.split(' ')[1]}`}>{activityData.text}</p>
                        </div>
                    </div>

                    {/* Microchip */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Hash size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Microchip ID</p>
                            <p className="font-bold text-gray-700 font-mono text-sm">{pet.chip_number || "Not Registered"}</p>
                        </div>
                    </div>
                 </div>

                 {/* 2. Allergies Card (Important) */}
                 <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="px-6 py-4 bg-red-50/50 border-b border-red-50 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" />
                        <h2 className="font-bold text-gray-800">Allergies & Sensitivities</h2>
                    </div>
                    <div className="p-6">
                        {pet.allergies ? (
                            <div className="flex flex-wrap gap-2">
                                {pet.allergies.split(',').map((alg, index) => (
                                    <span key={index} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm font-medium border border-red-100">
                                        {alg.trim()}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No known allergies recorded.</p>
                        )}
                    </div>
                 </div>

                 {/* 3. Medical Notes */}
                 <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden min-h-[200px]">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" />
                        <h2 className="font-bold text-gray-800">Medical Notes & History</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                           {pet.details || "No medical history or additional notes available for this pet."}
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}