import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function StudentDashboard() {
  const location = useLocation();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.successMessage) {
      setIsSuccess(true);
      setMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalSessions: 0, attendedSessions: 0, percentage: 0 });
  const [userName, setUserName] = useState("Student");
  const [department, setDepartment] = useState("");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const studentId = decoded.id;

      const statsRes = await axios.get(`/api/attendance/stats/${studentId}`);
      setStats(statsRes.data);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.name) setUserName(storedUser.name);
      if (storedUser.department) setDepartment(storedUser.department);

    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const markAttendance = async () => {
    if (code.trim() === "") {
      setIsSuccess(false);
      setMessage("Please enter a valid session code.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsSuccess(false);
        setMessage("User not authenticated.");
        setLoading(false);
        return;
      }

      const decoded: any = jwtDecode(token);
      const studentId = decoded.id;

      await axios.post(`/api/attendance/mark`, {
        studentId,
        sessionCode: code.trim(),
      });

      setIsSuccess(true);
      setMessage("Attendance marked successfully");
      setCode("");
      fetchStats();
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  const missedSessions = stats.totalSessions - stats.attendedSessions;

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />

      <div className="p-4 flex-1 w-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="page-header">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {userName.split(' ')[0]}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-900 dark:text-white">{userName}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{department || "Student"}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-medium shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="card p-3 flex flex-col items-center text-center justify-center">
            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
          </div>
          <div className="card p-3 flex flex-col items-center text-center justify-center">
            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Attended</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.attendedSessions}</p>
          </div>
          <div className="card p-3 flex flex-col items-center text-center justify-center">
            <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Missed</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{missedSessions}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Mark Attendance */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Mark Attendance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter the session code displayed by your teacher to mark your attendance manually.
            </p>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="e.g. CLASS-123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                  className="input-field py-2.5 uppercase font-mono tracking-widest text-sm text-center"
                />
              </div>

              <button
                onClick={markAttendance}
                disabled={loading}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                }`}>
                {isSuccess ? (
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Attendance Overview */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Attendance Rate</h2>

            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                  <circle
                    cx="48" cy="48" r="40"
                    stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100}
                    className={`${stats.percentage >= 75 ? 'text-primary-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{stats.percentage}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-400">Total classes</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] uppercase font-medium text-gray-500 dark:text-gray-400">Attended</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.attendedSessions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav role="student" />
    </div>
  );
}