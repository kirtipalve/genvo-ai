import { motion } from "motion/react";
import { GitBranch, Users, Sparkles, Zap } from "lucide-react";
import { AnimatedLines } from "@/app/components/AnimatedLines";

const features = [
  {
    icon: GitBranch,
    title: "Version Control",
  },
  {
    icon: Users,
    title: "Collaborate",
  },
  {
    icon: Sparkles,
    title: "AI Tools",
  },
  {
    icon: Zap,
    title: "Fast Render",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 bg-white dark:bg-black relative overflow-hidden transition-colors duration-500">
      <AnimatedLines />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-4 transition-colors duration-500">
            Features
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* Floating icon with minimal border */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-20 h-20 border-2 border-black dark:border-white rounded-full flex items-center justify-center bg-white dark:bg-black relative z-10 transition-colors duration-500"
                  >
                    <feature.icon className="w-9 h-9 text-black dark:text-white transition-colors duration-500" />
                  </motion.div>
                  
                  {/* Animated ring around icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 border-2 border-black dark:border-white rounded-full transition-colors duration-500"
                  />
                  
                  {/* Decorative element */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    animate={{
                      rotate: 360,
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-black dark:bg-white rounded-full transition-colors duration-500"
                    style={{
                      transition: "rotate 4s linear infinite",
                    }}
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-black dark:text-white text-center transition-colors duration-500">{feature.title}</h3>
                
                {/* Connecting line on hover */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-8 bg-black/10 dark:bg-white/10 origin-top transition-colors duration-500"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}