import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalClassesToday: 0, averageAttendance: 0 });
  const [userName, setUserName] = useState("Teacher");
  const [department, setDepartment] = useState("");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const teacherId = decoded.id;

      const statsRes = await axios.get(`/api/attendance/stats/teacher/${teacherId}`);
      setStats(statsRes.data);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.name) setUserName(storedUser.name);
      if (storedUser.department) setDepartment(storedUser.department);
    } catch (error) {
      console.error("Failed to fetch teacher stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />

      <div className="p-4 flex-1 w-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="page-header">Dashboard</h1>
            <p className="page-subtitle">Manage sessions</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{department || "Teacher"}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-medium shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4 flex flex-col items-center text-center justify-center">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Classes today</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalClassesToday}</p>
          </div>
          <div className="card p-4 flex flex-col items-center text-center justify-center">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Avg. attendance</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.averageAttendance}%</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">New attendance session</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              Generate a time-sensitive QR code for your current lecture. Students scan with their registered device.
            </p>

            <button
              onClick={() => navigate("/qr-attendance")}
              className="btn-primary w-full py-2.5 text-sm inline-flex justify-center items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create session
            </button>
          </div>
        </div>
      </div>
      <BottomNav role="teacher" />
    </div>
  );
}