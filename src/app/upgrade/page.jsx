import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import PricingPage from "../pricing/page.jsx";

export default function UpgradePage() {
  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-20">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-bold text-sm">Upgrade — Pick your Lifetime plan</span>
      </div>
      <PricingPage />
    </div>
  );
}
