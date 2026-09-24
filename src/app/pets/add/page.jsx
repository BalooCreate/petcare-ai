import { useState } from "react";
import { Form, redirect, useNavigation, useActionData, useNavigate, useSearchParams, Link } from "react-router";
import { ArrowLeft, Camera, Plus, PawPrint, AlertCircle, Activity, Save, Crown, Gift, Check } from "lucide-react";
import { Buffer } from "buffer";
import sql from "../../api/utils/sql";

export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { petsCount: 0, plan: 'free', welcome: false };

  const url = new URL(request.url);
  const welcome = url.searchParams.get("welcome") === "true";

  try {
    const pets = await sql`SELECT COUNT(*) as count FROM pets WHERE owner_id = ${userId} OR user_id = ${userId}`;
    const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
    
    return {
      petsCount: parseInt(pets[0]?.count || 0),
      plan: userResult[0]?.plan || 'free',
      welcome
    };
  } catch (e) {
    return { petsCount: 0, plan: 'free', welcome };
  }
}

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
  const weight_unit = formData.get("weight_unit");
  const details = formData.get("details");
  const allergies = formData.get("allergies");
  const activity_level = formData.get("activity_level");
  const chip_number = formData.get("chip_number");
  const photoFile = formData.get("photo");
  const species = formData.get("species") || "dog"; 

  if (!name) return { error: "Numele animalului este obligatoriu!" };

  // === FREEMIUM CHECK: câte animale are deja? ===
  try {
    const petsCountResult = await sql`SELECT COUNT(*) as count FROM pets WHERE owner_id = ${userId} OR user_id = ${userId}`;
    const petsCount = parseInt(petsCountResult[0]?.count || 0);
    
    const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
    const plan = userResult[0]?.plan || 'free';
    
    let limit = 1;
    if (plan === 'starter') limit = 3;
    else if (plan === 'pro') limit = 9999;

    if (petsCount >= limit) {
      return { 
        error: `LIMIT_REACHED`,
        message: `Ai atins limita de ${limit} ${limit === 1 ? 'animal' : 'animale'} pentru planul ${plan === 'free' ? 'Free' : plan}. Fă upgrade la ${limit === 1 ? 'Starter $29' : 'Pro $49'} pentru mai mult!`,
        limit,
        plan
      };
    }
  } catch (e) {
    console.error("Freemium check error", e);
  }

  if (weight && weight_unit === 'lbs') {
      try {
        weight = (parseFloat(weight) / 2.20462).toFixed(2);
      } catch (e) {}
  }

  let image_url = null;

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > 2000000) return { error: "Poza prea mare (max 2MB)." };
    try {
        const arrayBuffer = await photoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        image_url = `data:${photoFile.type};base64,${base64}`;
    } catch (e) {
        console.error("Eroare imagine:", e);
    }
  }

  try {
    await sql`
      INSERT INTO pets (owner_id, name, species, breed, weight, birth_date, details, allergies, activity_level, chip_number, image_url)
      VALUES (${userId}, ${name}, ${species}, ${breed}, ${weight}, ${age}, ${details}, ${allergies}, ${activity_level}, ${chip_number}, ${image_url})
    `;
    return redirect("/dashboard?new_pet=true"); 
  } catch (err) {
    return { error: err.message };
  }
}

export default function AddPetPage() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubmitting = navigation.state === "submitting";
  const [preview, setPreview] = useState(null);

  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");

  const welcome = searchParams.get("welcome") === "true";

  const handleUnitChange = (newUnit) => {
      if (!weight) { setUnit(newUnit); return; }
      const val = parseFloat(weight);
      if (isNaN(val)) { setUnit(newUnit); return; }
      if (unit === 'lbs' && newUnit === 'kg') setWeight((val / 2.20462).toFixed(1));
      else if (unit === 'kg' && newUnit === 'lbs') setWeight((val * 2.20462).toFixed(1));
      setUnit(newUnit);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Dacă a atins limita
  if (actionData?.error === 'LIMIT_REACHED') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center font-sans">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border p-8 text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-orange-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Limită atinsă! 🐾</h2>
          <p className="text-sm text-gray-600 mb-6">{actionData.message}</p>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-4 text-left">
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <Gift size={16} /> Starter Lifetime - $29
            </h3>
            <ul className="text-xs text-gray-700 space-y-1.5 mb-4">
              <li className="flex gap-2"><Check size={14} className="text-green-600" /> 3 animale în loc de 1</li>
              <li className="flex gap-2"><Check size={14} className="text-green-600" /> 100 AI chats/lună</li>
              <li className="flex gap-2"><Check size={14} className="text-green-600" /> Fără reclame, pe viață</li>
            </ul>
            <Link to="/pricing" className="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl hover:bg-green-700">
              Vezi planurile - de la $29 🚀
            </Link>
          </div>
          
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Înapoi la dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50/50 p-4 font-sans text-gray-600 flex justify-center items-start">
      
      <div className="w-full max-w-5xl bg-white rounded-[1.8rem] shadow-xl border border-green-100 overflow-hidden flex flex-col max-h-[95vh] h-auto mt-4">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {welcome ? "Bun venit! Adaugă primul animal 🎉" : "Adaugă animal nou"}
                    </h1>
                    {welcome && <p className="text-xs text-green-600 font-medium">Pasul 1 din 1 • Gratis, 20 secunde</p>}
                </div>
             </div>
             <div className="bg-green-50 p-2 rounded-full hidden sm:block">
                 <PawPrint size={20} className="text-green-600" />
             </div>
        </div>

        {welcome && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 flex items-center gap-3 text-sm">
            <Gift size={18} className="shrink-0" />
            <span><strong>Felicitări!</strong> Contul tău gratuit e gata. Adaugă primul animal și primești 5 întrebări AI gratuite luna asta.</span>
          </div>
        )}

        {/* Form Body */}
        <div className="overflow-y-auto p-6">
            
            {actionData?.error && actionData.error !== 'LIMIT_REACHED' && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} /> {actionData.error}
                </div>
            )}

            <Form method="post" encType="multipart/form-data" id="pet-form">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-4 flex flex-col gap-5">
                        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                            <div className="relative group cursor-pointer shrink-0">
                                <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={28} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow hover:bg-green-700 cursor-pointer">
                                    <Plus size={14} />
                                    <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <div className="text-left lg:text-center">
                                <p className="text-sm font-bold text-gray-700">Poză profil</p>
                                <p className="text-xs text-gray-400">Apasă + pentru a încărca</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-blue-800 mb-1">💡 De ce să adaugi animalul?</p>
                          <p className="text-[11px] text-blue-600 leading-relaxed">AI-ul va da sfaturi personalizate în funcție de rasă, vârstă și greutate. Cu cât profilul e mai complet, cu atât sfaturile sunt mai bune.</p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">Nume animal <span className="text-red-500">*</span></label>
                                <input type="text" name="name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1" placeholder="Ex: Max, Luna, Rex" required />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Specie</label>
                                <select name="species" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1">
                                    <option value="dog">🐶 Câine</option>
                                    <option value="cat">🐱 Pisică</option>
                                    <option value="bird">🐦 Pasăre</option>
                                    <option value="other">🐾 Altul</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Rasă</label>
                                <input type="text" name="breed" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1" placeholder="Ex: Labrador, Bichon" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1">Data nașterii</label>
                                <input type="date" name="birth_date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1" />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 ml-1 flex justify-between">
                                    <span>Greutate</span>
                                    <span className="text-[10px] text-gray-400 font-normal">{unit.toUpperCase()}</span>
                                </label>
                                <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:bg-white mt-1">
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        name="weight" 
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 text-sm outline-none bg-transparent" 
                                        placeholder="0.0" 
                                    />
                                    <input type="hidden" name="weight_unit" value={unit} />
                                    <div className="flex border-l border-gray-100 bg-gray-100">
                                        <button type="button" onClick={() => handleUnitChange('kg')} className={`px-3 text-[11px] font-bold transition ${unit === 'kg' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>KG</button>
                                        <button type="button" onClick={() => handleUnitChange('lbs')} className={`px-3 text-[11px] font-bold transition ${unit === 'lbs' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>LBS</button>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">Alergii / Condiții speciale</label>
                                <input type="text" name="allergies" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1" placeholder="Ex: alergie la pui, displazie" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">Detalii extra (opțional)</label>
                                <textarea name="details" rows="3" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white mt-1 resize-none" placeholder="Orice vrei să știe AI-ul despre animalul tău..."></textarea>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => navigate("/dashboard")} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-sm hover:bg-gray-50">Anulează</button>
                          <button type="submit" disabled={isSubmitting} className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50">
                            {isSubmitting ? "Se salvează..." : <><Save size={16} /> Salvează animalul</>}
                          </button>
                        </div>

                        <p className="text-[11px] text-center text-gray-400">Poți adăuga mai multe animale după - 1 gratis, 3 cu Starter $29, nelimitat cu Pro $49</p>
                    </div>
                </div>
            </Form>
        </div>
      </div>
    </div>
  );
}
