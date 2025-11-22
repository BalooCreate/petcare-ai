import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../utils/useAuth"; // ✅ Cale relativă corectă

export default function LogoutPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      navigate("/");
    };
    performLogout();
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}