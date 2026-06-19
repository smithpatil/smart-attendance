import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSecurity() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    classLevel: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setFormError("Please fill in all required fields.");
      setFormLoading(false);
      return;
    }

    try {
      await axios.post(`/api/admin/users`, formData);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "student", department: "", classLevel: "" });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />

      <div className="p-4 flex-1 w-full relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="page-header">Users</h1>
            <p className="page-subtitle">Manage accounts</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary py-2 px-3 text-sm inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="card p-6 text-center text-sm text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="card p-6 text-center text-sm text-gray-500">No users found.</div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50 dark:border-white/5">
                  <span className={`badge ${user.role === 'teacher' ? 'badge-primary' : 'badge-neutral'} capitalize`}>
                    {user.role}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {user.role === "teacher" ? (user.classLevel || "No Year") : (user.department || "No Dept")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add User Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a1a24] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a2a3a] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-[#2a2a3a]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add New User</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field"
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="input-field"
                      placeholder="Create a password"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="input-field"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                    <div>
                      {formData.role === "student" ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            className="input-field"
                          >
                            <option value="">Select branch</option>
                            <option value="CSE">CSE</option>
                            <option value="AIML">AIML</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">IT</option>
                            <option value="Mechanical Engineering">Mechanical</option>
                            <option value="Civil Engineering">Civil</option>
                            <option value="Electronics">Electronics</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
                          <select
                            value={formData.classLevel}
                            onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                            className="input-field"
                          >
                            <option value="">Select year</option>
                            <option value="FY">FY</option>
                            <option value="SY">SY</option>
                            <option value="TY">TY</option>
                            <option value="Final Year">Final Year</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-[#2a2a3a] mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="btn-primary py-2 px-5 text-sm disabled:opacity-50"
                    >
                      {formLoading ? "Adding..." : "Add User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <BottomNav role="admin" />
    </div>
  );
}