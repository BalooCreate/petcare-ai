import useUser from "../../utils/useUser";
import { useNavigate } from "react-router";
import { ArrowLeft, Activity, FileText } from "lucide-react";

export default function HealthPage() {
  const { data: user, loading } = useUser();
  const navigate = useNavigate();

  const logs = [
    { id: 1, title: "Annual Vaccination", pet: "Bella", date: "Oct 15, 2023", notes: "Rabies and DHPP booster given." },
    { id: 2, title: "Weight Check", pet: "Luna", date: "Nov 02, 2023", notes: "Weight is stable at 4.5kg." },
    { id: 3, title: "Ear Infection", pet: "Bella", date: "Dec 10, 2023", notes: "Prescribed drops for 7 days." },
  ];

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Health Logs</h1>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="flex justify-between w-full">
                    <h3 className="font-bold text-gray-800">{log.title}</h3>
                    <span className="text-sm text-gray-400">{log.date}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mb-2">{log.pet}</p>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    <FileText className="w-3 h-3 inline mr-2 text-gray-400"/>
                    {log.notes}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}