import { Form, useLoaderData, redirect, Link, useNavigate, useNavigation } from "react-router";
import { ArrowLeft, Save, PawPrint, Activity, ImageIcon, FileText } from "lucide-react";
import sql from "../../../api/utils/sql";

// 1. Încărcăm datele existente
export async function loader({ params }) {
  const result = await sql`SELECT * FROM pets WHERE id = ${params.id}`;
  if (!result.length) throw new Response("Not Found", { status: 404 });
  return { pet: result[0] };
}

// 2. Salvăm modificările (UPDATE)
export async function action({ request, params }) {
  const formData = await request.formData();
  
  const name = formData.get("name");
  const species = formData.get("species");
  const breed = formData.get("breed");
  const weight = formData.get("weight");
  const image_url = formData.get("image_url");
  const details = formData.get("details");

  await sql`
    UPDATE pets 
    SET 
      name = ${name},
      species = ${species},
      breed = ${breed},
      weight = ${weight},
      image_url = ${image_url},
      details = ${details}
    WHERE id = ${params.id}
  `;

  return redirect(`/pets/${params.id}`);
}

// 3. Formularul de editare (Stilizat Compact)
export default function EditPetPage() {
  const { pet } = useLoaderData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-600 flex justify-center items-center">
      
      {/* Container Principal */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden flex flex-col max-h-[95vh] h-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(`/pets/${pet.id}`)} 
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Editează Profilul
                        <span className="text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                            {pet.name}
                        </span>
                    </h1>
                </div>
             </div>
             <div className="bg-green-50 p-2 rounded-full hidden sm:block">
                 <PawPrint size={20} className="text-green-600" />
             </div>
        </div>

        {/* Corp Formular - Scrollabil interior */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            
            <Form method="post" id="edit-form" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                
                {/* COLOANA STÂNGA: Identitate & Imagine */}
                <div className="space-y-5">
                    
                    {/* Preview Imagine (Opțional, doar vizual) */}
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {pet.image_url ? (
                                <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                            ) : (
                                <PawPrint className="text-gray-300" size={32} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <label className="text-xs font-bold text-gray-700 block mb-1">URL Imagine Profil</label>
                            <div className="relative">
                                <ImageIcon size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input 
                                    name="image_url" 
                                    defaultValue={pet.image_url} 
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white truncate" 
                                    placeholder="https://..." 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-700 ml-1 block mb-1">Nume Animal <span className="text-red-500">*</span></label>
                            <input 
                                name="name" 
                                defaultValue={pet.name} 
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition" 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1 block mb-1">Specie</label>
                                <select 
                                    name="species" 
                                    defaultValue={pet.species} 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white"
                                >
                                    <option value="dog">Câine</option>
                                    <option value="cat">Pisică</option>
                                    <option value="bird">Pasăre</option>
                                    <option value="other">Altul</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1 block mb-1">Rasă</label>
                                <input 
                                    name="breed" 
                                    defaultValue={pet.breed} 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLOANA DREAPTA: Detalii & Medical */}
                <div className="space-y-5">
                    
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                        <label className="text-xs font-bold text-gray-700 mb-2 ml-1 flex items-center gap-2">
                           <Activity size={14} className="text-orange-500" /> Statistici Fizice
                        </label>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 ml-1 mb-1 block">Greutate (kg)</label>
                                <input 
                                    name="weight" 
                                    type="number" 
                                    step="0.1" 
                                    defaultValue={pet.weight} 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-700 mb-1 ml-1 flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" /> Note Medicale / Detalii
                        </label>
                        <textarea 
                            name="details" 
                            defaultValue={pet.details} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white resize-none h-32" 
                            placeholder="Detalii despre sănătate, alergii sau comportament..."
                        />
                    </div>

                </div>

            </Form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex justify-end gap-3">
            <Link 
                to={`/pets/${pet.id}`}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-full text-sm transition text-center"
            >
                Anulează
            </Link>
            <button 
                type="submit" 
                form="edit-form"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2 transition transform hover:-translate-y-0.5 disabled:opacity-70"
            >
                {isSubmitting ? "Se salvează..." : <>Salvează Modificările <Save size={16} /></>}
            </button>
        </div>

      </div>
    </div>
  );
}