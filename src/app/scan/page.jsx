import { useState } from "react";
import { Link, redirect, useLoaderData } from "react-router"; // Am adăugat useLoaderData și redirect
import { 
  ArrowLeft, Upload, Camera, 
  Pill, Bone, PartyPopper, Sparkles, 
  AlertTriangle, CheckCircle, MapPin, Info 
} from "lucide-react";
import sql from "../api/utils/sql"; // Importăm baza de date

// --- BACKEND: Verificăm Abonamentul ---
export async function loader({ request }) {
  // 1. Verificăm cine e logat
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login");

  // 2. Căutăm utilizatorul în bază să vedem ce plan are
  const users = await sql`SELECT plan FROM users WHERE id = ${userId}`;
  
  if (users.length === 0) return redirect("/login");

  const userPlan = users[0].plan; // 'free', 'chihuahua', 'labrador', 'great_dane'

  // 3. LACĂTUL: Dacă nu e 'great_dane', îl trimitem la upgrade
  // (NOTA: Pentru testare, poți comenta linia de mai jos ca să vezi pagina)
  if (userPlan !== 'great_dane') {
      return redirect("/upgrade");
  }

  return null;
}

// --- FRONTEND (Rămâne la fel) ---
export default function ScanPage() {
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("rx"); 
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!image) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      setAnalyzing(false);
      if (mode === 'rx') {
        const isNightTime = true; 
        setResult({
            status: 'danger',
            title: '⚠️ Potential Toxicity Detected',
            description: 'Analyzed Item: Human Ibuprofen. WARNING: This represents a high toxicity risk.',
            recommendation: isNightTime ? 'It is 03:15 AM. Showing 24/7 EMERGENCY Hospitals:' : 'Showing nearest Vet Clinics:',
            places: [
                { name: "VetLife Emergency 24/7", dist: "1.2 km", type: "Emergency", open: true },
                { name: "Animal City Hospital", dist: "3.5 km", type: "Emergency", open: true }
            ]
        });
      } else if (mode === 'food') {
        setResult({
            status: 'warning',
            title: 'Allergy Alert: Chicken Detected',
            description: 'Ingredients list contains "Chicken Meal".',
            context: 'Profile Check: Rex has a known Chicken allergy.',
            recommendation: 'Alternative: "Ocean Fish Formula".'
        });
      } else if (mode === 'toy') {
        setResult({
            status: 'info',
            title: 'Plush Toy Analysis',
            description: 'Item: Soft Squeaky Pheasant.',
            context: 'Rex is "High Energy / Destroyer".',
            recommendation: '❌ Not Recommended. Will be destroyed quickly. Try Rubber toys.'
        });
      } else if (mode === 'hygiene') {
        setResult({
            status: 'danger',
            title: 'Chemical Safety Warning',
            description: 'Detected: Bleach based cleaner.',
            context: 'Safety Hazard:',
            recommendation: 'Toxic if ingested. Switch to Pet-Safe cleaner.'
        });
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-3xl mt-2">
        
        <div className="mb-6 flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-green-600 transition gap-2 text-sm font-medium">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <span className="text-[10px] font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-orange-100">
                Gold Feature ✨
            </span>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/50">
                <button onClick={() => { setMode('rx'); setResult(null); }} className={`py-4 flex flex-col items-center justify-center gap-1.5 transition hover:bg-white ${mode === 'rx' ? 'text-red-600 bg-white border-b-2 border-red-500 shadow-sm' : 'text-gray-400'}`}><Pill size={20} /><span className="text-[10px] font-bold uppercase">Rx & Vet</span></button>
                <button onClick={() => { setMode('food'); setResult(null); }} className={`py-4 flex flex-col items-center justify-center gap-1.5 transition hover:bg-white ${mode === 'food' ? 'text-green-600 bg-white border-b-2 border-green-500 shadow-sm' : 'text-gray-400'}`}><Bone size={20} /><span className="text-[10px] font-bold uppercase">Food</span></button>
                <button onClick={() => { setMode('toy'); setResult(null); }} className={`py-4 flex flex-col items-center justify-center gap-1.5 transition hover:bg-white ${mode === 'toy' ? 'text-blue-600 bg-white border-b-2 border-blue-500 shadow-sm' : 'text-gray-400'}`}><PartyPopper size={20} /><span className="text-[10px] font-bold uppercase">Toys</span></button>
                <button onClick={() => { setMode('hygiene'); setResult(null); }} className={`py-4 flex flex-col items-center justify-center gap-1.5 transition hover:bg-white ${mode === 'hygiene' ? 'text-purple-600 bg-white border-b-2 border-purple-500 shadow-sm' : 'text-gray-400'}`}><Sparkles size={20} /><span className="text-[10px] font-bold uppercase">Hygiene</span></button>
            </div>

            <div className="p-6 md:p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {mode === 'rx' && 'Rx & Emergency Finder'}
                    {mode === 'food' && 'Food & Diet Advisor'}
                    {mode === 'toy' && 'Toy & Behavior Analyzer'}
                    {mode === 'hygiene' && 'Hygiene & Safety Check'}
                </h1>
                <p className="text-gray-400 text-xs mb-8 px-4 max-w-md mx-auto">
                    Upload a photo to analyze using our advanced AI Veterinary model.
                </p>

                <div className="mb-8">
                    <label className="relative block w-full h-64 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-500 bg-gray-50 hover:bg-green-50/10 transition cursor-pointer overflow-hidden group">
                        {image ? (
                            <img src={image} alt="Scan" className="w-full h-full object-contain bg-black/5" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-green-600 transition">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition">
                                    <Camera size={28} />
                                </div>
                                <span className="font-bold text-sm">Tap to scan Item</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>

                {image && !result && (
                    <button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2">
                        {analyzing ? <><span className="animate-spin">⌛</span> Analyzing...</> : <><Upload size={18} /> Analyze Photo</>}
                    </button>
                )}

                {result && (
                    <div className="mt-8 text-left animate-fadeIn">
                        <div className={`p-5 rounded-xl border-l-4 shadow-sm mb-6 ${result.status === 'danger' ? 'bg-red-50 border-red-500' : result.status === 'warning' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {result.status === 'danger' && <AlertTriangle className="text-red-600" />}
                                    {result.status === 'warning' && <AlertTriangle className="text-orange-600" />}
                                    {result.status === 'info' && <Info className="text-blue-600" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-gray-900">{result.title}</h3>
                                    <p className="text-sm text-gray-700 font-medium mb-2">{result.description}</p>
                                    {result.context && <p className="text-xs text-gray-500 italic border-t border-black/5 pt-2">ℹ️ {result.context}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Sparkles size={14} className="text-yellow-500" /> AI Recommendation
                            </h4>
                            <p className="text-sm text-gray-800 font-semibold mb-4 leading-relaxed">{result.recommendation}</p>
                            {result.places && (
                                <div className="space-y-3">
                                    {result.places.map((place, index) => (
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
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}