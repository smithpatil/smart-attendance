import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
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
        `http://${window.location.hostname}:8000/api/auth/login`,
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
    <div className="min-h-screen flex items-center justify-center font-sans bg-gray-50 dark:bg-[#111118] p-4 relative">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <div className="card p-6 border-t-4 border-t-primary-500">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="name@university.edu"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
              <div className="relative">
                <select
                  className="input-field appearance-none cursor-pointer pr-8"
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
              className="btn-primary w-full py-2.5 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Contact admin</a>
          </p>
          {role === "student" && (
            <div className="mt-8 text-center">
              <p className="text-[10px] text-gray-400 font-mono">Device ID: {deviceId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}