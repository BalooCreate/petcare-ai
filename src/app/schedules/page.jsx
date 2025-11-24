import { useLoaderData, Form, Link, useNavigate, redirect } from "react-router";
import { Calendar, Syringe, Stethoscope, Scissors, Plus, ArrowLeft, Clock, CheckCircle, Circle } from "lucide-react";
import sql from "../api/utils/sql";
import { Resend } from 'resend';

// --- BACKEND ---
export async function loader({ request }) {
  // 1. Verificăm utilizatorul
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login");

  // 2. Luăm programările DOAR ale utilizatorului curent (filtrate)
  // Notă: Trebuie să adăugăm coloana user_id la schedules în viitor, 
  // acum le luăm pe toate pt demo, dar e ok.
  const schedules = await sql`SELECT * FROM schedules ORDER BY date ASC`;
  
  // 3. Luăm animalele utilizatorului
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

  // 1. Salvăm în Baza de Date
  await sql`
    INSERT INTO schedules (title, pet_name, date, type, notes)
    VALUES (${title}, ${pet_name}, ${date}, ${type}, ${notes})
  `;

  // 2. TRIMITERE EMAIL (Prin Resend)
  const resendKey = process.env.RESEND_API_KEY;
  
  if (resendKey) {
    const resend = new Resend(resendKey);
    
    // Formatăm data frumos
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', // Adresa default de test Resend
            to: 'baloo@gmail.com', // ⚠️ PUNE AICI EMAILUL TĂU REAL PENTRU TEST (cel cu care ai facut cont pe Resend)
            subject: `📅 New Pet Schedule: ${title}`,
            html: `
                <h1>New Appointment Set! 🐾</h1>
                <p>You have scheduled a new task for <strong>${pet_name}</strong>.</p>
                <hr />
                <p><strong>What:</strong> ${title} (${type})</p>
                <p><strong>When:</strong> ${formattedDate} at ${formattedTime}</p>
                <p><strong>Notes:</strong> ${notes || "None"}</p>
                <br />
                <p><em>PetAssistant - Your Smart Vet Helper</em></p>
            `
        });
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Email failed:", error);
    }
  }

  return null;
}

// --- FRONTEND ---
export default function SchedulesPage() {
  const { schedules, pets } = useLoaderData();
  const navigate = useNavigate();

  const getStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now ? 'Done' : 'Pending';
  };

  const getIcon = (type) => {
    if (type === 'vaccine') return <Syringe size={20} className="text-blue-600" />;
    if (type === 'vet') return <Stethoscope size={20} className="text-red-600" />;
    if (type === 'grooming') return <Scissors size={20} className="text-purple-600" />;
    return <Calendar size={20} className="text-green-600" />;
  };

  const getIconBg = (type) => {
    if (type === 'vaccine') return "bg-blue-100";
    if (type === 'vet') return "bg-red-100";
    if (type === 'grooming') return "bg-purple-100";
    return "bg-green-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-4xl">
        
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm">
             <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Care Schedules</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Listă Programări */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-4">
             {schedules.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No schedules yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Add a task to keep track of care.</p>
                </div>
             ) : (
                schedules.map(item => {
                    const status = getStatus(item.date);
                    return (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(item.type)}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        {item.pet_name} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {status === 'Done' ? (
                                    <><CheckCircle size={16} className="text-green-500" /><span className="text-xs font-bold text-green-600">Done</span></>
                                ) : (
                                    <><Circle size={16} className="text-orange-400" /><span className="text-xs font-bold text-orange-500">Pending</span></>
                                )}
                            </div>
                        </div>
                    );
                })
             )}
          </div>

          {/* Formular Adăugare */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
               <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                 <Plus size={20} className="text-green-600" /> Add New Task
               </h2>
               
               <Form method="post" className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Task Title</label>
                   <input type="text" name="title" required placeholder="e.g. Morning Walk" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" />
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">For Pet</label>
                   <select name="pet_name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
                     {pets.length > 0 ? pets.map(p => <option key={p.name} value={p.name}>{p.name}</option>) : <option>No pets added yet</option>}
                   </select>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Type</label>
                        <select name="type" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer">
                            <option value="other">📅 Routine</option>
                            <option value="vet">🩺 Vet Visit</option>
                            <option value="vaccine">💉 Vaccine</option>
                            <option value="grooming">✂️ Grooming</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Date & Time</label>
                        <input type="datetime-local" name="date" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" />
                    </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes (Optional)</label>
                   <textarea name="notes" rows="2" placeholder="Add details..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 resize-none"></textarea>
                 </div>

                 <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2 mt-2">
                    Add & Notify
                 </button>
               </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}