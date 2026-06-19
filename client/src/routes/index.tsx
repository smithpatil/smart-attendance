import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import TeacherDashboard from "../pages/TeacherDashboard";
import AdminDashboard from "../pages/AdminDashboard";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/student", element: <StudentDashboard /> },
  { path: "/teacher", element: <TeacherDashboard /> },
  { path: "/admin", element: <AdminDashboard /> },
]);