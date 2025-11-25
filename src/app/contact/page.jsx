import { Link, Form } from "react-router";
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center items-center">
      <div className="w-full max-w-5xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
             <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
            
            {/* LEFT: Info */}
            <div className="bg-green-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500 rounded-full opacity-50"></div>
                
                <div>
                    <h1 className="text-3xl font-extrabold mb-4">Get in Touch</h1>
                    <p className="text-green-100 text-sm leading-relaxed mb-8">
                        Have questions about PetAssistant? We're here to help you and your furry friend.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Mail size={20} /></div>
                            <div>
                                <p className="text-xs text-green-200 font-bold uppercase">Email</p>
                                <p className="font-medium">support@petassistant.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><MapPin size={20} /></div>
                            <div>
                                <p className="text-xs text-green-200 font-bold uppercase">Location</p>
                                <p className="font-medium">New York, USA</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Phone size={20} /></div>
                            <div>
                                <p className="text-xs text-green-200 font-bold uppercase">Phone</p>
                                <p className="font-medium">+1 (555) 123-4567</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-xs text-green-200 opacity-60">
                    © 2025 PetAssistant. All rights reserved.
                </div>
            </div>

            {/* RIGHT: Form */}
            <div className="p-10 bg-white">
                <Form className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                        <input type="email" placeholder="john@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                        <textarea rows="4" placeholder="How can we help?" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white resize-none transition"></textarea>
                    </div>

                    <button className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </Form>
            </div>

        </div>
      </div>
    </div>
  );
}