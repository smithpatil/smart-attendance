import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const role = localStorage.getItem("role") || "student";

  // Profile details state
  const [name, setName] = useState(user.name || "");
  const [division, setDivision] = useState(user.division || "");
  const [classLevel, setClassLevel] = useState(user.classLevel || "");
  const [rollNo, setRollNo] = useState(user.rollNo || "");
  const [phoneNo, setPhoneNo] = useState(user.phoneNo || "");
  const [address, setAddress] = useState(user.address || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [isProfileSuccess, setIsProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsProfileSuccess(false);
        setProfileMessage("User not authenticated.");
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      const res = await axios.put(`/api/auth/profile`, {
        userId,
        name,
        division,
        classLevel,
        rollNo,
        phoneNo,
        address
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsProfileSuccess(true);
      setProfileMessage("Profile updated successfully.");
    } catch (err: any) {
      setIsProfileSuccess(false);
      setProfileMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsSuccess(false);
      setMessage("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsSuccess(false);
      setMessage("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setIsSuccess(false);
        setMessage("User not authenticated.");
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      await axios.put(`/api/auth/change-password`, {
        userId,
        currentPassword,
        newPassword
      });

      setIsSuccess(true);
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />
      <div className="p-4 flex-1 w-full overflow-y-auto">
        <div className="mb-6">
          <h1 className="page-header">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* User Info */}
          <div className="card p-5 h-fit">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl font-bold shrink-0">
                {user.name ? user.name.substring(0, 2).toUpperCase() : role.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{user.name || "User"}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-[#2a2a3a]">
              <div>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-900 dark:text-white mt-0.5 break-all">{user.email || "No email available"}</p>
              </div>
              {user.department && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Department</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-0.5">{user.department}</p>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-xs border flex items-center gap-2 ${isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                }`}>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Personal Details Form */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Personal Details</h2>

            {profileMessage && (
              <div className={`mb-4 p-3 rounded-lg text-xs border flex items-center gap-2 ${isProfileSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                }`}>
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                {role === "student" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Division</label>
                      <input
                        type="text"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. A"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Class/Year</label>
                      <input
                        type="text"
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 2nd Year"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="Enter roll number"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field py-2 text-sm min-h-[80px] resize-y"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {profileLoading ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <BottomNav role={role} />
    </div>
  );
}
