import { Link } from "react-router";
import { ArrowLeft, Scale, AlertTriangle } from "lucide-react";

export default function Terms() {
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
                    <Scale size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
            </div>

            {/* Disclaimer */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-xl">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-orange-800">Medical Disclaimer</h4>
                        <p className="text-sm text-orange-700 mt-1">
                            PetAssistant uses Artificial Intelligence to provide information. This is <strong>NOT</strong> a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian.
                        </p>
                    </div>
                </div>
            </div>

            <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                <p className="text-sm text-gray-500">Effective Date: November 25, 2025</p>
                
                <hr className="border-gray-100"/>

                <h3 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h3>
                <p>
                    By accessing or using PetAssistant, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                </p>

                <h3 className="text-lg font-bold text-gray-900">2. AI Accuracy</h3>
                <p>
                   The "AI Scanner" feature is experimental. While we strive for accuracy, the AI may misinterpret images (e.g., confusing a safe toy with a dangerous object). Use your own judgment.
                </p>

                <h3 className="text-lg font-bold text-gray-900">3. User Accounts</h3>
                <p>
                    When you create an account with us, you must provide information that is accurate. You are responsible for safeguarding the password that you use to access the Service.
                </p>

                <h3 className="text-lg font-bold text-gray-900">4. Termination</h3>
                <p>
                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}