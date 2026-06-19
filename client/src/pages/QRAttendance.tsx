import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function QRAttendance() {
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (sessionCode && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionCode, timeLeft]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!branch || !subject || !date) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const decoded: any = jwtDecode(token);
      const teacherId = decoded.id;

      const res = await axios.post(`/api/attendance/create-session`, {
        teacherId,
        subject,
        branch,
        date
      });

      setSessionCode(res.data.session.sessionCode);
      setTimeLeft(30);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create session.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />
      <div className="p-4 flex-1 w-full overflow-y-auto">
        <div className="mb-6">
          <h1 className="page-header">Create session</h1>
          <p className="page-subtitle">Generate a QR code for attendance</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Form */}
          <div className="card p-5 w-full">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Session details</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                <select className="input-field py-2 text-sm" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">Select branch</option>
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select className="input-field py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select subject</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  className="input-field py-2 text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {loading ? "Generating..." : sessionCode ? "Regenerate code" : "Generate QR code"}
                </button>
              </div>
            </form>
          </div>

          {/* QR Code */}
          {sessionCode && (
            <div className="card p-5 w-full flex flex-col items-center justify-center relative overflow-hidden">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mb-4 ${
                timeLeft > 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${timeLeft > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {timeLeft > 0 ? `Active · ${timeLeft}s` : "Expired"}
              </div>

              <div className={`${timeLeft === 0 ? 'opacity-20 grayscale' : ''} transition-all duration-300`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white text-center mb-3">
                  Code: <span className="font-mono text-primary-600 dark:text-primary-400">{sessionCode}</span>
                </p>

                <QRCodeCanvas
                  value={sessionCode}
                  size={200}
                  className="bg-white p-2 rounded-lg border border-gray-200 dark:border-[#2a2a3a]"
                />
              </div>

              {timeLeft === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60">
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">QR expired</p>
                    <p className="text-xs text-gray-400 mt-0.5">Regenerate to continue</p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                {timeLeft > 0 ? "Students must scan within 30 seconds" : "This code can no longer be scanned"}
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav role="teacher" />
    </div>
  );
}