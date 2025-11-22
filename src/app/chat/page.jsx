"use client";

import { useState, useEffect, useRef } from "react";
import useUser from "../../utils/useUser"; 
import {
  PawPrint,
  Send,
  MessageCircle,
  ArrowLeft,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Curățăm input-ul imediat
    const currentInput = inputMessage;
    setInputMessage("");

    // --- SIMULARE AI ---
    // Așteptăm 1.5 secunde să pară că gândește
    setTimeout(() => {
        let responseText = "That's a great question!";
        
        // Răspunsuri simple bazate pe cuvinte cheie
        const lowerInput = currentInput.toLowerCase();
        if (lowerInput.includes("chocolate")) {
            responseText = "⚠️ Chocolate is toxic to dogs! It contains theobromine, which dogs cannot metabolize well. If your dog ate chocolate, please contact your vet immediately.";
        } else if (lowerInput.includes("meow") || lowerInput.includes("cat")) {
            responseText = "Cats often meow at night due to boredom, hunger, or seeking attention. Ensuring they have a play session before bed might help!";
        } else if (lowerInput.includes("feed") || lowerInput.includes("food")) {
            responseText = "Feeding schedules depend on your pet's age and breed. Generally, puppies need 3-4 meals a day, while adult dogs do well with 2.";
        } else {
            const genericResponses = [
                "I'm your AI Pet Assistant. While I can give general advice, for serious medical issues, always consult a vet.",
                "That sounds interesting! Tell me more about your pet's behavior.",
                "Keeping your pet hydrated and active is key to a long, happy life.",
                "Could you clarify what kind of pet you are asking about?"
            ];
            responseText = genericResponses[Math.floor(Math.random() * genericResponses.length)];
        }
        
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: responseText, id: Date.now() + 1 },
        ]);
        setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    AI Pet Assistant
                  </h1>
                  <p className="text-sm text-gray-600">
                    Get expert pet care advice (Demo Mode)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <PawPrint className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Bot className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to PetAssistent AI!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  I'm here to help with all your pet care questions.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="bg-blue-100 p-2 rounded-full h-fit">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="bg-green-100 p-2 rounded-full h-fit">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-blue-100 p-2 rounded-full h-fit">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about pet care..."
                className="flex-1 resize-none border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="1"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;