import { useLoaderData, Form, Link, useNavigate, redirect } from "react-router";
import { Calendar, Syringe, Stethoscope, Scissors, Plus, ArrowLeft, Clock, CheckCircle, Circle, Bell } from "lucide-react";
import sql from "../api/utils/sql";
import { Resend } from 'resend';

// --- BACKEND (NESCHIMBAT) ---
export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login");

  const schedules = await sql`SELECT * FROM schedules ORDER BY date ASC`;
  const pets = await sql`SELECT name FROM pets WHERE owner_id = ${userId}`;
  
  return { schedules, pets, userId };
}

export async function action({ request }) {
  const formData = await request.formData();
  const title = formData.get("title");
  const pet_name = formData.get("pet_name");
  const date = formData.get("date");
  const type = formData.get("type");
  const notes = formData.get("notes");

  await sql`
    INSERT INTO schedules (title, pet_name, date, type, notes)
    VALUES (${title}, ${pet_name}, ${date}, ${type}, ${notes})
  `;

  // Email logic (Resend)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', 
            to: 'baloo@gmail.com', 
            subject: `📅 New Pet Schedule: ${title}`,
            html: `<p>New task for ${pet_name}: ${title} on ${date}</p>`
        });
    } catch (error) { console.error(error); }
  }
  return null;
}

// --- FRONTEND (OPTIMIZAT COMPACT) ---
export default function SchedulesPage() {
  const { schedules, pets } = useLoaderData();
  const navigate = useNavigate();

  const getStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now ? 'Done' : 'Pending';
  };

  const getIcon = (type) => {
    if (type === 'vaccine') return <Syringe size={18} className="text-blue-600" />;
    if (type === 'vet') return <Stethoscope size={18} className="text-red-600" />;
    if (type === 'grooming') return <Scissors size={18} className="text-purple-600" />;
    return <Calendar size={18} className="text-green-600" />;
  };

  const getIconBg = (type) => {
    if (type === 'vaccine') return "bg-blue-100";
    if (type === 'vet') return "bg-red-100";
    if (type === 'grooming') return "bg-purple-100";
    return "bg-green-100";
  };

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-6xl">
        
        {/* HEADER COMPACT */}
        <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate("/dashboard")} 
                    className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Care Schedules</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLOANA STÂNGA: LISTA (Rămâne mare) */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-3">
             {schedules.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-green-100 shadow-sm flex flex-col items-center">
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Calendar size={24} className="text-green-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No schedules</h3>
                    <p className="text-xs text-gray-400">Add a task on the right.</p>
                </div>
             ) : (
                schedules.map(item => {
                    const status = getStatus(item.date);
                    const isDone = status === 'Done';
                    return (
                        <div key={item.id} className={`p-3 rounded-xl border transition flex items-center justify-between ${isDone ? 'bg-gray-50 opacity-60' : 'bg-white border-green-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-gray-200 grayscale' : getIconBg(item.type)}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>{item.title}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                        <span className="font-semibold bg-gray-100 px-1.5 rounded text-gray-600">{item.pet_name}</span> 
                                        <span>• {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            </div>
                            {isDone ? <CheckCircle size={16} className="text-gray-300" /> : <Circle size={16} className="text-green-500" />}
                        </div>
                    );
                })
             )}
          </div>

          {/* COLOANA DREAPTA: FORMULAR COMPACT (FĂRĂ SCROLL) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-green-100 sticky top-4">
               
               <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="bg-green-100 p-1.5 rounded-md">
                        <Plus size={16} className="text-green-600" />
                    </div>
                    <h2 className="font-bold text-gray-800 text-sm">Add New Task</h2>
               </div>
               
               <Form method="post" className="space-y-3">
                 
                 {/* Titlu */}
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Title</label>
                   <input type="text" name="title" required placeholder="e.g. Vet Checkup" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" />
                 </div>

                 {/* Rând: Pet + Type (Side by Side pentru spațiu) */}
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
                            <option value="other">📅 Routine</option>
                            <option value="vet">🩺 Vet</option>
                            <option value="vaccine">💉 Shot</option>
                            <option value="grooming">✂️ Groom</option>
                        </select>
                    </div>
                 </div>

                 {/* Dată */}
                 <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Date & Time</label>
                    <input type="datetime-local" name="date" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-500 outline-none text-gray-600" />
                 </div>

                 {/* Note */}
                 <div>
                   <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Notes</label>
                   <textarea name="notes" rows="2" placeholder="Short details..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white resize-none"></textarea>
                 </div>

                 {/* Buton Submit */}
                 <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-full shadow-md hover:shadow-green-500/20 flex justify-center items-center gap-2 mt-2 transition-all text-sm">
                    <Bell size={16} /> Add Task
                 </button>
               </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}