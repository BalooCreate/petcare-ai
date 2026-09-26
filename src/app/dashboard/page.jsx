import { useLoaderData, Link, redirect } from "react-router";
import Stripe from "stripe";
import { activatePlan, getUsage } from "../../lib/usage.js";
import { 
  Plus, Calendar, Activity, Settings, 
  ShoppingBag, TicketPercent, ArrowRight, 
  Camera, MessageCircle, PawPrint, Clock, FileText, Gift, Zap, Crown
} from "lucide-react";
import sql from "../api/utils/sql"; 
import InstallBanner from "../../components/InstallBanner";
import { readUserId, sessionCookieHeader } from "../../lib/session.js";

// --- BACKEND ---
export async function loader({ request }) {
  const url = new URL(request.url);
  // ✅ SECURITY FIX: sesiune semnată HMAC (nu mai acceptăm cookie falsificabil)
  let userId = readUserId(request);

  // === STRIPE PAYMENT VERIFICATION (on return from checkout) ===
  // Stripe sends us back with ?session_id=cs_xxx. We verify payment BEFORE
  // granting the plan, so nobody gets a paid plan without paying.
  const sessionId = url.searchParams.get("session_id");
  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const isPaid =
        session?.payment_status === "paid" || session?.status === "complete";

      const metaUserId = session?.metadata?.userId;
      const metaPlan = session?.metadata?.plan;
      const metaType = session?.metadata?.type;
      const customerId =
        typeof session?.customer === "string" ? session.customer : null;

      if (isPaid && metaUserId && metaPlan) {
        // activatePlan() is idempotent: it will not rewrite if the plan is already active
        const res = await activatePlan(metaUserId, metaPlan, {
          type: metaType === "lifetime" ? "lifetime" : "monthly",
          customerId,
        });
        if (!res.ok) {
          console.error("activatePlan failed:", res.reason);
        }

        // Log the user in (cookie) and clean up the URL
        return redirect(`/dashboard?upgraded=${metaPlan}`, {
          headers: {
            "Set-Cookie": sessionCookieHeader(metaUserId),
          },
        });
      }
    } catch (e) {
      console.error("Stripe session verification failed:", e.message);
    }
  }
  // === END STRIPE PAYMENT VERIFICATION ===

  if (!userId) return { pets: [], user: null, usage: null, plan: 'free' };

  try {
    const pets = await sql`SELECT * FROM pets WHERE owner_id = ${userId}`;
    const userResult = await sql`SELECT id, name, email, plan, plan_type, lifetime_paid FROM users WHERE id = ${userId}`;
    const usageRow = await getUsage(userId);
    
    return { 
      pets: pets || [], 
      user: userResult[0] || null,
      usage: usageRow || { ai_chats_used: 0, scans_used: 0 },
      plan: userResult[0]?.plan || 'free'
    };
  } catch (e) {
    console.error("Dashboard loader error", e);
    return { pets: [], user: null, usage: null, plan: 'free' };
  }
}

// --- FRONTEND ---
export default function DashboardPage() {
  const { pets, user, usage, plan } = useLoaderData();
  
  const isFree = !plan || plan === 'free';
  const isStarter = plan === 'starter';
  const isPro = plan === 'pro';

  const aiUsed = usage?.ai_chats_used || 0;
  const scansUsed = usage?.scans_used || 0;
  
  const aiLimit = isFree ? 5 : isStarter ? 100 : 9999;
  const scanLimit = isFree ? 3 : isStarter ? 100 : 9999;
  const petLimit = isFree ? 1 : isStarter ? 3 : 9999;

  const aiPercent = Math.min((aiUsed / aiLimit) * 100, 100);
  const showUpgradeBanner = isFree && (aiUsed >= 3 || pets.length >= 1);

  return (
    <div className="min-h-screen bg-green-50/30 p-4 font-sans text-gray-800 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 mt-2">
            <Link to="/" className="group block cursor-pointer">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <PawPrint size={20} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 leading-none">PetAssistant</h1>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${isFree ? 'bg-gray-100 text-gray-600' : isStarter ? 'bg-green-100 text-green-700' : 'bg-gray-900 text-orange-400'}`}>
                          {isFree ? 'Free Forever' : isStarter ? 'Starter Lifetime' : 'Pro Lifetime'}
                        </span>
                        {user?.name && <span className="text-[11px] text-gray-400">• {user.name}</span>}
                      </div>
                    </div>
                </div>
            </Link>

            <div className="flex gap-2">
                {isFree && (
                  <Link to="/pricing" className="bg-gray-900 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-black flex items-center gap-1.5 transition">
                      <Crown size={14} className="text-orange-400" /> Upgrade €29
                  </Link>
                )}
                <Link to="/settings" className="bg-white text-gray-600 px-3 py-1.5 rounded-lg font-bold text-xs border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 transition">
                    <Settings size={14} /> Settings
                </Link>
                <Link to="/chat" className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-md hover:bg-green-700 flex items-center gap-2 transition">
                    <MessageCircle size={14} /> AI Chat
                </Link>
            </div>
        </div>

        <InstallBanner />

        {/* FREEMIUM USAGE BANNER — for FREE */}
        {isFree && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Gift size={16} className="text-green-600" /> Your free plan
              </h3>
              <Link to="/pricing" className="text-xs font-bold text-green-600 hover:underline">Get Lifetime €29 →</Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">AI Chats</span>
                  <span className="font-bold">{aiUsed}/{aiLimit}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${aiPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">Scans</span>
                  <span className="font-bold">{scansUsed}/{scanLimit}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min((scansUsed/scanLimit)*100,100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">Pets</span>
                  <span className="font-bold">{pets.length}/{petLimit}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.min((pets.length/petLimit)*100,100)}%` }} />
                </div>
              </div>
            </div>

            {showUpgradeBanner && (
              <div className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Zap size={16} />
                  <span className="text-xs font-bold">Loving the app? Unlock everything for €29 lifetime!</span>
                </div>
                <Link to="/pricing" className="bg-white text-green-700 text-xs font-bold px-3 py-1 rounded-full hover:bg-green-50 transition shrink-0">
                  See the offer
                </Link>
              </div>
            )}
          </div>
        )}

        {/* UPGRADE SUCCESS MESSAGE */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('upgrade') === 'success' && (
          <div className="mb-6 bg-green-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="bg-white/20 p-2 rounded-full"><Crown size={20} /></div>
            <div>
              <p className="font-bold text-sm">🎉 Upgrade successful! Thank you!</p>
              <p className="text-xs text-green-100">You now have access to all features. Enjoy PetAssistant!</p>
            </div>
          </div>
        )}

        {/* ACTIONS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            
            <Link to="/pets/add" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-green-50 p-3 rounded-full text-green-600 group-hover:scale-110 transition">
                    <Plus size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Add Pet</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {isFree && pets.length >= petLimit ? `Limit ${petLimit} • Upgrade` : "New Profile"}
                    </p>
                </div>
            </Link>

            <Link to="/schedules" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-blue-50 p-3 rounded-full text-blue-500 group-hover:scale-110 transition">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Schedules</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Calendar</p>
                </div>
            </Link>

            <Link to="/health" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group">
                <div className="bg-purple-50 p-3 rounded-full text-purple-500 group-hover:scale-110 transition">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Health Log</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Records</p>
                </div>
            </Link>

            <Link to="/scan" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group relative">
                {isFree && scansUsed >= scanLimit && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">LIMIT</div>
                )}
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 group-hover:scale-110 transition">
                    <Camera size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Smart Scan</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {isFree ? `${scansUsed}/${scanLimit} free` : "AI Tool"}
                    </p>
                </div>
            </Link>

            <Link to="/chat" className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center text-center gap-2 group relative">
                {isFree && aiUsed >= aiLimit && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">LIMIT</div>
                )}
                <div className="bg-green-50 p-3 rounded-full text-green-600 group-hover:scale-110 transition">
                    <MessageCircle size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">AI Chat</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {isFree ? `${aiUsed}/${aiLimit} free` : "Unlimited"}
                    </p>
                </div>
            </Link>

            <Link to="/pricing" className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-gray-800 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-2 group text-white">
                <div className="bg-white/10 p-3 rounded-full text-orange-400 group-hover:scale-110 transition">
                    <Crown size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{isFree ? "Upgrade €29" : "Your plan"}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {isFree ? "Lifetime • Forever" : `${plan} • Active`}
                    </p>
                </div>
            </Link>

        </div>

        {/* INFO SECUNDARE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* My Pets */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-red-400">♥</span> My Pets ({pets.length}/{petLimit === 9999 ? '∞' : petLimit})
                    </h2>
                    <Link to="/pets/add" className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-bold hover:bg-green-700">+ Add</Link>
                </div>

                <div className="space-y-2">
                    {pets.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🐾</div>
                          <p className="text-sm font-bold text-gray-900">No pets added yet</p>
                          <p className="text-xs text-gray-500 mt-1 mb-4">Add your first pet in 20 seconds — it's free!</p>
                          <Link to="/pets/add" className="inline-flex bg-green-600 text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-green-700">
                            <Plus size={14} className="mr-1" /> Add your first pet
                          </Link>
                        </div>
                    ) : (
                        pets.map(pet => (
                            <Link key={pet.id} to={`/pets/${pet.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center overflow-hidden shrink-0 border">
                                    {pet.image_url || pet.photo_url ? <img src={pet.image_url || pet.photo_url} className="w-full h-full object-cover"/> : "🐾"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-sm text-gray-800 truncate">{pet.name}</h4>
                                    <p className="text-[11px] text-gray-500 truncate">{pet.breed || 'Mixed breed'} • {pet.age || '?'} yr</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300" />
                            </Link>
                        ))
                    )}
                </div>

                {isFree && pets.length >= petLimit && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs">
                    <p className="font-bold text-orange-800">You reached the free limit of {petLimit} pet</p>
                    <p className="text-orange-600 mt-1">Upgrade to Starter Lifetime €29 for 3 pets, or Pro €49 for unlimited.</p>
                    <Link to="/pricing" className="inline-block mt-2 bg-gray-900 text-white px-3 py-1 rounded-full font-bold text-[11px]">See plans</Link>
                  </div>
                )}
            </div>

            {/* Stats + Upgrade */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock size={14} className="text-blue-500" /> Activitate
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">AI chats this month</span><span className="font-bold">{aiUsed}/{aiLimit}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Scans</span><span className="font-bold">{scansUsed}/{scanLimit}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pets</span><span className="font-bold">{pets.length}/{petLimit === 9999 ? '∞' : petLimit}</span></div>
                    </div>
                </div>

                {isFree ? (
                  <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-5 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={18} className="text-yellow-300" />
                      <h3 className="font-bold text-sm">Unlock everything</h3>
                    </div>
                    <p className="text-xs text-green-100 mb-3 leading-relaxed">
                      For just <strong className="text-white">€29 one time</strong> you get 3 pets, 100 AI questions/month, unlimited scans, no ads, lifetime access.
                    </p>
                    <Link to="/pricing" className="block w-full bg-white text-green-700 text-center font-bold py-2.5 rounded-xl text-xs hover:bg-green-50 transition">
                      Get Lifetime €29 🚀
                    </Link>
                    <p className="text-[10px] text-green-200 text-center mt-2">30-day guarantee • One-time payment</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 p-5 rounded-2xl text-white">
                    <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
                      <Crown size={16} className="text-orange-400" /> {plan === 'starter' ? 'Starter Lifetime' : 'Pro Lifetime'} Activ
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">Thanks for supporting PetAssistant! You have access to all premium features.</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-white/10 px-2 py-1 rounded-full">✓ No ads</span>
                      <span className="bg-white/10 px-2 py-1 rounded-full">✓ {aiLimit === 9999 ? 'Unlimited' : `${aiLimit} AI`}</span>
                    </div>
                  </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
}
