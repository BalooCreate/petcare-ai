import { useState, useEffect, useRef } from "react";
import { Form, useNavigation, useActionData, Link, useLoaderData } from "react-router";
import { ArrowLeft, Send, Bot, User, Loader2, Paperclip, Crown, Zap, AlertCircle } from "lucide-react";
import sql from "../api/utils/sql";

// --- LOADER: Ia planul și usage-ul ---
export async function loader({ request }) {
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return { usage: { ai_chats_used: 0 }, plan: 'free', userId: null };

  try {
    const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
    const usageResult = await sql`SELECT * FROM usage_limits WHERE user_id = ${userId}`.catch(() => []);
    return {
      usage: usageResult[0] || { ai_chats_used: 0 },
      plan: userResult[0]?.plan || 'free',
      userId
    };
  } catch (e) {
    return { usage: { ai_chats_used: 0 }, plan: 'free', userId };
  }
}

// --- BACKEND: Server-Side Logic cu Freemium ---
export async function action({ request }) {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const imageFile = formData.get("image");

  if (!prompt && (!imageFile || imageFile.size === 0)) return null;

  // Ia userId din cookie
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "No API Key found. Contact support." };

  // === FREEMIUM CHECK ===
  let userPlan = 'free';
  let aiLimit = 5;
  let aiUsed = 0;

  if (userId) {
    try {
      const userResult = await sql`SELECT plan FROM users WHERE id = ${userId}`;
      userPlan = userResult[0]?.plan || 'free';
      
      const usageResult = await sql`SELECT * FROM usage_limits WHERE user_id = ${userId}`.catch(() => []);
      aiUsed = usageResult[0]?.ai_chats_used || 0;

      if (userPlan === 'free') aiLimit = 5;
      else if (userPlan === 'starter') aiLimit = 100;
      else aiLimit = 9999;

      // Verifică limita
      if (aiUsed >= aiLimit) {
        return { 
          error: `LIMIT_REACHED`,
          limit: aiLimit,
          used: aiUsed,
          plan: userPlan,
          message: userPlan === 'free' 
            ? `Ai folosit ${aiUsed}/${aiLimit} întrebări gratuite luna asta. Deblochează 100/lună pentru $29 pe viață!`
            : `Ai atins limita de ${aiLimit} întrebări. Treci la Pro pentru nelimitat.`
        };
      }
    } catch (e) {
      console.error("Freemium check error", e);
    }
  }

  // Alege modelul în funcție de plan - ECONOMIE MARE
  const model = userPlan === 'free' ? 'gpt-4o-mini' : 'gpt-4o';
  // gpt-4o-mini e 33x mai ieftin decât gpt-4o, perfect pentru free users

  // Pregătim mesajul pentru OpenAI
  let content = [{ type: "text", text: prompt || "Analyze this image for me." }];

  if (imageFile && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64Image}`;
    
    content.push({
      type: "image_url",
      image_url: { url: dataUrl }
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are PetAssistant, an expert AI Veterinarian. Give concise, helpful, empathetic advice about pet health, nutrition, behavior. If image provided, analyze visually for symptoms. Always advise seeing real vet for serious issues. Language: respond in same language as user (Romanian or English). Keep answers short but useful (max 200 words).`
          },
          { role: "user", content: content }
        ],
        max_tokens: userPlan === 'free' ? 300 : 500
      })
    });

    const data = await response.json();
    if (data.error) return { error: data.error.message };
    
    const reply = data.choices[0].message.content;

    // Incrementează usage după succes
    if (userId) {
      try {
        await sql`
          INSERT INTO usage_limits (user_id, ai_chats_used, scans_used, reset_date)
          VALUES (${userId}, 1, 0, NOW() + INTERVAL '1 month')
          ON CONFLICT (user_id) 
          DO UPDATE SET ai_chats_used = usage_limits.ai_chats_used + 1, updated_at = NOW()
        `;
      } catch (e) {
        // Dacă tabela nu există sau eroare, încearcă update simplu
        try {
          await sql`UPDATE usage_limits SET ai_chats_used = ai_chats_used + 1 WHERE user_id = ${userId}`;
        } catch {}
      }
    }

    return { reply, model, usage: { used: aiUsed + 1, limit: aiLimit, plan: userPlan } };

  } catch (err) {
    console.error(err);
    return { error: "Failed to connect to AI. Încearcă din nou." };
  }
}

// --- FRONTEND: Chat Interface cu Paywall ---
export default function ChatPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const loaderData = useLoaderData();
  const isSending = navigation.state === "submitting";
  
  const [messages, setMessages] = useState([
    { role: "ai", text: "Salut! Sunt AI Veterinarul tău 🐾\n\nPoți să mă întrebi orice despre animalul tău sau să trimiți o poză pentru analiză.\n\n💡 Sfat: Spune-mi ce animal ai și ce problemă are." }
  ]);
  
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallData, setPaywallData] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const plan = loaderData?.plan || 'free';
  const isFree = plan === 'free';
  const aiUsed = loaderData?.usage?.ai_chats_used || 0;
  const aiLimit = isFree ? 5 : plan === 'starter' ? 100 : 9999;

  useEffect(() => {
    if (actionData?.reply) {
      setMessages(prev => [...prev, { role: "ai", text: actionData.reply }]);
    }
    if (actionData?.error) {
      if (actionData.error === 'LIMIT_REACHED') {
        setPaywallData(actionData);
        setShowPaywall(true);
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: `🚫 ${actionData.message}`,
          isLimit: true 
        }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: "⚠️ Eroare: " + actionData.error }]);
      }
    }
  }, [actionData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = (e) => {
    if (!input.trim() && !preview) {
        e.preventDefault();
        return;
    }
    
    // Verificare locală rapidă
    if (isFree && aiUsed >= aiLimit) {
      e.preventDefault();
      setPaywallData({ limit: aiLimit, used: aiUsed, plan: 'free', message: `Ai folosit ${aiUsed}/${aiLimit} întrebări gratuite luna asta.` });
      setShowPaywall(true);
      return;
    }
    
    setMessages(prev => [
        ...prev, 
        { role: "user", text: input, image: preview }
    ]);
    
    setInput("");
    setPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
              <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full relative">
                  <Bot size={20} className="text-green-600" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                  <h1 className="font-bold text-gray-900 leading-none text-sm">Vet Expert AI</h1>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isFree ? `${aiUsed}/${aiLimit} gratis luna asta • ` : ''} 
                    <span className={isFree ? 'text-orange-600 font-bold' : 'text-green-600'}>{isFree ? 'Free' : plan === 'starter' ? 'Starter Lifetime' : 'Pro'}</span>
                    {isFree && aiUsed >= aiLimit - 1 && <span className="text-red-500 font-bold"> • Limită aproape</span>}
                  </p>
              </div>
          </div>
        </div>
        
        {isFree && (
          <Link to="/pricing" className="bg-gray-900 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 hover:bg-black">
            <Crown size={12} className="text-orange-400" /> $29
          </Link>
        )}
      </div>

      {/* USAGE BAR - doar pentru free */}
      {isFree && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-gray-500 font-medium">AI Chats gratuite</span>
              <span className={`font-bold ${aiUsed >= aiLimit ? 'text-red-600' : aiUsed >= 3 ? 'text-orange-600' : 'text-gray-700'}`}>{aiUsed}/{aiLimit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${aiUsed >= aiLimit ? 'bg-red-500' : aiUsed >= 3 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min((aiUsed/aiLimit)*100,100)}%` }} />
            </div>
          </div>
          {aiUsed >= 2 && (
            <Link to="/pricing" className="text-[11px] bg-green-600 text-white px-3 py-1 rounded-full font-bold hover:bg-green-700 shrink-0">
              Upgrade $29
            </Link>
          )}
        </div>
      )}

      {/* MESAJE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'ai' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.isLimit ? 'bg-orange-100' : 'bg-green-100'}`}>
                        {msg.isLimit ? <AlertCircle size={16} className="text-orange-600" /> : <Bot size={16} className="text-green-600" />}
                    </div>
                )}

                <div className={`max-w-[82%] rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : msg.isLimit 
                      ? 'bg-orange-50 text-orange-900 border border-orange-200 rounded-tl-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                    {msg.image && (
                        <img src={msg.image} alt="Upload" className="w-full h-48 object-cover rounded-xl mb-3 border border-white/20" />
                    )}
                    <p>{msg.text}</p>
                    {msg.isLimit && (
                      <div className="mt-3">
                        <Link to="/pricing" className="inline-flex bg-gray-900 text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-black">
                          Deblochează pentru $29 pe viață 🚀
                        </Link>
                      </div>
                    )}
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={16} className="text-gray-500" />
                    </div>
                )}
            </div>
        ))}

        {isSending && (
            <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-green-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
                    <span className="text-xs text-gray-400 font-medium">AI analizează...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.8rem] max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white text-center">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown size={24} className="text-yellow-300" />
              </div>
              <h3 className="font-bold text-lg">Ai atins limita gratuită</h3>
              <p className="text-green-100 text-sm mt-1">{paywallData?.used || aiUsed}/{paywallData?.limit || aiLimit} întrebări folosite luna asta</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                {paywallData?.message || `Ai folosit toate întrebările gratuite. Deblochează 100/lună pentru doar $29 pe viață!`}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-green-600" />
                  <span className="font-bold text-sm">Starter Lifetime - $29</span>
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">-76%</span>
                </div>
                <ul className="text-xs text-gray-700 space-y-1 mb-3">
                  <li>✓ 100 întrebări AI / lună</li>
                  <li>✓ GPT-4o complet, fără reclame</li>
                  <li>✓ Pe viață, plată unică</li>
                </ul>
                <Link to="/pricing" className="block w-full bg-green-600 text-white text-center font-bold py-3 rounded-xl hover:bg-green-700">
                  Deblochează $29 pe viață 🚀
                </Link>
              </div>

              <button onClick={() => setShowPaywall(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2">
                Continuă cu planul gratuit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
         <div className="max-w-3xl mx-auto">
            
            {preview && (
                <div className="mb-2 relative inline-block">
                    <img src={preview} alt="Preview" className="h-20 rounded-xl border border-gray-200 shadow-sm" />
                    <button 
                        type="button"
                        onClick={() => { setPreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500"
                    >
                        ✕
                    </button>
                </div>
            )}

            <Form method="post" encType="multipart/form-data" onSubmit={handleSubmit} className="flex items-end gap-2">
                
                <label className={`p-3 rounded-xl cursor-pointer transition ${isFree && aiUsed >= aiLimit ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                    <Paperclip size={20} />
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isFree && aiUsed >= aiLimit}
                    />
                </label>

                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition px-4 py-2.5">
                    <textarea 
                        name="prompt"
                        rows="1"
                        placeholder={isFree && aiUsed >= aiLimit ? "Limită atinsă - fă upgrade pentru a continua" : "Întreabă ceva despre animalul tău..."}
                        className="w-full bg-transparent outline-none text-sm resize-none text-gray-700 placeholder-gray-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isFree && aiUsed >= aiLimit}
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    disabled={isSending || (!input.trim() && !preview) || (isFree && aiUsed >= aiLimit)}
                    className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                >
                    <Send size={20} />
                </button>
            </Form>
            <p className="text-[10px] text-center text-gray-400 mt-2">AI-ul poate greși. Pentru probleme grave, consultă veterinarul.</p>
         </div>
      </div>

    </div>
  );
}
