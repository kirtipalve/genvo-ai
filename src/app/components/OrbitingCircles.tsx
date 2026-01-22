import { motion } from "motion/react";

export function OrbitingCircles() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Center circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black dark:bg-white rounded-full transition-colors duration-500"
      />
      
      {/* Orbit ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-black dark:border-white rounded-full transition-colors duration-500"
      />
      
      {/* Orbiting circles */}
      {[0, 120, 240].map((rotation, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            rotate: 360 
          }}
          transition={{
            scale: { duration: 0.6, delay: 0.3 + i * 0.1 },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
          style={{ rotate: `${rotation}deg` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black dark:bg-white rounded-full transition-colors duration-500" />
        </motion.div>
      ))}
    </div>
  );
}