"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useUser from "@/utils/useUser";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";
import {
  PawPrint,
  Send,
  MessageCircle,
  ArrowLeft,
  Bot,
  User,
  Loader2,
} from "lucide-react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleFinish = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: message, id: Date.now() },
    ]);
    setStreamingMessage("");
    setIsLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const messageToSend = inputMessage.trim();
    setInputMessage("");

    try {
      // Save user message to database
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: messageToSend,
          role: "user",
          title: conversationId ? undefined : "Pet Care Chat",
        }),
      });

      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        if (!conversationId) {
          setConversationId(chatData.conversation_id);
        }
      }

      // Prepare messages for AI
      const allMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system message for pet care context
      const systemMessage = {
        role: "system",
        content: `You are PetAssistent, a helpful AI assistant specialized in pet care. You provide accurate, caring advice about pet health, behavior, nutrition, and general care. Always recommend consulting a veterinarian for serious health concerns. Be friendly, empathetic, and informative. If asked about something outside of pet care, politely redirect the conversation back to pets.`,
      };

      const aiResponse = await fetch(
        "/integrations/chat-gpt/conversationgpt4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [systemMessage, ...allMessages],
            stream: true,
          }),
        },
      );

      if (!aiResponse.ok) {
        throw new Error("Failed to get AI response");
      }

      handleStreamResponse(aiResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          id: Date.now(),
        },
      ]);
      setIsLoading(false);
    }
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
                onClick={() => (window.location.href = "/dashboard")}
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
                    Get expert pet care advice
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
            {messages.length === 0 && !streamingMessage && (
              <div className="text-center py-12">
                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <Bot className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to PetAssistent AI!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  I'm here to help with all your pet care questions. Ask me
                  about health, behavior, nutrition, training, or anything else
                  about your furry friends!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() =>
                      setInputMessage("Is chocolate toxic to dogs?")
                    }
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      Is chocolate toxic to dogs?
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("Why is my cat meowing at night?")
                    }
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      Why is my cat meowing at night?
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("How often should I feed my puppy?")
                    }
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      How often should I feed my puppy?
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInputMessage("What are signs of illness in pets?")
                    }
                    className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      What are signs of illness in pets?
                    </p>
                  </button>
                </div>
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

              {/* Streaming Message */}
              {streamingMessage && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-blue-100 p-2 rounded-full h-fit">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800">
                    <p className="whitespace-pre-wrap">{streamingMessage}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingMessage && (
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
            <p className="text-xs text-gray-500 mt-2 text-center">
              PetAssistent AI can make mistakes. Always consult a veterinarian
              for serious health concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
