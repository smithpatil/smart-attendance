import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LandingPage() {
  const [view, setView] = useState<"login" | "features" | "about">("login");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    let storedDeviceId = localStorage.getItem("device_id");
    if (!storedDeviceId) {
      storedDeviceId = "DEV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem("device_id", storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      localStorage.setItem("theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const loginPayload: any = { email, password, role, deviceId };
      const res = await axios.post(
        `/api/auth/login`,
        loginPayload
      );

      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/admin");
      }
    } catch (err: any) {
      const errData = err.response?.data;
      setError(errData?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 dark:bg-[#111118]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">SmartAttend</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm transition-colors border border-gray-100 dark:border-gray-700"
        >
          {isDarkMode ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-2">
        {view === "login" && (
          <div className="animate-fade-in">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
            </div>

            <div className="card p-5 border-t-4 border-t-primary-500">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    className="input-field py-2.5 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field py-2.5 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      className="input-field py-2.5 text-sm appearance-none cursor-pointer pr-8"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm mt-2 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-400 font-mono">Device ID: {deviceId}</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
               <button onClick={() => setView("features")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Features</button>
               <span className="text-gray-300 dark:text-gray-700">•</span>
               <button onClick={() => setView("about")} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">About</button>
            </div>
          </div>
        )}

        {view === "features" && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features</h2>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#151520] p-5 rounded-2xl border border-gray-100 dark:border-[#2a2a3a] text-left">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Dynamic QR Codes</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Secure, time-sensitive QR codes that prevent proxy attendance.</p>
              </div>

              <div className="bg-white dark:bg-[#151520] p-5 rounded-2xl border border-gray-100 dark:border-[#2a2a3a] text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Instant Verification</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mark attendance in seconds using your mobile device camera.</p>
              </div>

              <div className="bg-white dark:bg-[#151520] p-5 rounded-2xl border border-gray-100 dark:border-[#2a2a3a] text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Detailed Analytics</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Comprehensive reports and visual dashboards for all users.</p>
              </div>
            </div>

            <button onClick={() => setView("login")} className="mt-8 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              ← Back to Login
            </button>
          </div>
        )}

        {view === "about" && (
          <div className="animate-fade-in text-center w-full">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About SmartAttend</h2>
            
            <div className="space-y-6 text-left w-full max-w-sm mx-auto mb-10">
              <div className="relative p-6 rounded-3xl bg-white dark:bg-[#151520] shadow-xl shadow-primary-500/5 border border-primary-100 dark:border-primary-900/30 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 dark:bg-primary-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-4 uppercase tracking-widest">How it Works in Practice</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">Teacher starts class</span> and generates a dynamic QR code on their laptop or projector.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">Students scan</span> the code using their smartphone camera from their desks.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">Instant logging.</span> Attendance is instantly synced to the database with detailed analytics.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151520] shadow-lg shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-[#2a2a3a] flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Saves Time</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Reclaims 15+ minutes per class.</p>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#151520] shadow-lg shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-[#2a2a3a] flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">No Proxies</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Time-sensitive codes stop cheating.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setView("login")} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </div>
        )}
      </main>
    </div>
  );
}