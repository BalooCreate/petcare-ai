import { Link } from "react-router";
import { Check, ArrowLeft, Sparkles, Heart, Zap, Crown, X } from "lucide-react";

// NOU MODEL FREEMIUM - FARA CARD NECESAR PENTRU FREE
const PLANS = {
  free: {
    id: "free",
    name: "Free Forever",
    price: "$0",
    period: "pentru totdeauna",
    description: "Perfect să începi",
    cta: "Începe Gratis - Fără Card",
    link: "/signup?plan=free",
    popular: false,
    features: [
      "1 Animal de companie",
      "10 Health Logs",
      "5 întrebări AI / lună",
      "3 Smart Scan / lună",
      "Calendar de bază",
      "Cu reclame discrete"
    ],
    buttonStyle: "border-2 border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-600"
  },
  starter: {
    id: "starter_monthly",
    name: "Starter",
    price: "$4.99",
    period: "/lună",
    lifetimePrice: "$29",
    lifetimeText: "o singură dată, pe viață",
    description: "Cel mai popular",
    cta: "Ia Lifetime $29",
    ctaSecondary: "$4.99/lună",
    link: "/signup?plan=starter_lifetime",
    linkMonthly: "/signup?plan=starter_monthly",
    popular: true,
    badge: "🔥 Best Value",
    features: [
      "Până la 3 animale",
      "100 întrebări AI / lună",
      "Scan nelimitat",
      "Fără reclame",
      "Export PDF pentru vet",
      "Suport prioritar",
      "GPT-4o complet"
    ],
    buttonStyle: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
  },
  pro: {
    id: "pro",
    name: "Pro Family",
    price: "$9.99",
    period: "/lună",
    lifetimePrice: "$49",
    lifetimeText: "pe viață, animale nelimitate",
    description: "Pentru familii & crescători",
    cta: "Ia Lifetime $49",
    ctaSecondary: "$9.99/lună",
    link: "/signup?plan=pro_lifetime",
    linkMonthly: "/signup?plan=pro_monthly",
    popular: false,
    features: [
      "Animale NELIMITATE",
      "AI NELIMITAT",
      "Istoric complet",
      "Share cu familie + vet",
      "24/7 Priority AI",
      "API access",
      "Totul din Starter"
    ],
    buttonStyle: "bg-gray-900 text-white hover:bg-black"
  }
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white p-6 font-sans text-gray-800 flex justify-center py-12">
      <div className="w-full max-w-6xl">
        
        <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 mb-8 bg-white px-4 py-2 rounded-full shadow-sm border">
                <ArrowLeft size={16} /> Înapoi Acasă
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Heart size={12} fill="currentColor" /> 100% Gratis pentru început
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Începe Gratis, <br/>
              <span className="text-green-600">Plătești doar dacă îți place</span> 🐾
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Fără card necesar pentru planul gratuit. <br/>
              <span className="font-bold text-gray-700">Upgrade opțional</span> doar când ai nevoie de mai mult.
            </p>

            {/* Toggle Lifetime vs Monthly */}
            <div className="mt-8 inline-flex bg-gray-100 p-1 rounded-full">
              <div className="bg-white shadow px-6 py-2 rounded-full text-sm font-bold text-gray-900 flex items-center gap-2">
                <Zap size={16} className="text-orange-500" /> Lifetime - Plată unică (Recomandat)
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Economisești 80% față de abonament lunar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* FREE */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gray-100 p-2 rounded-lg"><Heart size={18} className="text-gray-600" /></div>
                  <h3 className="text-gray-900 font-bold text-sm uppercase tracking-widest">Free Forever</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-extrabold text-gray-900">$0</span>
                    <span className="text-gray-400 text-sm">/ {PLANS.free.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{PLANS.free.description}</p>
                
                <ul className="space-y-3 mb-8">
                    {PLANS.free.features.map((f,i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-600">
                        <Check size={18} className="text-green-500 shrink-0" /> 
                        <span className={f.includes('reclame') ? 'text-gray-400' : ''}>{f}</span>
                      </li>
                    ))}
                </ul>
                <Link to={PLANS.free.link} className={`block w-full py-3.5 text-center font-bold rounded-xl transition ${PLANS.free.buttonStyle}`}>
                    {PLANS.free.cta}
                </Link>
                <p className="text-[11px] text-center text-gray-400 mt-3">Fără card • Activare instant</p>
            </div>

            {/* STARTER - MOST POPULAR */}
            <div className="bg-white p-8 rounded-[2rem] border-2 border-green-500 shadow-2xl relative transform md:scale-105 md:-translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Sparkles size={12} /> {PLANS.starter.badge}
                </div>
                
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <div className="bg-green-100 p-2 rounded-lg"><Zap size={18} className="text-green-600" /></div>
                  <h3 className="text-green-600 font-bold text-sm uppercase tracking-widest">Starter Lifetime</h3>
                </div>

                <div className="mb-1">
                  <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-gray-900">{PLANS.starter.lifetimePrice}</span>
                      <span className="text-gray-500 text-sm line-through">$120</span>
                  </div>
                  <p className="text-sm font-bold text-green-600">{PLANS.starter.lifetimeText}</p>
                  <p className="text-xs text-gray-400 mt-1">sau {PLANS.starter.price}{PLANS.starter.period}</p>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 mt-4 font-medium">Perfect pentru 90% dintre stăpâni</p>
                
                <ul className="space-y-3 mb-8">
                    {PLANS.starter.features.map((f,i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-800 font-medium">
                        <div className="bg-green-100 rounded-full p-0.5 shrink-0"><Check size={14} className="text-green-600" /></div> 
                        {f}
                      </li>
                    ))}
                </ul>
                
                <Link to={PLANS.starter.link} className={`block w-full py-4 text-center font-bold rounded-xl transition text-[15px] ${PLANS.starter.buttonStyle}`}>
                    {PLANS.starter.cta} 🚀
                </Link>
                <Link to={PLANS.starter.linkMonthly} className="block w-full py-2.5 text-center text-sm text-gray-500 hover:text-gray-700 font-medium mt-2">
                    sau {PLANS.starter.ctaSecondary} / lună
                </Link>
                
                <div className="mt-4 bg-green-50 rounded-xl p-3 flex gap-2">
                  <div className="text-green-600 mt-0.5">✓</div>
                  <p className="text-xs text-green-800 leading-relaxed">
                    <strong>Garanție 30 zile.</strong> Nu îți place? Îți dăm banii înapoi, fără întrebări.
                  </p>
                </div>
            </div>

            {/* PRO */}
            <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-2 mb-3 relative">
                  <div className="bg-white/10 p-2 rounded-lg"><Crown size={18} className="text-orange-400" /></div>
                  <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest">Pro Family</h3>
                </div>
                
                <div className="mb-1 relative">
                  <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-white">{PLANS.pro.lifetimePrice}</span>
                      <span className="text-gray-500 text-sm line-through">$240</span>
                  </div>
                  <p className="text-sm font-bold text-orange-400">{PLANS.pro.lifetimeText}</p>
                  <p className="text-xs text-gray-500 mt-1">sau {PLANS.pro.price}{PLANS.pro.period}</p>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 mt-4">Pentru familii cu multe animale</p>
                
                <ul className="space-y-3 mb-8 relative">
                    {PLANS.pro.features.map((f,i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-200">
                        <Check size={18} className="text-orange-400 shrink-0" /> {f}
                      </li>
                    ))}
                </ul>
                
                <Link to={PLANS.pro.link} className={`block w-full py-4 text-center font-bold rounded-xl transition relative ${PLANS.pro.buttonStyle}`}>
                    {PLANS.pro.cta}
                </Link>
                <Link to={PLANS.pro.linkMonthly} className="block w-full py-2.5 text-center text-sm text-gray-400 hover:text-white font-medium mt-2 relative">
                    sau {PLANS.pro.ctaSecondary} / lună
                </Link>
            </div>

        </div>

        {/* FAQ + TRUST */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-center">Întrebări frecvente</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-bold text-gray-800 mb-1">Chiar e gratis pentru totdeauna?</p>
                <p className="text-gray-500">Da! Planul Free nu expiră niciodată. Fără card. Îl poți folosi cât vrei cu 1 animal.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Ce înseamnă Lifetime?</p>
                <p className="text-gray-500">Plătești o singură dată $29 sau $49 și ai acces pe viață. Fără abonament lunar.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Pot face upgrade mai târziu?</p>
                <p className="text-gray-500">Da, oricând. Datele tale rămân salvate. Upgrade-ul e instant.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Ce se întâmplă cu datele mele?</p>
                <p className="text-gray-500">Sunt criptate și securizate. Le poți exporta oricând. Nu le vindem.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 text-xs text-gray-400">
            <p>🔒 Plăți securizate prin Stripe • 💳 Card, Apple Pay, Google Pay • ↩️ Garanție 30 zile</p>
          </div>
        </div>

      </div>
    </div>
  );
}
