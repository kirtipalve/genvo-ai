import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Video } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-black/5 dark:border-white/5 transition-colors duration-500"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Video className="w-6 h-6 text-black dark:text-white transition-colors duration-500" />
          <span className="text-xl font-semibold text-black dark:text-white transition-colors duration-500">Genvo</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/dashboard">
            <Button variant="ghost" className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors duration-500">
              Sign In
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black transition-colors duration-500">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}