import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // 1. Oprim browserul să afișeze pop-up-ul lui automat (dacă vrea)
      e.preventDefault();
      // 2. Salvăm evenimentul ca să-l declanșăm noi când vrem
      setDeferredPrompt(e);
      // 3. Afișăm butonul nostru
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Declanșăm instalarea
    deferredPrompt.prompt();

    // Așteptăm să vedem ce a decis utilizatorul
    const { outcome } = await deferredPrompt.userChoice;
    
    // Resetăm
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null; // Dacă nu e gata de instalare, nu arătăm nimic

  return (
    <div className="mb-6 bg-green-600 rounded-xl p-4 text-white shadow-lg flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
            <Download size={24} className="text-white" />
        </div>
        <div>
            <h3 className="font-bold text-sm">Instalează Aplicația</h3>
            <p className="text-xs text-green-100">Acces rapid de pe ecranul tău</p>
        </div>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-white text-green-700 px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:bg-gray-100 transition"
      >
        Instalează
      </button>
    </div>
  );
}