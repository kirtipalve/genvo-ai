import { motion } from "motion/react";

export function MeshGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient blob 1 */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-200/40 via-purple-200/40 to-transparent blur-3xl dark:from-blue-900/20 dark:via-purple-900/20"
      />
      
      {/* Gradient blob 2 */}
      <motion.div
        animate={{
          x: [0, -80, 100, 0],
          y: [0, 100, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-pink-200/30 via-orange-200/30 to-transparent blur-3xl dark:from-pink-900/15 dark:via-orange-900/15"
      />
      
      {/* Gradient blob 3 */}
      <motion.div
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -60, 60, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-200/35 via-teal-200/35 to-transparent blur-3xl dark:from-cyan-900/18 dark:via-teal-900/18"
      />
      
      {/* Gradient blob 4 */}
      <motion.div
        animate={{
          x: [0, -100, 80, 0],
          y: [0, 80, -100, 0],
          scale: [1, 0.95, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-indigo-200/30 via-violet-200/30 to-transparent blur-3xl dark:from-indigo-900/15 dark:via-violet-900/15"
      />
      
      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 dark:opacity-20" />
    </div>
  );
}
