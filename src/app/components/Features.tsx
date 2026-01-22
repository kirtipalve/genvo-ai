import { motion } from "motion/react";
import { GitBranch, GitMerge, Sparkles, ArrowLeftRight, Users, GitFork } from "lucide-react";
import { AnimatedLines } from "@/app/components/AnimatedLines";

const features = [
  {
    icon: Sparkles,
    title: "AI Video Generation",
    description: "Generate stunning videos from text prompts. Describe your vision and let AI bring it to life.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Every generation creates a new version. Track your prompt iterations and see what worked.",
  },
  {
    icon: GitMerge,
    title: "Prompt Merging",
    description: "Combine ideas from different branches. Merge prompts and generate unified results.",
  },
  {
    icon: ArrowLeftRight,
    title: "Side-by-Side Compare",
    description: "Compare any two versions with visual diff. See exactly what changed between prompts.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multiple team members can create branches and explore different creative directions.",
  },
  {
    icon: GitFork,
    title: "Fork & Remix",
    description: "Fork public projects to remix them. Build on top of community creations.",
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
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-4 transition-colors duration-500">
            Built for Creative Iteration
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            Stop losing track of your best prompts. Genvo brings version control to AI video generation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/10 p-6 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}