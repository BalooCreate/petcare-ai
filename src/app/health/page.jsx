import { useLoaderData, Form, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Plus, Activity, Syringe, 
  Stethoscope, Pill, FileHeart, Calendar 
} from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND ---
export async function loader() {
  // Luăm istoricul medical
  const logs = await sql`SELECT * FROM health_logs ORDER BY date DESC`;
  // Luăm lista de animale pentru formular
  const pets = await sql`SELECT name FROM pets`;
  return { logs, pets };
}

export async function action({ request }) {
  const formData = await request.formData();
  const title = formData.get("title");
  const pet_name = formData.get("pet_name");
  const date = formData.get("date");
  const type = formData.get("type");
  const vet_name = formData.get("vet_name");
  const notes = formData.get("notes");

  await sql`
    INSERT INTO health_logs (title, pet_name, date, type, vet_name, notes)
    VALUES (${title}, ${pet_name}, ${date}, ${type}, ${vet_name}, ${notes})
  `;
  return null;
}

// --- FRONTEND ---
export default function HealthPage() {
  const { logs, pets } = useLoaderData();
  const navigate = useNavigate();

  // Iconițe specifice pentru fiecare tip de înregistrare
  const getIcon = (type) => {
    switch (type) {
        case 'vaccine': return <Syringe size={20} className="text-blue-600" />;
        case 'medication': return <Pill size={20} className="text-purple-600" />;
        case 'surgery': return <Activity size={20} className="text-red-600" />;
        case 'checkup': return <Stethoscope size={20} className="text-green-600" />;
        default: return <FileHeart size={20} className="text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
        case 'vaccine': return "bg-blue-50 border-blue-100";
        case 'medication': return "bg-purple-50 border-purple-100";
        case 'surgery': return "bg-red-50 border-red-100";
        case 'checkup': return "bg-green-50 border-green-100";
        default: return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="bg-gray-50 p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition">
             <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-500">Medical history & logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DREAPTA: Lista Istoric */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-4">
             {logs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FileHeart size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">No records found</h3>
                    <p className="text-gray-400 text-sm mt-1">Add vaccines, checkups, or surgeries.</p>
                </div>
             ) : (
                logs.map(log => (
                    <div key={log.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition flex gap-4">
                        {/* Data (Stânga) */}
                        <div className="flex flex-col items-center justify-center min-w-[60px] bg-gray-50 rounded-xl p-2 border border-gray-100 h-fit">
                            <span className="text-xs font-bold text-gray-400 uppercase">
                                {new Date(log.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-xl font-extrabold text-gray-800">
                                {new Date(log.date).getDate()}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(log.date).getFullYear()}
                            </span>
                        </div>

                        {/* Detalii (Dreapta) */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`p-1.5 rounded-lg ${getBgColor(log.type)}`}>
                                        {getIcon(log.type)}
                                    </span>
                                    <h3 className="font-bold text-gray-900 text-base">{log.title}</h3>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase">
                                    {log.pet_name}
                                </span>
                            </div>
                            
                            <div className="pl-9">
                                <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                                    <Stethoscope size={14} /> {log.vet_name || "No clinic specified"}
                                </p>
                                {log.notes && (
                                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic leading-relaxed">
                                        "{log.notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))
             )}
          </div>

          {/* STÂNGA: Formular Adăugare (Sticky) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
               <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                 <Plus size={20} className="text-green-600" /> Add Record
               </h2>
               
               <Form method="post" className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Title / Diagnosis</label>
                   <input type="text" name="title" required placeholder="e.g. Rabies Vaccine" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Pet</label>
                        <select name="pet_name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
                            {pets.length > 0 ? pets.map(p => <option key={p.name} value={p.name}>{p.name}</option>) : <option>Add pet first</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Type</label>
                        <select name="type" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
                            <option value="vaccine">Vaccine</option>
                            <option value="checkup">Checkup</option>
                            <option value="medication">Meds</option>
                            <option value="surgery">Surgery</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Date</label>
                    <input type="date" name="date" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Vet / Clinic Name</label>
                   <input type="text" name="vet_name" placeholder="e.g. Dr. Smith Vet Clinic" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes / Results</label>
                   <textarea name="notes" rows="3" placeholder="Weight was 12kg. Next dose in 1 year..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 resize-none"></textarea>
                 </div>

                 <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 mt-2">
                    Save Record
                 </button>
               </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}