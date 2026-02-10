import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-11 h-6 bg-black/10 dark:bg-white/10 rounded-full transition-colors"
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle circle */}
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 bg-black dark:bg-white rounded-full flex items-center justify-center"
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-black" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}
