import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/app/components/AppSidebar";
import { GlobalSearch, useGlobalSearch } from "@/app/components/GlobalSearch";

export function AppLayout() {
  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <AppSidebar
        onSearchClick={() => setSearchOpen(true)}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 256 }}
      >
        <Outlet />
      </main>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
