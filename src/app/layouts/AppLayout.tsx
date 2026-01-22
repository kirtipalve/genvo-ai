import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/app/components/AppSidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <AppSidebar />
      <main className="ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
