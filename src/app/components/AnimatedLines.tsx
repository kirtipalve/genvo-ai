import { motion } from "motion/react";

export function AnimatedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Horizontal lines */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 0.1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-[20%] left-0 w-full h-px bg-black dark:bg-white origin-left transition-colors duration-500"
      />
      
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 0.1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="absolute top-[80%] left-0 w-full h-px bg-black dark:bg-white origin-right transition-colors duration-500"
        style={{ transformOrigin: "right" }}
      />
      
      {/* Vertical lines */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 0.1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        className="absolute top-0 left-[25%] w-px h-full bg-black dark:bg-white origin-top transition-colors duration-500"
      />
      
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 0.1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        className="absolute top-0 left-[75%] w-px h-full bg-black dark:bg-white origin-bottom transition-colors duration-500"
        style={{ transformOrigin: "bottom" }}
      />
    </div>
  );
}