import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { ArrowRight } from "lucide-react";
import { OrbitingCircles } from "@/app/components/OrbitingCircles";

export function CTA() {
  return (
    <section className="py-32 bg-white dark:bg-black relative overflow-hidden transition-colors duration-500">
      {/* Minimal decorative circles */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.03 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-black dark:border-white rounded-full transition-colors duration-500"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.03 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-black dark:border-white rounded-full transition-colors duration-500"
      />
      
      {/* Particle effect */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          animate={{
            y: [0, -20, 0],
          }}
          className="absolute w-2 h-2 bg-black dark:bg-white rounded-full transition-colors duration-500"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
            transition: `y ${2 + i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="mb-12">
            <OrbitingCircles />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-12 transition-colors duration-500">
            Start Creating
          </h2>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black px-16 py-8 text-lg rounded-full transition-colors duration-500"
              >
                Try Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}