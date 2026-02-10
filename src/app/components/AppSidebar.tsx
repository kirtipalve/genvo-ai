import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Compass,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  Play,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getUnreadNotifications } from "@/app/data/collaborationService";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Plus, label: "New Project", path: "/new" },
  { icon: Compass, label: "Explore", path: "/explore" },
];

interface AppSidebarProps {
  onSearchClick?: () => void;
}

export function AppSidebar({ onSearchClick }: AppSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white/80 dark:bg-black/80 backdrop-blur-xl border-r border-black/5 dark:border-white/5 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <Video className="w-6 h-6 text-black dark:text-white transition-colors" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold text-black dark:text-white transition-colors"
            >
              Genvo
            </motion.span>
          )}
        </Link>
      </div>

      {/* Search button */}
      <div className="px-3 py-2">
        <button
          onClick={onSearchClick}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm text-black/60 dark:text-white/60",
            collapsed && "justify-center"
          )}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-black/10 dark:border-white/10 px-1.5 font-mono text-xs">
                <Command className="w-3 h-3" />K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-black/5 dark:border-white/5 space-y-2">
        {/* Demo button */}
        <Link to="/demo">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200",
              collapsed && "justify-center"
            )}
          >
            <Play className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Demo</span>}
          </motion.div>
        </Link>

        {/* Theme toggle */}
        <div className={cn(
          "flex items-center rounded-lg px-3 py-2",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <span className="text-sm text-black/50 dark:text-white/50">Theme</span>
          )}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>

        <Link to="/settings">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200",
              location.pathname === "/settings" && "bg-black/10 dark:bg-white/10"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </motion.div>
        </Link>
      </div>

      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-sm hover:bg-black/5 dark:hover:bg-white/5"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </motion.aside>
  );
}
