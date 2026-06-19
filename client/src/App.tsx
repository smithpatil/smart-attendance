import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function App() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden ring-1 ring-gray-100 dark:ring-[#2a2a3a] text-gray-900 dark:text-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}