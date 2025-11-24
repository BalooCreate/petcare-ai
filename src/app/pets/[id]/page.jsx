import { useLoaderData, Link, Form, redirect } from "react-router";
import { ArrowLeft, Weight, Calendar, PawPrint, FileText, Activity, Trash2, AlertTriangle, Zap, Hash } from "lucide-react";
import sql from "../../api/utils/sql"; 

// --- BACKEND: Loader & Action ---
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

// AICI ESTE LOGICA DE ȘTERGERE
export async function action({ params, request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const petId = params.id;
    await sql`DELETE FROM pets WHERE id = ${petId}`;
    // După ștergere, ne întoarcem la Dashboard
    return redirect("/dashboard");
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

  const handleDelete = (e) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this pet? This cannot be undone.");
    if (!confirmDelete) {
      e.preventDefault(); // Oprim ștergerea dacă utilizatorul zice Cancel
    }
  };

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

                    {/* DELETE BUTTON (Design Nou) */}
                    <Form method="post" onSubmit={handleDelete} className="w-full mt-6">
                        <input type="hidden" name="intent" value="delete" />
                        <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold py-3 hover:bg-red-50 rounded-xl transition">
                            <Trash2 size={16} /> Remove Profile
                        </button>
                    </Form>
                </div>
            </div>

            {/* COL 2: DETAILS */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* CARD: SAFETY INFO */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle size={20} /> Critical Health Info
                        </h2>
                        <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase">Important</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Microchip Number</label>
                            <p className="text-gray-700 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-2">
                                <Hash size={16} className="text-gray-400" />
                                {pet.chip_number || "Not registered"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CARD: LIFESTYLE */}
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

                {/* CARD: VACCINES */}
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
}// src/app/pets/[id]/page.jsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PawPrint, FileText, Activity, Trash2, AlertTriangle, Zap, Hash } from "lucide-react";

// Funcție ajutătoare pentru vârstă
function getAge(birthDate) {
  if (!birthDate) return "N/A";
  const today = new Date();
  const birth = new Date(birthDate); // Asigură-te că e obiect Date
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? `${age} years` : "<1 year";
}

export default async function PetProfilePage({ params }) {
  // 1. Verificăm utilizatorul
  const session = await auth();
  if (!session) redirect("/login");

  // 2. Luăm datele animalului din Baza de Date (Prisma)
  const pet = await prisma.pet.findUnique({
    where: { id: params.id },
  });

  // Dacă animalul nu există sau nu e al tău, întoarce-te la Dashboard
  if (!pet || pet.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // 3. Acțiunea de Ștergere (Server Action)
  async function deletePet() {
    "use server";
    await prisma.pet.delete({ where: { id: pet.id } });
    redirect("/dashboard");
  }

  // --- INTERFAȚA (UI) ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center pb-20">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
            <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 transition gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 hover:shadow-sm">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Pet ID: #{pet.id.slice(0,8)}...
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COL 1: MAIN CARD (Stânga) */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center sticky top-6">
                    {/* Photo */}
                    <div className="w-40 h-40 rounded-full bg-gray-50 mb-6 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center relative">
                        {pet.imageUrl ? (
                            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
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
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Rasă</span>
                            <span className="font-bold text-gray-700">{pet.breed || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Greutate</span>
                            <span className="font-bold text-gray-700">{pet.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase font-bold flex items-center gap-2">Vârstă</span>
                            <span className="font-bold text-gray-700">{pet.age} ani</span>
                        </div>
                    </div>

                    {/* BUTOANELE DE ACȚIUNE */}
                    <div className="w-full mt-6 space-y-3">
                        {/* Butonul EDITARE (Nou) */}
                        <Link 
                            href={`/pets/${pet.id}/edit`}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
                        >
                            ✏️ Editează Profilul
                        </Link>

                        {/* Butonul ȘTERGERE */}
                        <form action={deletePet}>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold py-3 hover:bg-red-50 rounded-xl transition">
                                <Trash2 size={16} /> Șterge Profilul
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* COL 2: DETALII (Dreapta) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Info Sănătate (Alergii & Microcip) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle size={20} /> Info Sănătate Critic
                        </h2>
                        <span className="bg-white text-red-600 text-[10px] font-bold px-2 py-1 rounded border border-red-100 uppercase">Important</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Alergii Cunoscute</label>
                            {/* Momentan nu avem câmp 'allergies' în DB, punem placeholder sau îl adăugăm în schema mai târziu */}
                            <p className="text-gray-400 italic bg-gray-50 p-3 rounded-lg">Nu sunt specificate.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Microcip</label>
                            <p className="text-gray-700 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-2">
                                <Hash size={16} className="text-gray-400" />
                                Nerecunoscut
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stil de Viață & Note Medicale */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nivel Activitate</label>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-green-100 text-green-700">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 capitalize block">
                                        Energie Normală
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Stil de viață echilibrat.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-50 pt-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> Note Medicale
                        </h2>
                        <div className="bg-blue-50/50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-blue-100">
                            {/* Aici folosim câmpul de descriere pe post de note, sau un text standard */}
                            Nu există note medicale adăugate încă.
                        </div>
                    </div>
                </div>

                {/* Vaccinuri */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-80 hover:opacity-100 transition">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={20} className="text-purple-500" /> Istoric Vaccinare
                        </h2>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200 uppercase font-bold">În curând</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-1/3 opacity-30"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Urmărește vaccinurile automat.</p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}