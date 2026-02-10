import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/app/components/AppSidebar";
import { GlobalSearch, useGlobalSearch } from "@/app/components/GlobalSearch";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <AppSidebar onSearchClick={() => setSearchOpen(true)} />
      <main className="ml-64 transition-all duration-300">
        <Outlet />
      </main>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
