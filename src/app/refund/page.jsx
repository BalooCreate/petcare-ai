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
                    <strong>Summary:</strong> The Free plan is free forever — no card, nothing to cancel. Paid plans (Starter €29, Pro €49) are one-time lifetime payments covered by a 30-day money-back guarantee.
                </p>
                <h3 className="text-lg font-bold text-gray-900">1. Free Plan</h3>
                <p>The Free plan is free forever. No payment method is required, nothing is charged, and the plan never expires. You get 1 pet, 5 AI questions per month and 3 smart scans per month.</p>
                <h3 className="text-lg font-bold text-gray-900">2. Lifetime Plans (Starter €29 / Pro €49)</h3>
                <p>Lifetime plans are a single one-time payment. There is no recurring charge and nothing to cancel — you pay once and keep access. If you choose an optional monthly subscription instead (€4.99 or €9.99), you can cancel anytime from your Settings and you will not be charged again.</p>
                <h3 className="text-lg font-bold text-gray-900">3. 30-Day Money-Back Guarantee</h3>
                <p>If you are not satisfied with a paid plan, contact us within 30 days of purchase and we will issue a full refund — no questions asked. Refunds are issued to the original payment method and may take 5–10 business days to appear.</p>
                <h3 className="text-lg font-bold text-gray-900">4. Questions</h3>
                <p>Reach us through the Contact page and we will get back to you.</p>
            </div>
        </div>
      </div>
    </div>
  );
}