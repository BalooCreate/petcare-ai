import { useLoaderData, Link, Form, redirect } from "react-router";
import { ArrowLeft, PawPrint, FileText, Activity, Trash2, AlertTriangle, Zap, Hash, Pencil } from "lucide-react";
import sql from "../../api/utils/sql"; // Ensure the path is correct

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

// Function to calculate age
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

  const handleDelete = (e) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center pb-20">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-gray-500 hover:text-green-600 transition gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                ID: #{pet.id.toString().slice(0,6)}...
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COL 1: MAIN CARD */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center sticky top-6">
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
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Breed</span>
                            <span className="font-bold text-gray-700">{pet.breed || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Weight</span>
                            <span className="font-bold text-gray-700">{pet.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Age</span>
                            <span className="font-bold text-gray-700">{getAge(pet.birth_date)}</span>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="w-full mt-6 space-y-3">
                        {/* EDIT BUTTON */}
                        <Link 
                            to="edit" 
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                        >
                            <Pencil size={18} /> Edit Profile
                        </Link>

                        {/* DELETE BUTTON */}
                        <Form method="post" onSubmit={handleDelete}>
                            <input type="hidden" name="intent" value="delete" />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold py-3 hover:bg-red-50 rounded-xl transition">
                                <Trash2 size={16} /> Delete Profile
                            </button>
                        </Form>
                    </div>
                </div>
            </div>

            {/* COL 2: DETAILS */}
            <div className="lg:col-span-2 space-y-6">
                 {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <Activity size={20} /> Details
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600">
                           {pet.details || "There are no medical notes at the moment."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
