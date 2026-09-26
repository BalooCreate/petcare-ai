import { useState, useRef } from "react";
import { Link, Form, redirect, useNavigation, useActionData, useLoaderData } from "react-router";
import {
  ArrowLeft, Upload, Camera,
  Pill, Bone, PartyPopper, Sparkles,
  AlertTriangle, CheckCircle, MapPin, Info, Loader2, ScanLine, Crown
} from "lucide-react";
import { Buffer } from "buffer";
import { ACTIONS, getLimit } from "../../lib/plans.js";
import { checkLimit, consumeUsage, getUsage, getUserPlan, getUserIdFromRequest } from "../../lib/usage.js";
import SoftPaywall from "../../components/SoftPaywall";
import { getAiProvider, resolveModel, callAi, describeAiError } from "../../lib/ai.js";

// ============================================================
//  LOADER — plan + remaining scans
// ============================================================
export async function loader({ request }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return { plan: 'free', scansUsed: 0, scansLimit: getLimit('free', ACTIONS.SCAN), userId: null };
  }
  try {
    const [plan, usage] = await Promise.all([getUserPlan(userId), getUsage(userId)]);
    return {
      plan,
      scansUsed: usage?.scans_used || 0,
      scansLimit: getLimit(plan, ACTIONS.SCAN),
      userId,
    };
  } catch (e) {
    console.error("Scan loader error", e);
    return { plan: 'free', scansUsed: 0, scansLimit: getLimit('free', ACTIONS.SCAN), userId };
  }
}

// ============================================================
//  DEMO RESULTS (fallback when there is no OpenAI key or the AI errors out)
// ============================================================
const EMERGENCY_PLACES = [
  { name: "VetLife Emergency 24/7", dist: "1.2 km", type: "Emergency", open: true },
  { name: "Animal City Hospital", dist: "3.5 km", type: "Emergency", open: true },
];

function demoResult(mode) {
  if (mode === 'rx') {
    return {
      status: 'danger',
      title: '⚠️ Potential Toxicity Detected',
      description: 'Analyzed Item: Human Ibuprofen. WARNING: High toxicity risk for pets. Do not administer!',
      recommendation: 'It is late. Showing 24/7 EMERGENCY Hospitals nearby:',
      places: EMERGENCY_PLACES,
    };
  }
  if (mode === 'food') {
    return {
      status: 'warning',
      title: 'Allergy Alert: Chicken Detected',
      description: 'Ingredients list contains "Chicken Meal" as the main protein source.',
      context: 'Profile Check: Your pet has a known Chicken allergy.',
      recommendation: 'We recommend switching to an "Ocean Fish" or "Lamb" formula.',
    };
  }
  if (mode === 'toy') {
    return {
      status: 'info',
      title: 'Plush Toy Analysis',
      description: 'Item: Soft Squeaky Pheasant. Material: Polyester Fabric.',
      context: 'Your pet is listed as "High Energy / Destroyer".',
      recommendation: '❌ Not Recommended. Likely to be destroyed in <5 minutes. Try Rubber toys.',
    };
  }
  return {
    status: 'safe',
    title: 'Pet-Safe Shampoo',
    description: 'Product: Oatmeal & Aloe Soothing Wash. No harsh chemicals detected.',
    recommendation: '✅ Approved. Excellent for dry or itchy skin.',
  };
}

// ============================================================
//  REAL AI ANALYSIS (GPT-4o / GPT-4o-mini, depending on plan)
// ============================================================
const SCAN_PROMPTS = {
  rx: 'Analyze this image for a pet owner. Identify if it is a medication, supplement, human drug, plant, or chemical. Determine whether it is TOXIC or SAFE for dogs and cats. If toxic or dangerous, status must be "danger".',
  food: 'Analyze this pet food or ingredient label. Look for common allergens (chicken, beef, grain, corn, soy), artificial additives, or toxic ingredients (xylitol, onion, garlic, chocolate, grapes).',
  toy: 'Analyze this pet toy or accessory. Assess material safety, choking hazard, durability, and whether it is suitable for dogs/cats.',
  hygiene: 'Analyze this pet hygiene or grooming product. Check the ingredients for harsh chemicals, and state whether it is safe for pets (especially cats, who are sensitive to essential oils and permethrin).',
};

const SYSTEM_PROMPT = `You are PetAssistant, an expert AI veterinarian analyzing a photo for a worried pet owner.
Rules:
- Be accurate and cautious. If unsure about toxicity, mark it "warning" or "danger" and tell the owner to contact a vet.
- Never give a definitive medical diagnosis.
- Always recommend contacting a real vet for serious concerns.

Reply ONLY with valid JSON, no markdown fences, using exactly this shape:
{
  "status": "danger" | "warning" | "safe" | "info",
  "title": "short headline, max 60 chars, may start with an emoji",
  "description": "what you see in the image, 1-3 sentences, factual",
  "context": "short note about why it matters for this owner (optional, may be empty string)",
  "recommendation": "the concrete action the owner should take, 1-2 sentences"
}`;

const ALLOWED_STATUS = ['danger', 'warning', 'safe', 'info'];

function normalizeResult(parsed, mode) {
  if (!parsed || typeof parsed !== 'object') return null;

  const status = ALLOWED_STATUS.includes(parsed.status) ? parsed.status : 'info';
  const clean = (v) => (typeof v === 'string' ? v.trim() : '');

  const title = clean(parsed.title);
  const description = clean(parsed.description);
  const recommendation = clean(parsed.recommendation);

  // If the model returned something unusable, fall back to demo
  if (!title || !description || !recommendation) return null;

  return {
    status,
    title: title.slice(0, 120),
    description: description.slice(0, 800),
    context: clean(parsed.context).slice(0, 300) || undefined,
    recommendation: recommendation.slice(0, 600),
    // For emergencies, add the 24/7 hospitals
    places: status === 'danger' ? EMERGENCY_PLACES : undefined,
    _mode: mode,
  };
}

async function analyzeImageWithAI({ imageFile, mode, plan }) {
  const { aiModel, aiMaxTokens } = plan;
  // Works with either an OpenAI key or an OpenRouter key (detected by prefix).
  const provider = getAiProvider();
  if (!provider) {
    console.error("[scan] No AI key configured. Add OPENAI_API_KEY in Render → Environment.");
    throw new Error('AI unavailable');
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${imageFile.type || 'image/jpeg'};base64,${base64}`;

  // callAi() handles the fallbacks for us: simplified payload when a free model
  // rejects the "system" role or array content, then the fallback model chain.
  // jsonMode=true asks for strict JSON first and is dropped automatically when
  // the model does not support it.
  const result = await callAi(provider, {
    model: resolveModel(aiModel, provider),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: SCAN_PROMPTS[mode] || SCAN_PROMPTS.rx },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    maxTokens: aiMaxTokens,
    jsonMode: true,
  });

  if (!result.ok) {
    // Log the real cause; the scan route falls back to demo results for the visitor.
    console.error("[scan] all AI attempts failed:", JSON.stringify(result.attempts));
    console.error("[scan] last error:", describeAiError(result.data, provider));
    throw new Error('AI unavailable');
  }

  const data = result.data;

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty AI response');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Weaker models often wrap JSON in markdown fences or add a sentence around it.
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const braced = raw.match(/\{[\s\S]*\}/);
    try {
      parsed = JSON.parse(fenced ? fenced[1] : braced ? braced[0] : raw);
    } catch {
      parsed = null;
    }
  }
  if (!parsed) throw new Error('Unparseable AI response');

  const normalized = normalizeResult(parsed, mode);
  if (!normalized) throw new Error('Unusable AI response');
  return normalized;
}

// ============================================================
//  ACTION — check limit, analyze, increment
// ============================================================
export async function action({ request }) {
  const formData = await request.formData();
  const mode = formData.get("mode"); // rx, food, toy, hygiene
  const imageFile = formData.get("image");
  const userId = getUserIdFromRequest(request);

  if (!userId) return redirect("/login");

  // 1. Check the limit BEFORE consuming AI resources
  const check = await checkLimit(userId, ACTIONS.SCAN);
  if (!check.allowed) {
    return {
      error: 'LIMIT_REACHED',
      limit: check.limit,
      used: check.used,
      plan: check.plan,
      message: check.message,
    };
  }

  // 2. Real AI analysis (falls back to demo if the key is missing or it errors)
  let result = null;
  let source = 'demo';

  if (imageFile && imageFile.size > 0) {
    try {
      result = await analyzeImageWithAI({ imageFile, mode, plan: check.plan });
      source = 'ai';
    } catch (e) {
      console.error('Scan AI fallback to demo:', e.message);
      result = null;
    }
  }

  if (!result) {
    // Simulate thinking time to feel real (demo only)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    result = demoResult(mode);
    source = 'demo';
  }

  // 3. Consume a scan only AFTER success
  await consumeUsage(userId, ACTIONS.SCAN);

  return { result, mode, source, remaining: check.unlimited ? null : Math.max(0, check.limit - check.used - 1) };
}

// ============================================================
//  FRONTEND
// ============================================================
export default function ScanPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const loaderData = useLoaderData();
  const isAnalyzing = navigation.state === "submitting";

  const plan = loaderData?.plan || 'free';
  const scansUsed = loaderData?.scansUsed || 0;
  const scansLimit = loaderData?.scansLimit || 3;
  const isFree = plan === 'free';
  const isUnlimited = scansLimit >= 9000;
  const limitReached = isFree && scansUsed >= scansLimit;

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMode, setSelectedMode] = useState("rx");
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallData, setPaywallData] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Auto paywall when the limit is reached
  const limitHit = actionData?.error === 'LIMIT_REACHED';
  const paywallOpen = showPaywall || limitHit;
  const pwLimit = paywallData?.limit ?? actionData?.limit ?? scansLimit;
  const pwUsed = paywallData?.used ?? actionData?.used ?? scansUsed;
  const pwReason = paywallData?.message ?? actionData?.message
    ?? `You used ${pwUsed}/${pwLimit} free scans this month. Unlock unlimited scans with Starter Lifetime (€29), one-time payment.`;

  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-3xl mt-2">

        {/* Header Compact */}
        <div className="mb-6 flex items-center justify-between">
            <Link to="/dashboard" className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm">
                <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
                {isFree && !isUnlimited && (
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border shadow-sm ${
                        limitReached
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : scansUsed >= scansLimit - 1
                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                            : 'bg-white text-gray-500 border-gray-200'
                    }`}>
                        {scansUsed}/{scansLimit} free scans
                    </span>
                )}
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

                {/* BANNER: limit reached */}
                {limitReached && !actionData?.result && (
                    <div className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-5 text-left max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                                <Crown size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">You used all your free scans</h3>
                                <p className="text-xs text-gray-600 mt-1 mb-3">
                                    {scansUsed}/{scansLimit} scans used this month on the Free plan.
                                </p>
                                <Link
                                    to="/pricing"
                                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition"
                                >
                                    Unlock unlimited scans — €29
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {!actionData?.result && (
                    <>
                        <h1 className="text-xl font-bold text-gray-900 mb-2 capitalize flex items-center justify-center gap-2">
                            {selectedMode === 'rx' ? 'Medication Safety' : selectedMode + ' Scanner'}
                        </h1>
                        <p className="text-gray-400 text-xs mb-8 px-4 max-w-md mx-auto leading-relaxed">
                            Take a photo of a product label or item to detect safety hazards, allergies, or toxicity instantly.
                        </p>

                        {/* Formularul Principal */}
                        <Form method="post" encType="multipart/form-data" className="w-full max-w-md mx-auto">
                            <input type="hidden" name="mode" value={selectedMode} />

                            {/* Zona Upload */}
                            <div className="mb-6">
                                <label className={`relative block w-full h-64 rounded-2xl border-2 border-dashed transition overflow-hidden group
                                    ${imagePreview ? 'border-green-200 bg-white' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50/10'}
                                    ${limitReached ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
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
                                        disabled={limitReached}
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            {/* Analyze button */}
                            {imagePreview && (
                                <button
                                    type="submit"
                                    disabled={isAnalyzing || limitReached}
                                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 size={20} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><Upload size={18} /> Run AI Analysis</>
                                    )}
                                </button>
                            )}

                            {!isFree && (
                                <p className="text-[10px] text-gray-400 mt-3">
                                    Plan {plan === 'starter' ? 'Starter Lifetime' : 'Pro Lifetime'} • unlimited scans
                                </p>
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

                        {/* Disclaimer + sursa analizei */}
                        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                            {actionData.source === 'ai'
                              ? 'AI-generated analysis. Not a substitute for veterinary care.'
                              : 'Demo result. Not a substitute for veterinary care.'}
                        </p>

                        {/* Buton Reset */}
                        <button
                            onClick={() => { setImagePreview(null); window.location.reload(); }}
                            className="mt-4 w-full py-3.5 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-200 text-sm font-bold rounded-full transition shadow-sm"
                        >
                            Scan Another Item
                        </button>

                    </div>
                )}

            </div>
        </div>
      </div>

      {/* PAYWALL */}
      {paywallOpen && (
        <SoftPaywall
          reason={pwReason}
          limit={pwLimit}
          used={pwUsed}
          upgradeTo="starter"
          onClose={() => { setShowPaywall(false); setPaywallData(null); }}
        />
      )}
    </div>
  );
}
