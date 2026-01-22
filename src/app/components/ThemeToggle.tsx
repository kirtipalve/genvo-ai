import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-black/10 dark:bg-white/10 rounded-full p-1 transition-colors"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-1 bg-white dark:bg-black rounded-full flex items-center justify-center"
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-black" />
        )}
      </motion.div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className="w-4 h-4 text-black/40 dark:text-white/20" />
        <Moon className="w-4 h-4 text-black/20 dark:text-white/40" />
      </div>
    </motion.button>
  );
}
