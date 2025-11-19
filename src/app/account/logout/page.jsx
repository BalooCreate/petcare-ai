import useAuth from "@/utils/useAuth";
import { Heart, PawPrint } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <PawPrint className="w-8 h-8 text-green-600" />
            </div>
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            PetAssistent
          </h1>
          <p className="text-gray-600">Thanks for using PetAssistent</p>
        </div>

        {/* Sign Out Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Sign Out
          </h2>

          <div className="text-center space-y-6">
            <p className="text-gray-600">
              Are you sure you want to sign out of your PetAssistent account?
            </p>

            <button
              onClick={handleSignOut}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Sign Out
            </button>

            <div className="text-center">
              <a
                href="/dashboard"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Cancel and return to dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Your pet's health and happiness, simplified
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
