import { Link } from "react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-green-50/50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 bg-white px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft size={18} /> Back
            </Link>
        </div>
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                <ShieldAlert className="text-green-600" /> Refund Policy
            </h1>
            <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                <p className="font-medium bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800">
                    <strong>Summary:</strong> You have 14 days FREE. If you do not cancel before the trial ends, you will be charged. We do not offer refunds for forgotten cancellations.
                </p>
                <h3 className="text-lg font-bold text-gray-900">1. Free Trial</h3>
                <p>Your membership starts with a 14-day free trial. You must provide a payment method, but you will not be charged until day 15.</p>
                <h3 className="text-lg font-bold text-gray-900">2. Cancellation</h3>
                <p>You can cancel anytime in your Settings. If you cancel during the trial, you pay $0.</p>
                <h3 className="text-lg font-bold text-gray-900">3. No Refunds</h3>
                <p>Once the trial ends and the charge is processed, it is non-refundable for that month.</p>
            </div>
        </div>
      </div>
    </div>
  );
}