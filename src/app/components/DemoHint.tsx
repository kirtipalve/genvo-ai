// Subtle demo hints for walkthrough
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Lightbulb, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoHintProps {
  id: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  showOnce?: boolean;
}

// Track which hints have been dismissed
const dismissedHints = new Set<string>();

export function DemoHint({
  id,
  children,
  position = "bottom",
  delay = 1000,
  showOnce = true,
}: DemoHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (showOnce && dismissedHints.has(id)) return;

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [id, delay, showOnce]);

  const handleDismiss = () => {
    setVisible(false);
    if (showOnce) dismissedHints.add(id);
  };

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-black/80 dark:border-t-white/90",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-black/80 dark:border-b-white/90",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-black/80 dark:border-l-white/90",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-black/80 dark:border-r-white/90",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            "absolute z-50 max-w-xs",
            positionClasses[position]
          )}
        >
          <div className="relative bg-black/80 dark:bg-white/90 text-white dark:text-black rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400 dark:text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{children}</div>
              <button
                onClick={handleDismiss}
                className="p-0.5 rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowClasses[position]
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Quick tip banner for pages
interface DemoTipProps {
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
}

export function DemoTip({ children, action, dismissible = true }: DemoTipProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 text-sm text-black/70 dark:text-white/70">
          {children}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-black/40 dark:text-white/40" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
