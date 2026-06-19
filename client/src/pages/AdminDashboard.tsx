import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSessions: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/admin/stats`);
        setSystemStats({
          totalStudents: res.data.totalStudents,
          totalTeachers: res.data.totalTeachers,
          totalSessions: res.data.totalSessions,
        });
        
        // Format sessions into activity feed format
        const activities = res.data.recentActivity.map((session: any) => {
          const date = new Date(session.createdAt || session.date);
          const now = new Date();
          const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
          let timeString = diffInHours < 24 ? `${diffInHours} hr ago` : `${Math.floor(diffInHours / 24)}d ago`;
          if (diffInHours === 0) timeString = "Just now";

          return {
            action: "Session created",
            detail: `${session.subject} — ${session.branch || 'Unknown'}`,
            time: timeString,
            type: "session"
          };
        });

        setRecentActivity(activities);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setSystemStats({ totalStudents: 0, totalTeachers: 0, totalSessions: 0 });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />

      <div className="p-4 flex-1 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-header">Admin Dashboard</h1>
          <p className="page-subtitle">System overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Total students</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="stat-value">{systemStats.totalStudents}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Total teachers</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="stat-value">{systemStats.totalTeachers}</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">Total sessions</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="stat-value">{systemStats.totalSessions}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a3a]">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent activity</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-[#2a2a3a]">
            {recentActivity.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No recent activity</div>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      item.type === 'session' ? 'bg-blue-500' : 
                      item.type === 'user' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.action}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 ml-2">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <BottomNav role="admin" />
    </div>
  );
}