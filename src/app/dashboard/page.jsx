import { useState, useEffect } from "react";
import useUser from "../../utils/useUser"; 
import { useNavigate } from "react-router"; 
import {
  PawPrint,
  Plus,
  Calendar,
  MessageCircle,
  Heart,
  Camera,
  Clock,
  Bell,
  LogOut,
} from "lucide-react";

function Dashboard() {
  const { data: user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  // --- DATE SIMULATE (MOCK DATA) ---
  // Le folosim ca să vezi interfața imediat, fără bază de date conectată
  const [pets, setPets] = useState([
    { id: 1, name: "Bella", breed: "Golden Retriever", age: 3, photo_url: null },
    { id: 2, name: "Luna", breed: "Siamese Cat", age: 2, photo_url: null }
  ]);
  
  const [upcomingSchedules, setUpcomingSchedules] = useState([
    { id: 1, title: "Morning Walk", pet_name: "Bella", next_due: new Date().toISOString(), schedule_type: "walk" },
    { id: 2, title: "Dinner", pet_name: "Luna", next_due: new Date().toISOString(), schedule_type: "feeding" }
  ]);

  const [recentHealthLogs, setRecentHealthLogs] = useState([
    { id: 1, title: "Annual Vaccination", pet_name: "Bella", date_logged: new Date().toISOString(), log_type: "vet_visit" }
  ]);

  // Setăm loading pe false din start ca să apară pagina instant
  const [loading, setLoading] = useState(false);

  /* 
  // --- AM COMENTAT PARTEA CARE BLOCA PAGINA ---
  // Această parte încerca să ia date reale și bloca totul
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const petsResponse = await fetch("/api/pets");
      if (petsResponse.ok) {
        const petsData = await petsResponse.json();
        setPets(petsData.pets || []);
      }
      // ... restul codului ...
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  */

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect de siguranță
  if (!user) {
    if (typeof window !== "undefined") {
       window.location.href = "/account/signin";
    }
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScheduleTypeIcon = (type) => {
    switch (type) {
      case "feeding": return "🍽️";
      case "walk": return "🚶";
      case "medication": return "💊";
      case "vet_appointment": return "🏥";
      default: return "📅";
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case "symptom": return "🩺";
      case "medication": return "💊";
      case "vet_visit": return "🏥";
      default: return "📝";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <PawPrint className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xl font-bold text-gray-800">
                PetAssistent
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={() => navigate("/chat")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                AI Chat
              </button>
              <a
                href="/account/logout"
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Keep track of your pets' health, schedules, and get AI-powered advice
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/pets/add")}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Add Pet</h3>
            <p className="text-sm text-gray-600">Register a new pet</p>
          </button>

          <button
            onClick={() => navigate("/schedules")}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Schedules</h3>
            <p className="text-sm text-gray-600">Manage care routines</p>
          </button>

          <button
            onClick={() => navigate("/health")}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Health Log</h3>
            <p className="text-sm text-gray-600">Track health records</p>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow text-center group"
          >
            <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-sm text-gray-600">Get pet care advice</p>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Pets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  My Pets
                </h2>
                <button
                  onClick={() => navigate("/pets/add")}
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <PawPrint className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No pets added yet</p>
                  <button
                    onClick={() => navigate("/pets/add")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Your First Pet
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pets/${pet.id}`)}
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <PawPrint className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {pet.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pet.breed && `${pet.breed} • `}
                          {pet.age && `${pet.age} years old`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedules & Recent Health Logs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Schedules */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Upcoming Care
                </h2>
                <button
                  onClick={() => navigate("/schedules")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No upcoming schedules</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">
                        {getScheduleTypeIcon(schedule.schedule_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {schedule.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {schedule.pet_name} • {formatDate(schedule.next_due)}
                        </p>
                      </div>
                      <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Health Logs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  Recent Health Logs
                </h2>
                <button
                  onClick={() => navigate("/health")}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {recentHealthLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No health logs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentHealthLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">
                        {getLogTypeIcon(log.log_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {log.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {log.pet_name} • {formatDate(log.date_logged)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;