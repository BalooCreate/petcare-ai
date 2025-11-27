import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detectăm dacă e iPhone/iPad
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIosDevice) {
        setIsIOS(true);
        // Pe iPhone îl arătăm mereu (poți pune o logică să îl ascunzi după ce dă x)
        setIsVisible(true);
    }

    // 2. Detectăm Android / Desktop (Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-green-600 rounded-xl p-4 text-white shadow-lg relative animate-fade-in">
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute top-2 right-2 text-green-200 hover:text-white"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg shrink-0">
            <Download size={24} className="text-white" />
        </div>
        
        <div className="flex-1">
            <h3 className="font-bold text-sm">Instalează PetAssistant</h3>
            
            {isIOS ? (
                // --- VARIANTA IPHONE ---
                <div className="text-xs text-green-50 mt-1 space-y-1">
                    <p>Pe iPhone, instalarea se face manual:</p>
                    <div className="flex items-center gap-1">
                        1. Apasă butonul <Share size={12} /> (jos)
                    </div>
                    <div className="flex items-center gap-1">
                        2. Alege <PlusSquare size={12} /> <b>Add to Home Screen</b>
                    </div>
                </div>
            ) : (
                // --- VARIANTA ANDROID ---
                <div className="mt-1">
                    <p className="text-xs text-green-100 mb-2">Adaugă aplicația pe ecranul principal pentru acces rapid.</p>
                    <button 
                        onClick={handleAndroidInstall}
                        className="bg-white text-green-700 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm hover:bg-gray-100 transition"
                    >
                        Instalează Acum
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}