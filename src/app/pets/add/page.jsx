import { useState } from "react";
import { Form, redirect, useNavigation, useActionData, useNavigate } from "react-router";
import { ArrowLeft, Camera, Plus, PawPrint, AlertCircle, Activity } from "lucide-react";
import sql from "../../api/utils/sql";

export async function action({ request }) {
  // 1. Aflăm cine e logat
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login"); 

  const formData = await request.formData();
  
  const name = formData.get("name");
  const breed = formData.get("breed");
  const age = formData.get("birth_date");
  const weight = formData.get("weight");
  const details = formData.get("details");
  const allergies = formData.get("allergies");
  const activity_level = formData.get("activity_level");
  const chip_number = formData.get("chip_number");
  const photoFile = formData.get("photo");
  const species = formData.get("species") || "dog"; 

  if (!name) return { error: "Pet Name is required!" };

  let image_url = null;

  if (photoFile && photoFile.size > 0) {
    if (photoFile.size > 2000000) return { error: "Photo too large (max 2MB)." };
    const arrayBuffer = await photoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    image_url = `data:${photoFile.type};base64,${base64}`;
  }

  try {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-600">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={20} />
        </button>
        <div className="bg-green-100 p-2 rounded-full text-green-600">
            <PawPrint size={24} />
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-900">Add New Pet</h1>
            <p className="text-xs text-gray-500">Create a comprehensive profile for AI analysis</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {actionData?.error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {actionData.error}
            </div>
        )}

        <Form method="post" encType="multipart/form-data">
          
          {/* Photo Area */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={40} className="text-gray-300" />
                    )}
                </div>
                <label className="mt-4 inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition shadow-sm">
                    <span className="mr-2">📷</span> Choose Photo
                    <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
            </div>
          </div>

          {/* BASIC INFO */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pet Name *</label>
              <input type="text" name="name" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" placeholder="Rex" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Species</label>
              <select name="species" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50">
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Breed</label>
              <input type="text" name="breed" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" placeholder="e.g. Labrador" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="birth_date" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" name="weight" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" placeholder="0.0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Microchip No. (Optional)</label>
              <input type="text" name="chip_number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50" placeholder="123456789" />
            </div>
          </div>

          {/* MEDICAL & AI INFO */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
             <Activity size={16} className="text-orange-500" /> Health & AI Profile
          </h3>
          <div className="grid grid-cols-1 gap-6 mb-8">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Allergies (Crucial for Food Scan)</label>
                <input type="text" name="allergies" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-red-50/30 placeholder-red-300" placeholder="e.g. Chicken, Beef, Pollen" />
             </div>
             
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Activity Level (Crucial for Toys/Diet)</label>
                <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                        <input type="radio" name="activity_level" value="low" className="peer hidden" />
                        <div className="border border-gray-200 rounded-lg p-3 text-center text-xs hover:bg-gray-50 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 transition">
                            🛋️ Low / Lazy
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input type="radio" name="activity_level" value="medium" className="peer hidden" defaultChecked />
                        <div className="border border-gray-200 rounded-lg p-3 text-center text-xs hover:bg-gray-50 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition">
                            🐕 Normal
                        </div>
                    </label>
                    <label className="cursor-pointer">
                        <input type="radio" name="activity_level" value="high" className="peer hidden" />
                        <div className="border border-gray-200 rounded-lg p-3 text-center text-xs hover:bg-gray-50 peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 transition">
                            ⚡ Hyper / Active
                        </div>
                    </label>
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Medical Notes</label>
                <textarea name="details" rows="3" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50/50 placeholder-gray-400 resize-none" placeholder="History of surgeries, chronic illness..."></textarea>
             </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
             <button type="button" onClick={() => navigate("/dashboard")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg text-sm transition">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm shadow-lg shadow-green-200 flex items-center gap-2 transition transform hover:-translate-y-0.5 disabled:opacity-70">
               {/* AICI AM SCHIMBAT TEXTUL: */}
               {isSubmitting ? "Saving..." : <><Plus size={18} /> Save Profile</>}
             </button>
          </div>

        </Form>
      </div>
    </div>
  );
}