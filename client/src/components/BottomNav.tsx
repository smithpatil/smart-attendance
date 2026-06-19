import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  role: string;
};

const navItems: Record<string, { label: string; path: string; icon: string }[]> = {
  student: [
    { label: "Home", path: "/student", icon: "grid" },
    { label: "Scan", path: "/scan", icon: "scan" },
    { label: "Reports", path: "/attendance-report", icon: "chart" },
  ],
  teacher: [
    { label: "Home", path: "/teacher", icon: "grid" },
    { label: "Session", path: "/qr-attendance", icon: "plus" },
    { label: "Reports", path: "/attendance-report", icon: "chart" },
  ],
  admin: [
    { label: "Home", path: "/admin", icon: "grid" },
    { label: "Stats", path: "/analytics", icon: "chart" },
    { label: "Users", path: "/admin-security", icon: "users" },
  ],
};

function Icon({ name, className = "w-6 h-6" }: { name: string; className?: string }) {
  switch (name) {
    case "grid":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "scan":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "plus":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav({ role }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navItems[role] || navItems.student;

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white dark:bg-[#141420] border-t border-gray-200 dark:border-[#2a2a3a] px-2 py-2 pb-safe flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-16 gap-1 ${
              isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-primary-50 dark:bg-primary-950/50" : ""}`}>
              <Icon name={item.icon} className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
