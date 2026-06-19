import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import QRAttendance from "./pages/QRAttendance";
import QRScanner from "./pages/QRScanner";
import AttendanceReport from "./pages/AttendanceReport";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminSecurity from "./pages/AdminSecurity";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/student",
    element: <StudentDashboard />,
  },
  {
    path: "/teacher",
    element: <TeacherDashboard />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/qr-attendance",
    element: <QRAttendance />,
  },
  {
    path: "/scan",
    element: <QRScanner />,
  },
  {
    path: "/attendance-report",
    element: <AttendanceReport />,
  },
  {
    path: "/analytics",
    element: <AnalyticsDashboard />,
  },
  {
    path: "/admin-security",
    element: <AdminSecurity />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
]);
