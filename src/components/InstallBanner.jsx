import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Vizibil din start
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      setIsVisible(false);
    }

    // Detect iPhone
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIosDevice) {
        setIsIOS(true);
    }

    // Capture install event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsVisible(false);
        return;
    }

    if (!isIOS) {
        alert("To install on PC:\nLook for the Install icon (Computer with arrow) in your browser's address bar.");
    }
  };

  if (isStandalone) return null;
  if (!isVisible) return null;

  return (
    // AM MICȘORAT LĂȚIMEA (max-w-sm) ȘI PADDING-UL (p-3)
    <div className="bg-green-600 rounded-lg p-3 text-white shadow-md relative animate-fade-in mx-auto max-w-sm my-4 border border-green-500">
      
      {/* Buton X mic și discret */}
      <button 
        onClick={() => setIsVisible(false)} 
        className="absolute top-2 right-2 text-green-200 hover:text-white"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-3">
        {/* Iconiță mai mică */}
        <div className="bg-white/20 p-2 rounded-md shrink-0 flex items-center justify-center">
            <Download size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm leading-tight">Get the App</h3>
            
            {isIOS ? (
                // --- ENGLISH iOS ---
                <div className="text-[10px] text-green-50 leading-tight mt-1">
                    Tap <Share size={10} className="inline" /> then <b>Add to Home Screen</b>
                </div>
            ) : (
                // --- ENGLISH Android/PC ---
                <div className="flex items-center justify-between mt-1 gap-2">
                    <p className="text-[10px] text-green-100 leading-tight">
                        Better experience & speed.
                    </p>
                    <button 
                        onClick={handleInstallClick}
                        className="bg-white text-green-700 px-3 py-1 rounded-md font-bold text-xs shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
                    >
                        Install
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}