import useUser from "../../utils/useUser";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";

export default function SchedulesPage() {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();

  // Date simulate pentru Schedules
  const schedules = [
    { id: 1, title: "Morning Walk", pet: "Bella", time: "07:00 AM", type: "walk", completed: true },
    { id: 2, title: "Breakfast", pet: "Luna", time: "08:00 AM", type: "feeding", completed: true },
    { id: 3, title: "Heartworm Meds", pet: "Bella", time: "09:00 AM", type: "medication", completed: false },
    { id: 4, title: "Evening Walk", pet: "Bella", time: "06:00 PM", type: "walk", completed: false },
  ];

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Care Schedules</h1>
        </div>

        {/* List */}
        <div className="space-y-4">
          {schedules.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${item.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Calendar className={`w-6 h-6 ${item.completed ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.pet} • {item.time}</p>
                </div>
              </div>
              {item.completed ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Done
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                  <Clock className="w-4 h-4" /> Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}