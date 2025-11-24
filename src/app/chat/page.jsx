import { useState, useEffect, useRef } from "react";
import { Form, useNavigation, useActionData, Link } from "react-router";
import { ArrowLeft, Send, Image as ImageIcon, Bot, User, Loader2 } from "lucide-react";

// --- BACKEND: Discuția cu OpenAI (Server-Side) ---
export async function action({ request }) {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const imageFile = formData.get("image");

  if (!prompt && !imageFile) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "Lipsă API Key! Configurează .env" };

  // Construim mesajul pentru AI
  let content = [{ type: "text", text: prompt || "Analizează această imagine." }];

  // Dacă avem poză, o transformăm în Base64
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
        model: "gpt-4o", // Model capabil de viziune (Vision)
        messages: [
          {
            role: "system",
            content: "Ești PetAssistant, un expert veterinar AI. Răspunzi scurt, empatic și profesionist. Dacă primești o poză, analizeaz-o vizual pentru simptome (piele, ochi, răni, produse). Nu da diagnostice definitive, ci sfaturi și recomandă vizita la medic dacă pare grav."
          },
          { role: "user", content: content }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    if (data.error) return { error: data.error.message };
    
    return { reply: data.choices[0].message.content };

  } catch (err) {
    return { error: "Eroare la conectarea cu AI." };
  }
}

// --- FRONTEND: Interfața de Chat ---
export default function ChatPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSending = navigation.state === "submitting";
  
  // State pentru mesaje
  const [messages, setMessages] = useState([
    { role: "ai", text: "Salut! Sunt asistentul tău veterinar. Îmi poți trimite o poză cu problema animalului sau o întrebare." }
  ]);
  
  // State pentru input
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Când primim răspuns de la server (AI), îl adăugăm în listă
  useEffect(() => {
    if (actionData?.reply) {
      setMessages(prev => [...prev, { role: "ai", text: actionData.reply }]);
    }
    if (actionData?.error) {
        setMessages(prev => [...prev, { role: "ai", text: "⚠️ Eroare: " + actionData.error }]);
    }
  }, [actionData]);

  // Scroll automat jos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gestionează trimiterea manuală (pentru a updata UI-ul instant)
  const handleSubmit = (e) => {
    if (!input.trim() && !preview) {
        e.preventDefault();
        return;
    }
    
    // Adăugăm mesajul utilizatorului în listă imediat
    setMessages(prev => [
        ...prev, 
        { role: "user", text: input, image: preview }
    ]);
    
    setInput("");
    setPreview(null);
    // Formularul se trimite automat către action...
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
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full relative">
                <Bot size={24} className="text-green-600" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
                <h1 className="font-bold text-gray-900 leading-none">Vet Expert AI</h1>
                <p className="text-xs text-gray-500">Online • Răspunde instant</p>
            </div>
        </div>
      </div>

      {/* ZONA MESAJE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'ai' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={16} className="text-green-600" />
                    </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                    {msg.image && (
                        <img src={msg.image} alt="Upload" className="w-full h-48 object-cover rounded-lg mb-3 border border-white/20" />
                    )}
                    <p>{msg.text}</p>
                </div>

                {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={16} className="text-gray-500" />
                    </div>
                )}
            </div>
        ))}

        {/* Loading Animation */}
        {isSending && (
            <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-green-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
                    <span className="text-xs text-gray-400">Analizez datele...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA (Jos) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
         <div className="max-w-3xl mx-auto">
            
            {/* Preview Poză înainte de trimitere */}
            {preview && (
                <div className="mb-2 relative inline-block">
                    <img src={preview} alt="Preview" className="h-20 rounded-lg border border-gray-200" />
                    <button 
                        onClick={() => { setPreview(null); fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            <Form method="post" encType="multipart/form-data" onSubmit={handleSubmit} className="flex items-end gap-2">
                
                {/* Buton Upload Poză */}
                <label className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl cursor-pointer transition">
                    <ImageIcon size={24} />
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </label>

                {/* Text Input */}
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition px-4 py-2">
                    <textarea 
                        name="prompt"
                        rows="1"
                        placeholder="Scrie o întrebare sau trimite o poză..."
                        className="w-full bg-transparent outline-none text-sm resize-none pt-1 text-gray-700 placeholder-gray-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                // Nu putem da submit programatic ușor la Form în React Router v7 fără hook-uri complexe, 
                                // așa că ne bazăm pe butonul de send.
                            }
                        }}
                    ></textarea>
                </div>

                {/* Buton Trimite */}
                <button 
                    type="submit" 
                    disabled={isSending || (!input && !preview)}
                    className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-green-100"
                >
                    {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
            </Form>
         </div>
      </div>

    </div>
  );
}