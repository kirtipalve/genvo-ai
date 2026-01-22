import { motion } from "motion/react";

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Circle 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 left-[10%] w-32 h-32 border border-black/5 dark:border-white/5 rounded-full transition-colors duration-500"
      />
      
      {/* Circle 2 */}
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-40 right-[15%] w-24 h-24 border border-black/5 dark:border-white/5 rounded-full transition-colors duration-500"
      />
      
      {/* Square */}
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 80, 0],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-32 left-[20%] w-20 h-20 border border-black/5 dark:border-white/5 transition-colors duration-500"
      />
      
      {/* Triangle representation with square rotated */}
      <motion.div
        animate={{
          x: [0, 90, 0],
          y: [0, -70, 0],
          rotate: [45, 225, 45],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-40 right-[25%] w-16 h-16 border border-black/5 dark:border-white/5 transition-colors duration-500"
      />
      
      {/* Small circle */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -80, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[60%] left-[15%] w-12 h-12 border border-black/5 dark:border-white/5 rounded-full transition-colors duration-500"
      />
    </div>
  );
}