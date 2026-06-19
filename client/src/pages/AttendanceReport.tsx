import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

export default function AttendanceReport() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [subjectWise, setSubjectWise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailedReports, setDetailedReports] = useState<any>({});
  const [activeBranch, setActiveBranch] = useState<string>("");
  const [role, setRole] = useState("");
  const [view, setView] = useState<"history" | "subjects" | "overview" | "by-branch">("subjects");
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;
      const userRole = decoded.role;
      setRole(userRole);

      // Set correct default view based on role
      if (userRole === "teacher" && (view === "subjects" || view === "history")) {
        setView("overview");
        return;
      } else if (userRole === "student" && (view === "overview" || view === "by-branch")) {
        setView("subjects");
        return;
      }

      if (userRole === "teacher") {
        if (view === "overview") {
          const res = await axios.get(`/api/attendance/teacher/${userId}`);
          setAttendance(res.data);
        } else if (view === "by-branch") {
          const res = await axios.get(`/api/attendance/teacher/${userId}/detailed-report`);
          setDetailedReports(res.data);
          const branches = Object.keys(res.data);
          if (branches.length > 0 && !activeBranch) {
            setActiveBranch(branches[0]);
          }
        }
      } else if (userRole === "admin") {
        const res = await axios.get(`/api/admin/reports`);
        setAttendance(res.data);
      } else {
        if (view === "history") {
          const res = await axios.get(`/api/attendance/student/${userId}`);
          setAttendance(res.data);
        } else {
          const res = await axios.get(`/api/attendance/subject-wise/${userId}`);
          setSubjectWise(res.data);
        }
      }
      setLoading(false);
    } catch (err: any) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const handleExportExcel = async (mode: "combined" | "branchwise") => {
    try {
      setExporting(mode);
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded: any = jwtDecode(token);
      const teacherId = decoded.id;

      const url = `/api/attendance/teacher/${teacherId}/export-excel?mode=${mode}`;

      const response = await axios.get(url, { responseType: "blob" });

      const contentDisposition = response.headers["content-disposition"];
      let fileName = mode === "combined"
        ? `Attendance_All_${new Date().toISOString().split("T")[0]}.xlsx`
        : `Attendance_Branchwise_${new Date().toISOString().split("T")[0]}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) fileName = match[1];
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export attendance data.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col bg-background min-h-screen font-sans pb-20 pt-16">
      <TopHeader />
      <div className="p-4 flex-1 w-full">
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <h1 className="page-header">
              {role === "teacher" ? "Class sessions" : role === "admin" ? "Reports" : "Reports"}
            </h1>
            <p className="page-subtitle">
              {role === "teacher" ? "Your sessions" : role === "admin" ? "All sessions" : "Attendance breakdown"}
            </p>
          </div>

          <div className="flex justify-between items-center w-full">
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-white/5 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {role === "student" && (
              <div className="flex bg-gray-100 dark:bg-[#1a1a24] p-0.5 rounded-lg border border-gray-200 dark:border-[#2a2a3a]">
                <button
                  onClick={() => setView("subjects")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    view === "subjects" ? "bg-white dark:bg-[#2a2a3a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Subjects
                </button>
                <button
                  onClick={() => setView("history")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    view === "history" ? "bg-white dark:bg-[#2a2a3a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  History
                </button>
              </div>
            )}

            {role === "teacher" && (
              <div className="flex bg-gray-100 dark:bg-[#1a1a24] p-0.5 rounded-lg border border-gray-200 dark:border-[#2a2a3a]">
                <button
                  onClick={() => setView("overview")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    view === "overview" ? "bg-white dark:bg-[#2a2a3a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setView("by-branch");
                    if (Object.keys(detailedReports).length > 0 && !activeBranch) {
                      setActiveBranch(Object.keys(detailedReports)[0]);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    view === "by-branch" ? "bg-white dark:bg-[#2a2a3a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Branch
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary-600"></div>
          </div>
        ) : role === "student" && view === "subjects" ? (
          <div className="flex flex-col gap-3">
            {subjectWise.map((item, index) => (
              <div key={index} className="card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.subjectCode}</p>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mt-0.5">{item.subject}</h3>
                  </div>
                  <span className={`badge ${item.percentage >= 75 ? 'badge-success' : 'badge-warning'}`}>
                    {item.percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                      <circle 
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray="125.6" 
                        strokeDashoffset={125.6 - (125.6 * item.percentage) / 100} 
                        className={`${item.percentage >= 75 ? 'text-primary-500' : 'text-amber-500'} transition-all duration-700`}
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                  
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
                      {item.totalAttended}<span className="text-gray-300 dark:text-gray-600 mx-0.5">/</span>{item.totalHeld}
                    </p>
                    <p className="text-[10px] text-gray-500">lectures</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50 dark:border-[#2a2a3a] flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] font-medium text-gray-500">
                    {item.teacherName?.substring(0, 1)}
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{item.teacherName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : role === "teacher" && view === "by-branch" ? (
          <div className="space-y-4">
            {Object.keys(detailedReports).length === 0 ? (
              <div className="card p-8 text-center text-sm text-gray-400">
                No branch data available yet.
              </div>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {Object.keys(detailedReports).map(branch => (
                    <button
                      key={branch}
                      onClick={() => setActiveBranch(branch)}
                      className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors border ${
                        activeBranch === branch
                          ? "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/50"
                          : "bg-white text-gray-600 border-gray-200 dark:bg-[#1a1a24] dark:text-gray-400 dark:border-[#2a2a3a]"
                      }`}
                    >
                      {branch}
                    </button>
                  ))}
                </div>

                {activeBranch && detailedReports[activeBranch] && (
                  <div className="space-y-3">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => handleExportExcel("combined")}
                        disabled={exporting !== null}
                        className="flex-1 justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40"
                      >
                        {exporting === "combined" ? "Exporting..." : "Export All"}
                      </button>
                      <button
                        onClick={() => handleExportExcel("branchwise")}
                        disabled={exporting !== null}
                        className="flex-1 justify-center inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:border-primary-800/40"
                      >
                        {exporting === "branchwise" ? "Exporting..." : "Export Branch"}
                      </button>
                    </div>

                    <div className="flex justify-between items-center px-1 mb-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">Students ({detailedReports[activeBranch].students.length})</h3>
                      <span className="text-xs text-gray-500">{detailedReports[activeBranch].sessions.length} sessions</span>
                    </div>

                    {detailedReports[activeBranch].students.length === 0 ? (
                      <div className="card p-6 text-center text-sm text-gray-400">
                        No students enrolled.
                      </div>
                    ) : (
                      detailedReports[activeBranch].students.map((student: any) => (
                        <div key={student.id} className="card p-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{student.name}</p>
                            <p className="text-[11px] text-gray-500">{student.rollNo}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className={`badge ${student.percentage >= 75 ? 'badge-success' : 'badge-warning'} text-[10px]`}>
                              {student.percentage}%
                            </span>
                            <span className="text-[10px] text-gray-500 mt-1">
                              {student.attendedCount}/{student.totalCount} classes
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="card p-8 text-center text-sm text-gray-400">
                No records found
              </div>
            ) : (
              attendance.map((item, index) => (
                <div key={index} className="card p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="pr-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{item.subject}</h3>
                      {(role === "teacher" || role === "admin") && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.branch || "Unknown Branch"}</p>
                      )}
                    </div>
                    {(role === "teacher" || role === "admin") ? (
                      <span className={`badge shrink-0 ${item.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {item.isActive ? "Active" : "Closed"}
                      </span>
                    ) : (
                      <span className={`badge shrink-0 ${item.status === "Present" ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end pt-2 mt-2 border-t border-gray-50 dark:border-[#2a2a3a]">
                    <div>
                      <span className="text-[11px] font-medium text-gray-500">
                        {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                      </span>
                      {role === "admin" && item.teacherName && (
                        <p className="text-[10px] text-gray-400 mt-0.5">by {item.teacherName}</p>
                      )}
                    </div>
                    <code className="text-[10px] font-mono font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 px-1.5 py-0.5 rounded">
                      {item.sessionCode}
                    </code>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <BottomNav role={role || "student"} />
    </div>
  );
}