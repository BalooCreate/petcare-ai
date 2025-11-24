import { useState, useEffect, useRef } from "react";
import { Form, useNavigation, useActionData, Link } from "react-router";
import { ArrowLeft, Send, Image as ImageIcon, Bot, User, Loader2, Paperclip } from "lucide-react";

// --- BACKEND: Server-Side Logic ---
export async function action({ request }) {
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const imageFile = formData.get("image");

  if (!prompt && (!imageFile || imageFile.size === 0)) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "No API Key found." };

  // Pregătim mesajul pentru OpenAI
  let content = [{ type: "text", text: prompt || "Analyze this image for me." }];

  // Procesare Poză (dacă există)
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
        model: "gpt-4o", // Modelul care vede poze
        messages: [
          {
            role: "system",
            content: "You are PetAssistant, an expert AI Veterinarian. Give concise, helpful, and empathetic advice about pet health, nutrition, and behavior. If an image is provided, analyze it visually for symptoms. Always advise seeing a real vet for serious issues."
          },
          { role: "user", content: content }
        ],
        max_tokens: 400
      })
    });

    const data = await response.json();
    if (data.error) return { error: data.error.message };
    
    return { reply: data.choices[0].message.content };

  } catch (err) {
    return { error: "Failed to connect to AI." };
  }
}

// --- FRONTEND: Chat Interface ---
export default function ChatPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSending = navigation.state === "submitting";
  
  // Istoricul mesajelor
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your AI Vet Assistant. You can ask me anything or send a photo of your pet for analysis. 🐾" }
  ]);
  
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Când vine răspunsul de la AI, îl adăugăm în chat
  useEffect(() => {
    if (actionData?.reply) {
      setMessages(prev => [...prev, { role: "ai", text: actionData.reply }]);
    }
    if (actionData?.error) {
        setMessages(prev => [...prev, { role: "ai", text: "⚠️ Error: " + actionData.error }]);
    }
  }, [actionData]);

  // Scroll automat la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Gestionează trimiterea manuală pentru a updata UI-ul instant
  const handleSubmit = (e) => {
    if (!input.trim() && !preview) {
        e.preventDefault();
        return;
    }
    
    // Adăugăm mesajul utilizatorului instant
    setMessages(prev => [
        ...prev, 
        { role: "user", text: input, image: preview }
    ]);
    
    setInput("");
    setPreview(null);
    // Formularul continuă să trimită datele la server...
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
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
            <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full relative">
                <Bot size={24} className="text-green-600" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
                <h1 className="font-bold text-gray-900 leading-none text-sm">Vet Expert AI</h1>
                <p className="text-[10px] text-green-600 font-medium mt-0.5">Online • Replies instantly</p>
            </div>
        </div>
      </div>

      {/* MESAJE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'ai' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={16} className="text-green-600" />
                    </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
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

        {/* Loading Bubbles */}
        {isSending && (
            <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-green-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
                    <span className="text-xs text-gray-400 font-medium">Analyzing...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
         <div className="max-w-3xl mx-auto">
            
            {/* Preview Poză */}
            {preview && (
                <div className="mb-2 relative inline-block animate-fadeIn">
                    <img src={preview} alt="Preview" className="h-20 rounded-lg border border-gray-200 shadow-sm" />
                    <button 
                        type="button"
                        onClick={() => { setPreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 transition"
                    >
                        ✕
                    </button>
                </div>
            )}

            <Form method="post" encType="multipart/form-data" onSubmit={handleSubmit} className="flex items-end gap-2">
                
                {/* Upload Button */}
                <label className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl cursor-pointer transition">
                    <Paperclip size={20} />
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </label>

                {/* Text Area */}
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition px-4 py-2.5">
                    <textarea 
                        name="prompt"
                        rows="1"
                        placeholder="Ask a question or send a photo..."
                        className="w-full bg-transparent outline-none text-sm resize-none text-gray-700 placeholder-gray-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                // Optional: Submit on Enter (requires ref to button or form logic)
                            }
                        }}
                    ></textarea>
                </div>

                {/* Send Button */}
                <button 
                    type="submit" 
                    disabled={isSending || (!input.trim() && !preview)}
                    className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-green-100"
                >
                    <Send size={20} />
                </button>
            </Form>
         </div>
      </div>

    </div>
  );
}