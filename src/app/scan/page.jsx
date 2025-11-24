import { useState, useRef } from "react";
import { Link, Form, useNavigation, useActionData } from "react-router";
import { 
  ArrowLeft, Upload, Camera, 
  Pill, Bone, PartyPopper, Sparkles, 
  AlertTriangle, CheckCircle, MapPin, Info, Loader2 
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
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-3xl mt-2">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 transition gap-2 text-sm font-medium">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <span className="text-[10px] font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-orange-100">
                Gold Feature ✨
            </span>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            
            {/* Tabs */}
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/50">
                {['rx', 'food', 'toy', 'hygiene'].map((m) => (
                    <button 
                        key={m}
                        onClick={() => { setSelectedMode(m); setImagePreview(null); }}
                        className={`py-4 flex flex-col items-center justify-center gap-1.5 transition hover:bg-white ${selectedMode === m ? 'bg-white border-b-2 border-green-500 shadow-sm text-green-700' : 'text-gray-400'}`}
                    >
                        {m === 'rx' && <Pill size={20} />}
                        {m === 'food' && <Bone size={20} />}
                        {m === 'toy' && <PartyPopper size={20} />}
                        {m === 'hygiene' && <Sparkles size={20} />}
                        <span className="text-[10px] font-bold uppercase">{m}</span>
                    </button>
                ))}
            </div>

            <div className="p-6 md:p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                    {selectedMode} Scanner
                </h1>
                <p className="text-gray-400 text-xs mb-8 px-4 max-w-md mx-auto">
                    (Demo Mode) Upload any photo to see how the AI analysis works.
                </p>

                {/* Formularul Principal */}
                <Form method="post" encType="multipart/form-data" className="w-full">
                    <input type="hidden" name="mode" value={selectedMode} />
                    
                    {/* Zona Upload */}
                    <div className="mb-8">
                        <label className="relative block w-full h-64 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-500 bg-gray-50 hover:bg-green-50/10 transition cursor-pointer overflow-hidden group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Scan" className="w-full h-full object-contain bg-black/5" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-green-600 transition">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition">
                                        <Camera size={28} />
                                    </div>
                                    <span className="font-bold text-sm">Tap to scan Item</span>
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
                    {imagePreview && !actionData?.result && (
                        <button 
                            type="submit"
                            disabled={isAnalyzing}
                            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <><Loader2 size={20} className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><Upload size={18} /> Analyze Photo (Demo)</>
                            )}
                        </button>
                    )}
                </Form>

                {/* REZULTAT AI */}
                {actionData?.result && (
                    <div className="mt-8 text-left animate-fadeIn">
                        
                        <div className={`p-5 rounded-xl border-l-4 shadow-sm mb-6 ${
                            actionData.result.status === 'danger' ? 'bg-red-50 border-red-500' : 
                            actionData.result.status === 'warning' ? 'bg-orange-50 border-orange-500' : 
                            actionData.result.status === 'safe' ? 'bg-green-50 border-green-500' :
                            'bg-blue-50 border-blue-500'
                        }`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {actionData.result.status === 'danger' && <AlertTriangle className="text-red-600" />}
                                    {actionData.result.status === 'warning' && <AlertTriangle className="text-orange-600" />}
                                    {actionData.result.status === 'safe' && <CheckCircle className="text-green-600" />}
                                    {actionData.result.status === 'info' && <Info className="text-blue-600" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-gray-900">{actionData.result.title}</h3>
                                    <p className="text-sm text-gray-700 font-medium mb-2">{actionData.result.description}</p>
                                    {actionData.result.context && <p className="text-xs text-gray-500 italic border-t border-black/5 pt-2">ℹ️ {actionData.result.context}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Sparkles size={14} className="text-yellow-500" /> Recommendation
                            </h4>
                            <p className="text-sm text-gray-800 font-semibold mb-4 leading-relaxed">
                                {actionData.result.recommendation}
                            </p>
                            {actionData.result.places && (
                                <div className="space-y-3">
                                    {actionData.result.places.map((place, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-2 rounded text-green-700"><MapPin size={16} /></div>
                                                <div><h5 className="text-sm font-bold text-gray-900">{place.name}</h5><p className="text-[10px] text-gray-500">{place.type} • {place.dist}</p></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-green-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">OPEN</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buton Reset */}
                        <button 
                            onClick={() => { setImagePreview(null); window.location.reload(); }}
                            className="mt-6 w-full py-3 text-gray-400 hover:text-gray-600 text-sm font-medium"
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