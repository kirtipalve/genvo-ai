import { motion } from "motion/react";

const steps = [
  {
    number: "1",
    title: "Upload",
  },
  {
    number: "2",
    title: "Create",
  },
  {
    number: "3",
    title: "Share",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-500">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear"
            }}
            className="absolute"
            style={{
              left: `${(i * 5)}%`,
              top: 0,
              width: '2px',
              height: '100%',
              background: 'linear-gradient(to bottom, transparent, currentColor, transparent)',
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-4 transition-colors duration-500">
            How it works
          </h2>
        </motion.div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Large number background */}
                <div className="text-center relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="text-8xl md:text-9xl font-bold text-black/5 dark:text-white/5 leading-none mb-4 relative transition-colors duration-500"
                  >
                    {step.number}
                    
                    {/* Animated outline */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                      className="absolute inset-0 text-black/10 dark:text-white/10 transition-colors duration-500"
                    >
                      {step.number}
                    </motion.div>
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-black dark:text-white -mt-8 transition-colors duration-500">{step.title}</h3>
                </div>
              </motion.div>
              
              {/* Animated arrow between steps */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                  className="hidden md:block absolute -right-12"
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-4xl text-black/20 dark:text-white/20 transition-colors duration-500"
                  >
                    →
                  </motion.div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}