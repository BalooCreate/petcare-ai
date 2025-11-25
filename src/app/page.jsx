import { Link } from "react-router";
import { 
  PawPrint, Calendar, Activity, ShieldCheck, Check, Star, 
  Camera, MessageCircle 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <PawPrint className="text-green-600" size={24} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">PetAssistant</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 font-bold text-sm text-gray-600 hover:text-green-600 transition">
            Log In
          </Link>
          <Link to="/signup" className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="text-center pt-20 pb-24 px-6 bg-gradient-to-b from-white to-[#F1FFF6]">
        <div className="flex justify-center mb-4 text-green-500 gap-2 animate-bounce">
          <PawPrint size={20} /> <span className="text-pink-400">♥</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Your Pet's <br /> <span className="text-green-600">Smart Assistant</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Manage pet care routines, track health records, and get AI-powered advice. <br />
          <span className="font-bold text-gray-800">Try it risk-free for 14 days.</span>
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/signup" className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-xl shadow-green-200 transform hover:-translate-y-1">
            Start 14-Day Free Trial
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="text-gray-500 mt-2">Premium tools for your furry friend.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="bg-[#F1FFF6] p-6 rounded-2xl">
              <Calendar className="text-green-600 mb-4" />
              <h3 className="font-bold">Smart Scheduling</h3>
            </div>

            <div className="bg-[#F1FFF6] p-6 rounded-2xl">
              <MessageCircle className="text-blue-600 mb-4" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>

            <div className="bg-[#F1FFF6] p-6 rounded-2xl">
              <Activity className="text-purple-600 mb-4" />
              <h3 className="font-bold">Health Tracking</h3>
            </div>

            <div className="bg-[#F1FFF6] p-6 rounded-2xl">
              <ShieldCheck className="text-orange-600 mb-4" />
              <h3 className="font-bold">Secure Data</h3>
            </div>

          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
              Choose Your Pack <span className="text-3xl">🐶</span>
            </h2>
            <p className="text-gray-500 mt-4">
              All plans include a <span className="font-bold text-green-600">14-day free trial</span>. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

            {/* Chihuahua */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-300 transition">
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-2">The Chihuahua</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900">$5</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-green-600 font-bold mb-6">Billed after 14 days</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> 1 Pet Profile</li>
                <li className="flex items-center gap-3 text-sm text-gray-700"><Check size={18} className="text-green-500" /> Basic Health Log</li>
              </ul>
              <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl border-2 border-gray-100 font-bold text-gray-600 hover:border-green-600 hover:text-green-600 transition">
                Try Free for 14 Days
              </Link>
            </div>

            {/* Labrador */}
            <div className="bg-white p-8 rounded-3xl border-2 border-green-500 shadow-xl transform scale-105 relative z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-green-600 uppercase tracking-widest mb-2">The Labrador</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-gray-900">$10</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-green-600 font-bold mb-6">Billed after 14 days</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Up to 3 Pets</li>
                <li className="flex items-center gap-3 text-sm text-gray-900 font-medium"><Check size={18} className="text-green-500" /> Basic AI Chat</li>
              </ul>
              <Link to="/signup" className="block w-full py-4 px-6 text-center rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Great Dane */}
            <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-800 text-white relative overflow-hidden">
              <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Star size={16} fill="currentColor" /> The Great Dane
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">$25</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <p className="text-xs text-orange-400 font-bold mb-6">Billed after 14 days</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-200"><Check size={18} className="text-orange-400" /> <strong>Unlimited Pets</strong></li>
                <li className="flex items-center gap-3 text-sm text-gray-200"><Camera size={18} className="text-orange-400" /> <strong>Smart Scan AI</strong></li>
                <li className="flex items-center gap-3 text-sm text-gray-200"><Activity size={18} className="text-orange-400" /> 24/7 Emergency Vet</li>
              </ul>
              <Link to="/signup" className="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg">
                Start 14-Day Free Trial
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-24 px-6 bg-[#F1FFF6]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">How PetAssistant Works</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Our AI uses veterinary-approved knowledge to provide safe, thoughtful advice tailored to your pet’s needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-2xl font-bold mb-6">1</div>
            <h3 className="font-bold text-xl mb-2">Add Your Pet</h3>
            <p className="text-gray-600">
              Create detailed profiles with breed, age, weight, and medical history for personalized care.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-2xl font-bold mb-6">2</div>
            <h3 className="font-bold text-xl mb-2">Set Up Care Routines</h3>
            <p className="text-gray-600">
              Configure automated schedules for feeding, walks, medications, and vet appointments.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-2xl font-bold mb-6">3</div>
            <h3 className="font-bold text-xl mb-2">Get AI Guidance</h3>
            <p className="text-gray-600">
              Ask questions anytime and receive instant, accurate advice based on veterinary expertise.
            </p>
          </div>

        </div>
      </div>

      {/* DESIGNED FOR EVERY PET OWNER */}
      <div className="py-24 px-6 bg-[#F1FFF6]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Designed for Every Pet Owner
            </h2>
            <p className="text-gray-600 mb-8">
              Whether you're a first-time pet owner or an experienced caregiver, PetAssistant provides the tools and knowledge you need to keep your pets healthy and happy.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <Check className="text-green-600 mt-1" />
                <span><strong>Easy for Everyone</strong> – Clean, intuitive interface that works for tech-savvy users and seniors alike.</span>
              </li>

              <li className="flex items-start gap-3">
                <Check className="text-green-600 mt-1" />
                <span><strong>Veterinary-Approved</strong> – All AI recommendations are based on veterinary expertise and best practices.</span>
              </li>

              <li className="flex items-start gap-3">
                <Check className="text-green-600 mt-1" />
                <span><strong>Secure & Private</strong> – Your pet's data is encrypted and protected with enterprise-grade security.</span>
              </li>

              <li className="flex items-start gap-3">
                <Check className="text-green-600 mt-1" />
                <span><strong>Mobile Responsive</strong> – Works perfectly on desktop, tablet, and mobile devices.</span>
              </li>
            </ul>
          </div>

          {/* AI PREVIEW */}
          <div className="bg-white p-8 rounded-3xl shadow-md border">
            <h3 className="font-bold text-lg mb-4">AI Assistant</h3>
            <div className="bg-[#F1FFF6] p-6 rounded-2xl shadow-sm border">
              <p className="text-gray-700 font-semibold mb-2">“Is chocolate toxic to dogs?”</p>
              <p className="text-gray-600 text-sm">
                Yes, chocolate is toxic to dogs. Even small amounts can cause vomiting, 
                diarrhea, and in severe cases, seizures. If your dog ate chocolate, 
                contact your vet immediately…
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-24 px-6 bg-[#F1FFF6]">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Loved by Pet Parents Everywhere</h2>
          <p className="text-gray-600 mt-3">
            See what our community has to say about PetAssistant
          </p>
        </div>

        <div className="grid grid-cols-1 md-grid-cols-3 gap-8 max-w-6xl mx-auto">

          <div className="bg-white p-8 rounded-2xl shadow border">
            <div className="flex gap-1 text-yellow-400 mb-3">
              <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
            </div>
            <p className="text-gray-700 italic mb-6">
              “The AI assistant helped me identify my dog's allergies. My vet was impressed with the detailed health logs!”
            </p>
            <p className="font-bold text-gray-800">Sarah M.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow border">
            <div className="flex gap-1 text-yellow-400 mb-3">
              <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
            </div>
            <p className="text-gray-700 italic mb-6">
              “Never missed a medication dose since using PetAssistant. The reminders are perfect and my cat is healthier than ever.”
            </p>
            <p className="font-bold text-gray-800">Mike R.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow border">
            <div className="flex gap-1 text-yellow-400 mb-3">
              <Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" />
            </div>
            <p className="text-gray-700 italic mb-6">
              “Managing three pets was chaos until I found PetAssistant. Everything is organized and automated now!”
            </p>
            <p className="font-bold text-gray-800">Emma L.</p>
          </div>

        </div>
      </div>

      {/* GREEN CTA */}
      <div className="py-32 px-6 bg-green-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">
          Ready to Give Your Pet the Best Care?
        </h2>
        <p className="text-green-100 max-w-2xl mx-auto mb-10">
          Join thousands of pet owners who trust PetAssistant to keep their furry friends healthy and happy.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/signup" className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-50 transition">
            Start Your Free Account
          </Link>
          <Link to="/chat" className="bg-green-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-900 transition">
            Try AI Assistant
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-gray-900 py-12 text-center text-gray-300">
        <PawPrint className="text-green-400 mx-auto mb-3" size={28} />
        <p className="font-bold text-lg text-white mb-4">PetAssistant</p>
        <p className="text-gray-400 text-sm">Your AI-powered companion for better pet care</p>

        <div className="flex justify-center gap-6 text-sm mt-6 text-gray-400">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <p className="text-gray-500 text-xs mt-6">
          © 2025 PetAssistant. All rights reserved.
        </p>
      </div>

    </div>
  );
}
