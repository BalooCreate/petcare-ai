import { Link } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-4xl">
        
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
             <ArrowLeft size={18} /> Back
          </Link>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
            </div>

            <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                <p className="text-sm text-gray-500">Last updated: November 25, 2025</p>
                
                <hr className="border-gray-100"/>

                <h3 className="text-lg font-bold text-gray-900">1. Introduction</h3>
                <p>
                    Welcome to PetAssistant. We value your privacy and are committed to protecting your personal data. 
                    This privacy policy explains how we look after your personal data when you visit our website or use our app.
                </p>

                <h3 className="text-lg font-bold text-gray-900">2. Data We Collect</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you and your pet:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Identity Data:</strong> Name, pet name, pet breed, pet age.</li>
                    <li><strong>Contact Data:</strong> Email address.</li>
                    <li><strong>Health Data:</strong> Medical logs, weight history, vaccine records (user generated).</li>
                    <li><strong>Media:</strong> Photos of your pet uploaded for profile or AI scanning.</li>
                </ul>

                <h3 className="text-lg font-bold text-gray-900">3. How We Use Your Data</h3>
                <p>We use your data to provide the AI scanning features, manage your pet's schedule, and send you notifications for upcoming vet visits.</p>

                <h3 className="text-lg font-bold text-gray-900">4. Data Security</h3>
                <p>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}