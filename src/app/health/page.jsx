import { useLoaderData, Form, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Plus, Activity, Syringe, 
  Stethoscope, Pill, FileHeart, Calendar, Save 
} from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND (Rămâne la fel) ---
export async function loader() {
  const logs = await sql`SELECT * FROM health_logs ORDER BY date DESC`;
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

// --- FRONTEND (REDESENAT) ---
export default function HealthPage() {
  const { logs, pets } = useLoaderData();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
        case 'vaccine': return <Syringe size={18} className="text-blue-600" />;
        case 'medication': return <Pill size={18} className="text-purple-600" />;
        case 'surgery': return <Activity size={18} className="text-red-600" />;
        case 'checkup': return <Stethoscope size={18} className="text-green-600" />;
        default: return <FileHeart size={18} className="text-gray-600" />;
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
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* Header Compact */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm">
             <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Health Records</h1>
            <p className="text-xs text-gray-500">Medical history & logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLOANA STÂNGA: LISTA (Mai lată) */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-3">
             {logs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-green-100 shadow-sm flex flex-col items-center">
                    <div className="bg-green-50 p-3 rounded-full mb-3">
                        <FileHeart size={24} className="text-green-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No records found</h3>
                    <p className="text-xs text-gray-400 mt-1">Add vaccines, checkups, or surgeries.</p>
                </div>
             ) : (
                logs.map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition flex gap-4 items-start group">
                        
                        {/* Data Box */}
                        <div className="flex flex-col items-center justify-center min-w-[50px] bg-green-50/50 rounded-xl p-2 border border-green-100 h-fit">
                            <span className="text-[10px] font-bold text-green-600 uppercase">
                                {new Date(log.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-lg font-extrabold text-gray-800 leading-none my-0.5">
                                {new Date(log.date).getDate()}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {new Date(log.date).getFullYear()}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`p-1.5 rounded-lg border ${getBgColor(log.type)}`}>
                                        {getIcon(log.type)}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{log.title}</h3>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                           <Stethoscope size={10} /> {log.vet_name || "Unknown Clinic"}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">
                                    {log.pet_name}
                                </span>
                            </div>
                            
                            {log.notes && (
                                <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed">
                                    {log.notes}
                                </p>
                            )}
                        </div>
                    </div>
                ))
             )}
          </div>

          {/* COLOANA DREAPTA: FORMULAR (Compact, fără scroll) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-green-100 sticky top-4">
               
               <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="bg-green-100 p-1.5 rounded-md">
                        <Plus size={16} className="text-green-600" />
                    </div>
                    <h2 className="font-bold text-gray-800 text-sm">Add Record</h2>
               </div>
               
               <Form method="post" className="space-y-3">
                 
                 {/* Title */}
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Title / Diagnosis</label>
                   <input type="text" name="title" required placeholder="e.g. Rabies Vaccine" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition" />
                 </div>

                 {/* Row: Pet & Type */}
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Pet</label>
                        <select name="pet_name" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-500 outline-none cursor-pointer">
                            {pets.length > 0 ? pets.map(p => <option key={p.name} value={p.name}>{p.name}</option>) : <option>No pets</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Type</label>
                        <select name="type" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-500 outline-none cursor-pointer">
                            <option value="vaccine">Vaccine</option>
                            <option value="checkup">Checkup</option>
                            <option value="medication">Meds</option>
                            <option value="surgery">Surgery</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                 </div>

                 {/* Row: Date & Vet */}
                 <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Date</label>
                        <input type="date" name="date" required className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-500 outline-none text-gray-600" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Vet / Clinic</label>
                       <input type="text" name="vet_name" placeholder="Dr. Smith" className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" />
                     </div>
                 </div>

                 {/* Notes */}
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Notes / Results</label>
                   <textarea name="notes" rows="2" placeholder="Details..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white resize-none transition"></textarea>
                 </div>

                 <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-full shadow-md hover:shadow-green-500/20 flex justify-center items-center gap-2 mt-2 transition-all text-sm transform hover:-translate-y-0.5">
                    <Save size={16} /> Save Record
                 </button>
               </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}