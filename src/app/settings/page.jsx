import { Link } from "react-router";
import { ArrowLeft, Bell, Mail, Smartphone, LogOut, User, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-2xl mt-4">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard" className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm">
             <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Setări Cont</h1>
        </div>

        <div className="space-y-6">
            
            {/* 1. Profil */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Contul Meu</h2>
                        <p className="text-sm text-gray-500">Gestionează datele personale</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400 uppercase font-bold">Email</span>
                        <p className="font-medium text-gray-800">owner@example.com</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400 uppercase font-bold">Plan Actual</span>
                        <p className="font-medium text-green-600">Free Plan</p>
                    </div>
                </div>
            </div>

            {/* 2. NOTIFICĂRI (CERINȚA TA) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-blue-500" /> Notificări & Alerte
                </h2>
                <p className="text-xs text-gray-500 mb-6">
                    Alege cum vrei să fii anunțat despre vaccinuri, urgențe sau sfaturi AI.
                </p>

                <div className="space-y-4">
                    {/* Email Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail size={18} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Notificări pe Email</p>
                                <p className="text-[10px] text-gray-400">Pentru rapoarte lunare și facturi</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    {/* SMS/Phone Toggle */}
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Smartphone size={18} /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">SMS / Telefon</p>
                                <p className="text-[10px] text-gray-400">Pentru urgențe veterinare și remindere</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* 3. LOGOUT */}
            <Link 
                to="/logout" 
                className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition border border-red-100"
            >
                <LogOut size={20} /> Deconectare (Log Out)
            </Link>

        </div>
      </div>
    </div>
  );
}