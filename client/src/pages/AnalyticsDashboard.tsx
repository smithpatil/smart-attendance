import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    monthlyAvg: 0,
    subjectWiseData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`/api/admin/analytics`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />
      <div className="p-4 flex-1 w-full">
        <div className="mb-6">
          <h1 className="page-header">Analytics</h1>
          <p className="page-subtitle">System-wide attendance</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card p-4">
            <p className="section-label mb-1">Total students</p>
            <p className="stat-value">{analytics.totalStudents}</p>
          </div>

          <div className="card p-4">
            <p className="section-label mb-1">Present today</p>
            <p className="stat-value text-emerald-600 dark:text-emerald-400">{analytics.presentToday}</p>
          </div>

          <div className="card p-4">
            <p className="section-label mb-1">Absent today</p>
            <p className="stat-value text-red-500 dark:text-red-400">{analytics.absentToday}</p>
          </div>

          <div className="card p-4">
            <p className="section-label mb-1">Monthly avg</p>
            <p className="stat-value">{analytics.monthlyAvg}%</p>
          </div>
        </div>

        <div className="card p-4 h-[300px]">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Attendance by subject</h2>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary-600"></div>
            </div>
          ) : analytics.subjectWiseData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">
              No subject data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={analytics.subjectWiseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="subject" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} 
                  dy={8} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} 
                  dx={-5} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb', 
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }} 
                />
                <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <BottomNav role="admin" />
    </div>
  );
}