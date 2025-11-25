import { useState, useRef } from "react";
import { Link, Form, useNavigation, useActionData } from "react-router";
import { 
  ArrowLeft, Upload, Camera, 
  Pill, Bone, PartyPopper, Sparkles, 
  AlertTriangle, CheckCircle, MapPin, Info, Loader2, ScanLine 
} from "lucide-react";

// --- BACKEND: SIMULARE AI (GRATUIT) ---
export async function action({ request }) {
  const formData = await request.formData();
  const mode = formData.get("mode"); // rx, food, toy, hygiene
  
  // Simulăm un timp de gândire ca să pară real
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Răspunsuri predefinite (DEMO)
  let fakeResult = {};

  if (mode === 'rx') {
    fakeResult = {
        status: 'danger',
        title: '⚠️ Potential Toxicity Detected',
        description: 'Analyzed Item: Human Ibuprofen. WARNING: High toxicity risk for pets. Do not administer!',
        recommendation: 'It is late. Showing 24/7 EMERGENCY Hospitals nearby:',
        places: [
            { name: "VetLife Emergency 24/7", dist: "1.2 km", type: "Emergency", open: true },
            { name: "Animal City Hospital", dist: "3.5 km", type: "Emergency", open: true }
        ]
    };
  } else if (mode === 'food') {
    fakeResult = {
        status: 'warning',
        title: 'Allergy Alert: Chicken Detected',
        description: 'Ingredients list contains "Chicken Meal" as the main protein source.',
        context: 'Profile Check: Your pet has a known Chicken allergy.',
        recommendation: 'We recommend switching to an "Ocean Fish" or "Lamb" formula.'
    };
  } else if (mode === 'toy') {
    fakeResult = {
        status: 'info',
        title: 'Plush Toy Analysis',
        description: 'Item: Soft Squeaky Pheasant. Material: Polyester Fabric.',
        context: 'Your pet is listed as "High Energy / Destroyer".',
        recommendation: '❌ Not Recommended. Likely to be destroyed in <5 minutes. Try Rubber toys.'
    };
  } else if (mode === 'hygiene') {
    fakeResult = {
        status: 'safe',
        title: 'Pet-Safe Shampoo',
        description: 'Product: Oatmeal & Aloe Soothing Wash. No harsh chemicals detected.',
        recommendation: '✅ Approved. Excellent for dry or itchy skin.'
    };
  }

  return { result: fakeResult, mode };
}

// --- FRONTEND ---
export default function ScanPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isAnalyzing = navigation.state === "submitting";
  
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMode, setSelectedMode] = useState("rx");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-3xl mt-2">
        
        {/* Header Compact */}
        <div className="mb-6 flex items-center justify-between">
            <Link to="/dashboard" className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm">
                <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-600 px-3 py-1.5 rounded-full uppercase tracking-wider border border-orange-100 shadow-sm flex items-center gap-1">
                    <Sparkles size={10} /> AI Scanner
                </span>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
            
            {/* Tabs */}
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/30">
                {['rx', 'food', 'toy', 'hygiene'].map((m) => (
                    <button 
                        key={m}
                        onClick={() => { setSelectedMode(m); setImagePreview(null); }}
                        className={`py-4 flex flex-col items-center justify-center gap-1.5 transition relative overflow-hidden group
                            ${selectedMode === m ? 'bg-white text-green-700 font-bold' : 'text-gray-400 hover:bg-white/50 hover:text-gray-600'}
                        `}
                    >
                        {/* Indicator activ */}
                        {selectedMode === m && <div className="absolute top-0 w-full h-1 bg-green-500"></div>}
                        
                        {m === 'rx' && <Pill size={22} />}
                        {m === 'food' && <Bone size={22} />}
                        {m === 'toy' && <PartyPopper size={22} />}
                        {m === 'hygiene' && <Sparkles size={22} />}
                        <span className="text-[10px] uppercase tracking-wide">{m === 'rx' ? 'Meds' : m}</span>
                    </button>
                ))}
            </div>

            <div className="p-6 md:p-8 text-center min-h-[400px]">
                
                {!actionData?.result && (
                    <>
                        <h1 className="text-xl font-bold text-gray-900 mb-2 capitalize flex items-center justify-center gap-2">
                            {selectedMode === 'rx' ? 'Medication Safety' : selectedMode + ' Scanner'}
                        </h1>
                        <p className="text-gray-400 text-xs mb-8 px-4 max-w-md mx-auto leading-relaxed">
                            (Demo Mode) Take a photo of a product label or item to detect safety hazards, allergies, or toxicity instantly.
                        </p>

                        {/* Formularul Principal */}
                        <Form method="post" encType="multipart/form-data" className="w-full max-w-md mx-auto">
                            <input type="hidden" name="mode" value={selectedMode} />
                            
                            {/* Zona Upload */}
                            <div className="mb-6">
                                <label className={`relative block w-full h-64 rounded-2xl border-2 border-dashed transition cursor-pointer overflow-hidden group
                                    ${imagePreview ? 'border-green-200 bg-white' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50/10'}
                                `}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Scan" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-green-600 transition">
                                            <div className="bg-white p-5 rounded-full shadow-sm mb-4 group-hover:shadow-md group-hover:scale-105 transition border border-gray-100">
                                                <ScanLine size={32} />
                                            </div>
                                            <span className="font-bold text-sm">Tap to Scan Label</span>
                                            <span className="text-[10px] mt-1 opacity-60">Supports JPG, PNG</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        name="image" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleImageChange} 
                                    />
                                </label>
                            </div>

                            {/* Buton Analiză */}
                            {imagePreview && (
                                <button 
                                    type="submit"
                                    disabled={isAnalyzing}
                                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 size={20} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><Upload size={18} /> Run AI Analysis</>
                                    )}
                                </button>
                            )}
                        </Form>
                    </>
                )}

                {/* REZULTAT AI */}
                {actionData?.result && (
                    <div className="text-left animate-fadeIn max-w-lg mx-auto">
                        
                        <div className={`p-5 rounded-2xl border mb-6 shadow-sm ${
                            actionData.result.status === 'danger' ? 'bg-red-50 border-red-200' : 
                            actionData.result.status === 'warning' ? 'bg-orange-50 border-orange-200' : 
                            actionData.result.status === 'safe' ? 'bg-green-50 border-green-200' :
                            'bg-blue-50 border-blue-200'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full shrink-0 ${
                                     actionData.result.status === 'danger' ? 'bg-red-100 text-red-600' : 
                                     actionData.result.status === 'warning' ? 'bg-orange-100 text-orange-600' : 
                                     actionData.result.status === 'safe' ? 'bg-green-100 text-green-600' :
                                     'bg-blue-100 text-blue-600'
                                }`}>
                                    {actionData.result.status === 'danger' && <AlertTriangle size={24} />}
                                    {actionData.result.status === 'warning' && <AlertTriangle size={24} />}
                                    {actionData.result.status === 'safe' && <CheckCircle size={24} />}
                                    {actionData.result.status === 'info' && <Info size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-gray-900 leading-tight">{actionData.result.title}</h3>
                                    <p className="text-sm text-gray-700 font-medium mb-3 leading-snug">{actionData.result.description}</p>
                                    {actionData.result.context && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/60 p-2 rounded-lg border border-black/5">
                                            <Info size={12} /> {actionData.result.context}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-yellow-500" /> AI Recommendation
                            </h4>
                            <p className="text-sm text-gray-800 font-semibold mb-6 leading-relaxed">
                                {actionData.result.recommendation}
                            </p>
                            
                            {actionData.result.places && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Nearby Help (24/7)</p>
                                    {actionData.result.places.map((place, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-green-200 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-50 p-2 rounded-lg text-red-600"><MapPin size={18} /></div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-gray-900">{place.name}</h5>
                                                    <p className="text-[10px] text-gray-500 font-medium">{place.type} • {place.dist}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">OPEN</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buton Reset */}
                        <button 
                            onClick={() => { setImagePreview(null); window.location.reload(); }}
                            className="mt-6 w-full py-3.5 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 text-sm font-bold rounded-full transition shadow-sm"
                        >
                            Scan Another Item
                        </button>

                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}