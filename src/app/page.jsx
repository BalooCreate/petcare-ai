import { Link } from "react-router";
import { 
  PawPrint, Calendar, Activity, ShieldCheck, Check, Star, 
  Camera, MessageCircle, Heart, Zap, Gift, Clock, Users, Sparkles
} from "lucide-react";
import InstallBanner from "../components/InstallBanner"; 

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-[72px] flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-xl">
            <PawPrint className="text-green-600" size={22} />
          </div>
          <span className="font-extrabold text-[20px] tracking-tight text-gray-900">PetAssistant</span>
          <span className="ml-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Free Forever</span>
        </div>
        <div className="flex gap-2 items-center">
          <Link to="/pricing" className="hidden md:block px-4 py-2 font-bold text-sm text-gray-600 hover:text-green-600 transition">
            Prețuri
          </Link>
          <Link to="/login" className="px-5 py-2.5 font-bold text-sm text-gray-600 hover:text-green-600 transition">
            Log In
          </Link>
          <Link to="/signup?plan=free" className="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100">
            Începe Gratis
          </Link>
        </div>
      </nav>

      {/* HERO - FREEMIUM */}
      <div className="text-center pt-14 pb-20 px-6 bg-gradient-to-b from-white via-[#F1FFF6]/50 to-[#F1FFF6]">
        <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm mb-6">
          <Gift size={14} /> <span>100% Gratis pentru început • Fără card necesar</span>
        </div>
        
        <h1 className="text-[40px] md:text-[64px] font-extrabold text-gray-900 mb-5 tracking-tight leading-[0.95]">
          Asistentul <br /> 
          <span className="text-green-600 relative">
            Inteligent
            <span className="absolute -top-2 -right-6 text-pink-400 text-2xl animate-pulse">♥</span>
          </span> <br />
          pentru animalul tău
        </h1>
        
        <p className="text-gray-600 text-[17px] max-w-2xl mx-auto mb-3 leading-relaxed">
          Gestionează rutina, sănătatea și primește sfaturi AI de la veterinar. <br />
          <span className="font-bold text-gray-900">Începe gratis în 20 secunde, fără card.</span> Plătești doar dacă îți place.
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-8 mt-4">
          <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Fără card</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> 20 sec setup</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Anulezi oricând</span>
        </div>

        <div className="max-w-[360px] mx-auto mb-6">
            <InstallBanner />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/signup?plan=free" className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-[17px] hover:bg-green-700 transition shadow-xl shadow-green-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <PawPrint size={20} /> Începe Gratis Acum
          </Link>
          <Link to="/chat" className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-[17px] hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <MessageCircle size={20} /> Încearcă AI-ul
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-[10px]">🐶</div>
            <div className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center text-[10px]">🐱</div>
            <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-[10px]">🐾</div>
          </div>
          <span><strong className="text-gray-900">1,200+</strong> stăpâni fericiți • ⭐ 4.9/5</span>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="py-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Date criptate</span>
          <span className="flex items-center gap-2"><Heart size={16} className="text-red-400" /> Iubit de veterinari</span>
          <span className="flex items-center gap-2"><Zap size={16} className="text-orange-400" /> Răspuns în 3 secunde</span>
          <span className="flex items-center gap-2"><Users size={16} className="text-blue-400" /> 100% Gratis la început</span>
        </div>
      </div>

      {/* FEATURES - 4 CARDS */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Tot ce ai nevoie, într-un loc</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">De la programări la sfaturi AI, PetAssistant e ca un veterinar în buzunar - gratis pentru început.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-[#F1FFF6] p-6 rounded-[1.5rem] border border-green-100 hover:shadow-lg transition group">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition"><Calendar className="text-green-600" /></div>
              <h3 className="font-bold text-gray-900">Programări Smart</h3>
              <p className="text-sm text-gray-500 mt-1">Mâncare, plimbări, vaccinuri - nu mai uiți nimic.</p>
              <span className="text-[11px] font-bold text-green-600 mt-3 inline-block bg-green-100 px-2 py-1 rounded-full">GRATIS</span>
            </div>
            <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 hover:shadow-lg transition group">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition"><MessageCircle className="text-blue-600" /></div>
              <h3 className="font-bold text-gray-900">AI Veterinar</h3>
              <p className="text-sm text-gray-500 mt-1">Întreabă orice, trimite poze, primești răspuns instant.</p>
              <span className="text-[11px] font-bold text-blue-600 mt-3 inline-block bg-blue-100 px-2 py-1 rounded-full">5 GRATIS / LUNĂ</span>
            </div>
            <div className="bg-purple-50 p-6 rounded-[1.5rem] border border-purple-100 hover:shadow-lg transition group">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition"><Activity className="text-purple-600" /></div>
              <h3 className="font-bold text-gray-900">Jurnal Sănătate</h3>
              <p className="text-sm text-gray-500 mt-1">Greutate, simptome, medicamente - totul organizat.</p>
              <span className="text-[11px] font-bold text-purple-600 mt-3 inline-block bg-purple-100 px-2 py-1 rounded-full">GRATIS</span>
            </div>
            <div className="bg-orange-50 p-6 rounded-[1.5rem] border border-orange-100 hover:shadow-lg transition group">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition"><Camera className="text-orange-600" /></div>
              <h3 className="font-bold text-gray-900">Smart Scan</h3>
              <p className="text-sm text-gray-500 mt-1">Scanează mâncare, jucării, medicamente cu AI.</p>
              <span className="text-[11px] font-bold text-orange-600 mt-3 inline-block bg-orange-100 px-2 py-1 rounded-full">3 GRATIS / LUNĂ</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING TEASER - FREEMIUM */}
      <div className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Gift size={12} /> Model Freemium - Plătești doar dacă vrei mai mult
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Începe gratis, <span className="text-green-600">fă upgrade doar dacă iubești</span> 🐶
            </h2>
            <p className="text-gray-500 mt-3">Fără card necesar. Fără trial care expiră. Gratis pentru totdeauna cu 1 animal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="bg-white p-7 rounded-[1.8rem] border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Free Forever</h3>
              <div className="flex items-baseline gap-1 mb-4"><span className="text-4xl font-extrabold">$0</span><span className="text-gray-400 text-sm">/ pe viață</span></div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                <li className="flex gap-2"><Check size={16} className="text-green-500 mt-0.5" /> 1 animal</li>
                <li className="flex gap-2"><Check size={16} className="text-green-500 mt-0.5" /> 5 AI chats / lună</li>
                <li className="flex gap-2"><Check size={16} className="text-green-500 mt-0.5" /> Jurnal sănătate</li>
                <li className="flex gap-2"><Check size={16} className="text-gray-300 mt-0.5" /> <span className="text-gray-400">Cu reclame discrete</span></li>
              </ul>
              <Link to="/signup?plan=free" className="block w-full py-3 text-center rounded-xl border-2 border-gray-900 font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition">Începe Gratis</Link>
            </div>

            {/* STARTER LIFETIME - HIGHLIGHT */}
            <div className="bg-white p-7 rounded-[1.8rem] border-2 border-green-500 shadow-xl relative scale-[1.02]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">🔥 Cel mai popular</div>
              <h3 className="font-bold text-green-600 uppercase text-xs tracking-widest mb-2 mt-2">Starter Lifetime</h3>
              <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-extrabold">$29</span><span className="text-sm text-gray-400 line-through">$120</span></div>
              <p className="text-xs font-bold text-green-600 mb-4">o singură dată, pe viață • -76%</p>
              <ul className="space-y-2.5 text-sm text-gray-800 font-medium mb-6">
                <li className="flex gap-2"><div className="bg-green-100 rounded-full p-0.5"><Check size={12} className="text-green-600" /></div> 3 animale</li>
                <li className="flex gap-2"><div className="bg-green-100 rounded-full p-0.5"><Check size={12} className="text-green-600" /></div> 100 AI chats / lună</li>
                <li className="flex gap-2"><div className="bg-green-100 rounded-full p-0.5"><Check size={12} className="text-green-600" /></div> Scan nelimitat, fără reclame</li>
                <li className="flex gap-2"><div className="bg-green-100 rounded-full p-0.5"><Check size={12} className="text-green-600" /></div> Export PDF + GPT-4o</li>
              </ul>
              <Link to="/signup?plan=starter_lifetime" className="block w-full py-3.5 text-center rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition">Ia Lifetime $29 🚀</Link>
              <p className="text-[11px] text-center text-gray-400 mt-2">Garanție 30 zile • Plată unică</p>
            </div>

            {/* PRO */}
            <div className="bg-gray-900 p-7 rounded-[1.8rem] border border-gray-800 shadow-xl text-white">
              <h3 className="font-bold text-orange-400 uppercase text-xs tracking-widest mb-2">Pro Family</h3>
              <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-extrabold">$49</span><span className="text-sm text-gray-500 line-through">$240</span></div>
              <p className="text-xs font-bold text-orange-400 mb-4">pe viață, animale nelimitate</p>
              <ul className="space-y-2.5 text-sm text-gray-300 mb-6">
                <li className="flex gap-2"><Check size={16} className="text-orange-400" /> Nelimitat tot</li>
                <li className="flex gap-2"><Check size={16} className="text-orange-400" /> Share familie + vet</li>
                <li className="flex gap-2"><Check size={16} className="text-orange-400" /> Priority AI 24/7</li>
              </ul>
              <Link to="/signup?plan=pro_lifetime" className="block w-full py-3 text-center rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition">Ia Pro $49</Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing" className="text-sm font-bold text-gray-600 hover:text-green-600 underline">Vezi comparație completă →</Link>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Cum funcționează? 20 secunde.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto text-xl font-bold mb-4 shadow-lg shadow-green-200">1</div>
            <h3 className="font-bold text-lg mb-1">Creează cont gratis</h3>
            <p className="text-sm text-gray-500">Email + parolă, fără card. 10 secunde.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto text-xl font-bold mb-4 shadow-lg shadow-green-200">2</div>
            <h3 className="font-bold text-lg mb-1">Adaugă animalul</h3>
            <p className="text-sm text-gray-500">Nume, rasă, vârstă - gata profilul.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto text-xl font-bold mb-4 shadow-lg shadow-green-200">3</div>
            <h3 className="font-bold text-lg mb-1">Primește ajutor AI</h3>
            <p className="text-sm text-gray-500">Întreabă orice, scanează mâncare, setează remindere.</p>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-20 px-6 bg-[#F1FFF6]">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Iubit de stăpâni</h2>
          <div className="flex justify-center gap-1 text-yellow-400 mt-3"><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border"><p className="text-gray-700 text-sm italic mb-4">“Am început gratis și după 3 zile am luat Lifetime $29. Cel mai bun $29 dat pe cățel!”</p><p className="font-bold text-sm">Sarah M. • 2 câini</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border"><p className="text-gray-700 text-sm italic mb-4">“AI-ul a detectat alergia din poză. Veterinarul a rămas impresionat de jurnal.”</p><p className="font-bold text-sm">Mike R. • 1 pisică</p></div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border"><p className="text-gray-700 text-sm italic mb-4">“Gratis pentru 1 animal e perfect. Am 3 pisici, am făcut upgrade la $29 pe viață.”</p><p className="font-bold text-sm">Emma L. • 3 pisici</p></div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="py-24 px-6 bg-green-600 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} /> Fără card • Fără risc • Gratis pentru totdeauna
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Gata să ai grijă <br />mai bine de blănosul tău?
          </h2>
          <p className="text-green-100 max-w-xl mx-auto mb-8 text-[17px]">
            Alătură-te la 1,200+ stăpâni care folosesc PetAssistant zilnic. Începe gratis acum.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/signup?plan=free" className="bg-white text-green-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-green-50 transition flex items-center justify-center gap-2">
              <Gift size={20} /> Începe Gratis - 20 sec
            </Link>
            <Link to="/pricing" className="bg-green-700 text-white border border-green-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-800 transition">
              Vezi planurile
            </Link>
          </div>
          <p className="text-green-200 text-xs mt-6">✓ Fără card necesar pentru Free • ✓ Date criptate • ✓ Garanție 30 zile la Lifetime</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-gray-900 py-10 text-center text-gray-400">
        <PawPrint className="text-green-400 mx-auto mb-3" size={28} />
        <p className="font-bold text-white mb-1">PetAssistant</p>
        <p className="text-xs">Asistentul tău AI pentru îngrijirea animalelor • Free Forever, upgrade opțional</p>
        <div className="flex justify-center gap-6 text-xs mt-6">
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
          <Link to="/pricing" className="hover:text-white">Prețuri</Link>
        </div>
        <p className="text-[11px] mt-6 text-gray-500">© 2026 PetAssistant. Făcut cu ♥ pentru animale.</p>
      </div>
    </div>
  );
}
