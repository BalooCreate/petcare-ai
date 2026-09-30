// ============================================================
//  VideoShowcase — secțiunea de video de pe pagina principală
//
//  Două clipuri, ambele fără sunet (tot textul e pe ecran):
//    • "What is PetAssistant" — 32s
//    • "How to use it"        — 42s, ghid pas cu pas
//
//  Se încarcă abia când ajunge în ecran, ca să nu strice viteza.
//  Pornește silențios și se repetă — ca un poster care mișcă.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { Play, Sparkles } from "lucide-react";

const VIDEO = {
  overview: { src: "/about-petassistant.mp4", poster: "/video-poster-overview.jpg", label: "What is PetAssistant", seconds: 32 },
  guide:    { src: "/how-to-use-petassistant.mp4", poster: "/video-poster-guide.jpg", label: "How to use it", seconds: 42 },
};

export default function VideoShowcase() {
  const [active, setActive] = useState("overview");
  const [seen, setSeen] = useState(false);
  const wrap = useRef(null);
  const vid = useRef(null);
  const v = VIDEO[active];

  // Nu descărcăm video-ul până nu se apropie de ecran.
  useEffect(() => {
    const el = wrap.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setSeen(true)),
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (vid.current) { vid.current.currentTime = 0; vid.current.play().catch(() => {}); }
  }, [active, seen]);

  return (
    <section ref={wrap} className="py-16 px-4 bg-gradient-to-b from-white to-green-50/40">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Sparkles size={14} />
          {v.seconds}-SECOND TOUR · NO SOUND NEEDED
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">See it in action.</h2>
        <p className="mt-3 text-gray-600">No signup to watch. This is the real app, not a mockup.</p>

        <div className="mt-8 relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-black aspect-[9/16] max-h-[70vh] mx-auto">
          {!seen ? (
            <button onClick={() => setSeen(true)} aria-label={`Play: ${v.label}`}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900 group">
              <img src={v.poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition" loading="lazy" />
              <span className="relative z-10 bg-white/95 text-green-700 rounded-full p-5 shadow-xl group-hover:scale-110 transition">
                <Play size={30} fill="currentColor" />
              </span>
            </button>
          ) : (
            <video ref={vid} key={active} src={v.src} poster={v.poster}
              autoPlay muted loop playsInline preload="metadata"
              className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-gray-200 shadow-sm">
          {Object.entries(VIDEO).map(([key, item]) => (
            <button key={key} onClick={() => setActive(key)}
              className={`py-3 px-3 rounded-xl text-sm font-bold transition ${active === key ? "bg-green-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">Silent video — all steps are written on screen.</p>
      </div>
    </section>
  );
}
