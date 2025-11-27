import { useState } from "react";
import { Form, redirect, useNavigation, useActionData, useNavigate } from "react-router";
import { ArrowLeft, Camera, Plus, PawPrint, AlertCircle, Activity, Save } from "lucide-react";
import { Buffer } from "buffer"; // Protecție pentru încărcarea pozelor

// ✅ IMPORTUL TĂU ORIGINAL (CARE FUNCȚIONEAZĂ)
import sql from "../../api/utils/sql";

export async function action({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login"); 

  const formData = await request.formData();
  
  const name = formData.get("name");
  const breed = formData.get("breed");
  const age = formData.get("birth_date");
  let weight = formData.get("weight");
  const weight_unit = formData.get("weight_unit"); // Citim unitatea (KG sau LBS)
  const details = formData.get("details");
  const allergies = formData.get("allergies");
  const activity_level = formData.get("activity_level");
  const chip_number = formData.get("chip_number");
  const photoFile = formData.get("photo");
  const species = formData.get("species") || "dog"; 

  if (!name) return { error: "Pet Name is required!" };

  // --- CONVERSIE AUTOMATĂ: LBS -> KG ---
  // Dacă utilizatorul a ales LBS, convertim în KG înainte de a salva în baza de date.
  if (weight && weight_unit === 'lbs') {
      try {
        weight = (parseFloat(weight) / 2.20462).toFixed(2);
      } catch (e) {
        // Dacă e o eroare de calcul, păstrăm valoarea originală sau null
      }
  }

  let image_url = null;

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > 2000000) return { error: "Photo too large (max 2MB)." };
    try {
        const arrayBuffer = await photoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        image_url = `data:${photoFile.type};base64,${base64}`;
    } catch (e) {
        console.error("Eroare la procesarea imaginii:", e);
    }
  }

  try {
    // Salvăm în baza de date (weight va fi mereu în KG aici)
    await sql`
      INSERT INTO pets (owner_id, name, species, breed, weight, birth_date, details, allergies, activity_level, chip_number, image_url)
      VALUES (${userId}, ${name}, ${species}, ${breed}, ${weight}, ${age}, ${details}, ${allergies}, ${activity_level}, ${chip_number}, ${image_url})
    `;
    return redirect("/dashboard"); 
  } catch (err) {
    return { error: err.message };
  }
}

export default function AddPetPage() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const [preview, setPreview] = useState(null);

  // --- LOGICA VIZUALĂ: KG vs LBS ---
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lbs"); // Setat implicit pe LBS pentru SUA

  const handleUnitChange = (newUnit) => {
      // Dacă nu e scris nimic, schimbăm doar eticheta
      if (!weight) {
          setUnit(newUnit);
          return;
      }
      
      const val = parseFloat(weight);
      if (isNaN(val)) {
          setUnit(newUnit);
          return;
      }

      // Matematică: Conversie în timp real
      if (unit === 'lbs' && newUnit === 'kg') {
          setWeight((val / 2.20462).toFixed(1)); // LBS -> KG
      } else if (unit === 'kg' && newUnit === 'lbs') {
          setWeight((val * 2.20462).toFixed(1)); // KG -> LBS
      }
      setUnit(newUnit);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-600 flex justify-center items-center">
      
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden flex flex-col max-h-[95vh] h-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Add New Pet <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">AI Profile</span>
                    </h1>
                </div>
             </div>
             <div className="bg-green-50 p-2 rounded-full hidden sm:block">
                 <PawPrint size={20} className="text-green-600" />
             </div>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            
            {actionData?.error && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} /> {actionData.error}
                </div>
            )}

            <Form method="post" encType="multipart/form-data" id="pet-form">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <div className="relative group cursor-pointer shrink-0">
                                <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={28} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-1.5 rounded-full shadow hover:bg-green-700 cursor-pointer">
                                    <Plus size={14} />
                                    <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <div className="text-left lg:text-center">
                                <p className="text-sm font-bold text-gray-700">Profile Photo</p>
                                <p className="text-xs text-gray-400">Tap + to upload</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Pet Name <span className="text-red-500">*</span></label>
                                <input type="text" name="name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" placeholder="Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 ml-1">Species</label>
                                    <select name="species" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white">
                                        <option value="dog">Dog</option>
                                        <option value="cat">Cat</option>
                                        <option value="bird">Bird</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 ml-1">Breed</label>
                                    <input type="text" name="breed" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" placeholder="Breed" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Birthday</label>
                                <input type="date" name="birth_date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" />
                            </div>
                            
                            {/* --- ZONA DE GREUTATE CU TOGGLE KG/LBS --- */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1 flex justify-between">
                                    <span>Weight</span>
                                    <span className="text-[10px] text-gray-400 font-normal">{unit === 'lbs' ? 'USA' : 'Metric'}</span>
                                </label>
                                <div className="flex border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-green-500">
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        name="weight" 
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-3 py-2 text-sm outline-none bg-transparent" 
                                        placeholder="0.0" 
                                    />
                                    {/* Input ascuns care trimite unitatea (KG sau LBS) la backend */}
                                    <input type="hidden" name="weight_unit" value={unit} />
                                    
                                    <div className="flex border-l border-gray-100 bg-gray-50">
                                        <button 
                                            type="button" 
                                            onClick={() => handleUnitChange('lbs')}
                                            className={`px-2 text-[10px] font-bold transition ${unit === 'lbs' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            LBS
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleUnitChange('kg')}
                                            className={`px-2 text-[10px] font-bold transition ${unit === 'kg' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            KG
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* --- FINAL ZONA GREUTATE --- */}

                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Chip No.</label>
                                <input type="text" name="chip_number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white" placeholder="Optional" />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-1"></div>

                        <div>
                             <label className="text-xs font-bold text-gray-700 mb-2 ml-1 flex items-center gap-1">
                                <Activity size={14} className="text-orange-500" /> Activity Level
                             </label>
                             <div className="grid grid-cols-3 gap-2">
                                <label className="cursor-pointer">
                                    <input type="radio" name="activity_level" value="low" className="peer hidden" />
                                    <div className="border border-gray-200 rounded-lg p-2 text-center hover:bg-gray-50 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition">
                                        <div className="text-lg">🛋️</div>
                                        <div className="text-[10px] font-bold uppercase">Low</div>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="activity_level" value="medium" className="peer hidden" defaultChecked />
                                    <div className="border border-gray-200 rounded-lg p-2 text-center hover:bg-gray-50 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition">
                                        <div className="text-lg">🐕</div>
                                        <div className="text-[10px] font-bold uppercase">Normal</div>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="activity_level" value="high" className="peer hidden" />
                                    <div className="border border-gray-200 rounded-lg p-2 text-center hover:bg-gray-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 transition">
                                        <div className="text-lg">⚡</div>
                                        <div className="text-[10px] font-bold uppercase">High</div>
                                    </div>
                                </label>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1 ml-1">
                                    <span>Allergies</span>
                                    <span className="text-[10px] text-red-500 bg-red-50 px-1.5 rounded">Important</span>
                                </label>
                                <input type="text" name="allergies" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none bg-red-50/20 placeholder-gray-400" placeholder="e.g. Chicken, Grain..." />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 ml-1">Medical Notes</label>
                                <textarea name="details" rows="2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white resize-none" placeholder="Past surgeries, issues..."></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </Form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={() => navigate("/dashboard")} 
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold rounded-full text-sm transition"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                form="pet-form"
                disabled={isSubmitting} 
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-sm shadow-md flex items-center gap-2 transition transform hover:-translate-y-0.5 disabled:opacity-70"
            >
                {isSubmitting ? "Saving..." : <>Save Profile <Save size={16} /></>}
            </button>
        </div>

      </div>
    </div>
  );
}