import { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Ascuns by default

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("App is already installed.");
      setIsVisible(false);
      return;
    }

    // 2. Detect iOS (iPhone)
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIosDevice) {
        setIsIOS(true);
        setIsVisible(true); // On iOS we always show it
    }

    // 3. Capture the event on Android / desktop
    const handler = (e) => {
      console.log("✅ Evenimentul 'beforeinstallprompt' a fost capturat!");
      e.preventDefault(); // Stop the browser's automatic banner
      setDeferredPrompt(e); // Save the event in a variable
      setIsVisible(true); // NOW we show our own button
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    console.log("Install button pressed.");

    if (!deferredPrompt) {
        console.log("❌ Error: deferredPrompt is null. Showing desktop instructions.");
        alert("Automatic install is not available right now.\nLook for the install icon in your browser address bar.");
        return;
    }

    console.log("🚀 Launching install prompt...");
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
                <h3 className="font-bold text-base">Install the App</h3>
                
                {isIOS ? (
                    <div className="text-xs text-green-50 mt-1 leading-relaxed">
                        Tap the <Share size={12} className="inline mx-1" /> button and choose <br/>
                        <b>Add to Home Screen</b>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 mt-2">
                        <p className="text-xs text-green-100">
                            Fast access and a full-screen experience.
                        </p>
                        <button 
                            onClick={handleInstallClick}
                            className="bg-white text-green-700 px-4 py-2 rounded-md font-bold text-sm shadow hover:bg-gray-100 transition w-full active:scale-95"
                        >
                            INSTALL NOW
                        </button>
                    </div>
                )}
            </div>
        </div>
        </div>
    </div>
  );
}