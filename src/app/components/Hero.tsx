import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedGrid } from "@/app/components/AnimatedGrid";
import { FloatingShapes } from "@/app/components/FloatingShapes";
import { MeshGradient } from "@/app/components/MeshGradient";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Mesh gradient background */}
      <MeshGradient />
      
      {/* Animated grid background */}
      <AnimatedGrid />
      
      {/* Floating shapes */}
      <FloatingShapes />
      
      {/* Minimal geometric shapes */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-20 right-20 w-64 h-64 border border-black dark:border-white rounded-full transition-colors duration-500"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="absolute bottom-32 left-32 w-48 h-48 border border-black dark:border-white transition-colors duration-500"
      />
      
      {/* Animated cursor follower effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-black/5 dark:border-white/5 rounded-full transition-colors duration-500"
      />
      
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold text-black dark:text-white mb-8 tracking-tight transition-colors duration-500"
          >
            Create Together
          </motion.h1>
          
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-black/60 dark:text-white/60 mb-12 max-w-2xl mx-auto transition-colors duration-500"
          >
            AI video generation, versioned
          </motion.p>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard">
              <Button size="lg" className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black px-12 py-7 text-lg rounded-full transition-colors duration-500">
                Start Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}