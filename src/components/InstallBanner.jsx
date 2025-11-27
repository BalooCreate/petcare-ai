import { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Ascuns by default

  useEffect(() => {
    // 1. Verifică dacă e deja instalată
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("Aplicația este deja instalată.");
      setIsVisible(false);
      return;
    }

    // 2. Detectează iOS (iPhone)
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIosDevice) {
        setIsIOS(true);
        setIsVisible(true); // Pe iOS îl arătăm mereu
    }

    // 3. Capturează evenimentul pe Android / PC
    const handler = (e) => {
      console.log("✅ Evenimentul 'beforeinstallprompt' a fost capturat!");
      e.preventDefault(); // Oprește bannerul automat al browserului
      setDeferredPrompt(e); // Salvăm evenimentul în variabilă
      setIsVisible(true); // ACUM afișăm butonul nostru
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    console.log("Ai apăsat butonul Install.");

    if (!deferredPrompt) {
        console.log("❌ Eroare: deferredPrompt este null. Arăt instrucțiunile PC.");
        alert("Instalarea automată nu e disponibilă momentan.\nCaută iconița de instalare în bara de adresă a browserului.");
        return;
    }

    console.log("🚀 Lansăm prompt-ul de instalare...");
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Rezultat instalare: ${outcome}`);
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:static md:max-w-sm md:mx-auto md:my-4">
        <div className="bg-green-600 rounded-lg p-4 text-white shadow-xl border border-green-500 animate-fade-in">
        
        <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-2 right-2 text-green-200 hover:text-white p-1"
        >
            <X size={16} />
        </button>

        <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full shrink-0 flex items-center justify-center">
                <Download size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base">Instalează Aplicația</h3>
                
                {isIOS ? (
                    <div className="text-xs text-green-50 mt-1 leading-relaxed">
                        Apasă butonul <Share size={12} className="inline mx-1" /> și alege <br/>
                        <b>Add to Home Screen</b>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-xs text-green-100">
                            Acces rapid și experiență full-screen.
                        </p>
                        <button 
                            onClick={handleInstallClick}
                            className="bg-white text-green-700 px-4 py-2 rounded-md font-bold text-sm shadow hover:bg-gray-100 transition w-full active:scale-95"
                        >
                            INSTALEAZĂ ACUM
                        </button>
                    </div>
                )}
            </div>
        </div>
        </div>
    </div>
  );
}