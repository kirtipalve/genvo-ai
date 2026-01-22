import { motion } from "motion/react";

export function AnimatedGrid() {
  const dots = Array.from({ length: 100 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid grid-cols-10 gap-12 p-12">
        {dots.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
            className="w-1 h-1 bg-black dark:bg-white rounded-full transition-colors duration-500"
          />
        ))}
      </div>
    </div>
  );
}