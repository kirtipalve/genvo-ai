import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  GitMerge,
  Sparkles,
  Users,
  History,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Play,
  GitFork,
  Layers,
  Wand2,
  ArrowLeftRight,
  Video,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const features = [
  {
    icon: Sparkles,
    title: "AI Video Generation",
    description:
      "Generate stunning videos from text prompts. Describe your vision and let AI bring it to life.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description:
      "Every generation creates a new version. Track your prompt iterations and see what worked.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: GitMerge,
    title: "Prompt Merging",
    description:
      "Combine ideas from different branches. Merge prompts and generate unified results.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: ArrowLeftRight,
    title: "Side-by-Side Compare",
    description:
      "Compare any two versions with visual diff. See exactly what changed between prompts.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Multiple team members can create branches and explore different creative directions.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: GitFork,
    title: "Fork & Remix",
    description:
      "Fork public projects to remix them. Build on top of community creations.",
    color: "from-pink-500 to-rose-500",
  },
];

const workflow = [
  {
    step: 1,
    title: "Write Your Prompt",
    description: "Describe the video you want to create in natural language",
    icon: Wand2,
  },
  {
    step: 2,
    title: "Generate & Iterate",
    description: "AI generates your video. Refine the prompt and create new versions",
    icon: Sparkles,
  },
  {
    step: 3,
    title: "Branch & Explore",
    description: "Create branches to try different creative directions in parallel",
    icon: GitBranch,
  },
  {
    step: 4,
    title: "Compare & Merge",
    description: "Compare versions side-by-side, then merge the best ideas together",
    icon: GitMerge,
  },
];

const useCases = [
  {
    title: "Content Creators",
    description: "Create viral short-form videos with AI. Iterate fast, find what works.",
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=300&fit=crop",
  },
  {
    title: "Marketing Teams",
    description: "Generate ad variations quickly. A/B test different visual directions.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  },
  {
    title: "Creative Agencies",
    description: "Collaborate on client projects. Version control for creative work.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
  },
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-black/5 dark:border-white/5"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Video className="w-6 h-6 text-black dark:text-white" />
            <span className="text-xl font-semibold text-black dark:text-white">Genvo</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6"
          >
            GitHub for
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              AI Video Generation
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-black/60 dark:text-white/60 mb-8 max-w-2xl mx-auto"
          >
            Generate AI videos, track prompt versions, branch to explore ideas, and merge the best
            results. Version control for creative work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black px-8 gap-2"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-black/20 dark:border-white/20 px-8 gap-2"
              >
                <Play className="w-4 h-4" />
                View Examples
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              Built for Creative Iteration
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
              Stop losing track of your best prompts. Genvo brings version control to AI video
              generation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-black/60 dark:text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-black/60 dark:text-white/60">
              From prompt to polished video in four steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/10 dark:bg-white/10 -translate-x-1/2 hidden md:block" />

            <div className="space-y-12">
              {workflow.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div
                      className={`inline-flex items-center gap-3 ${
                        index % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="text-4xl font-bold text-black/10 dark:text-white/10">
                        {String(step.step).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-black/60 dark:text-white/60 mt-2">{step.description}</p>
                  </div>

                  <div className="relative z-10 w-16 h-16 rounded-full bg-white dark:bg-black border-2 border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-7 h-7 text-black dark:text-white" />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiator */}
      <section className="py-20 px-6 bg-black dark:bg-white text-white dark:text-black">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              The Merge That Changes Everything
            </h2>
            <p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
              Traditional video editing is serial—one person at a time. With Genvo, your team can
              explore parallel creative directions, then <strong>merge prompts</strong> to combine
              the best ideas. AI generates the unified result.
            </p>

            <div className="bg-white/10 dark:bg-black/10 rounded-2xl p-6 max-w-lg mx-auto text-left font-mono text-sm">
              <p className="opacity-60 mb-2"># Sarah's branch</p>
              <p className="mb-4">"cyberpunk city, <span className="text-cyan-400">blue neon lighting</span>"</p>

              <p className="opacity-60 mb-2"># John's branch</p>
              <p className="mb-4">"cyberpunk city, <span className="text-green-400">heavy flying car traffic</span>"</p>

              <p className="opacity-60 mb-2"># Merged prompt</p>
              <p>
                "cyberpunk city, <span className="text-cyan-400">blue neon lighting</span>,{" "}
                <span className="text-green-400">heavy flying car traffic</span>"
              </p>

              <div className="mt-4 pt-4 border-t border-white/20 dark:border-black/20 flex items-center gap-2">
                <GitMerge className="w-4 h-4" />
                <span className="opacity-60">→ AI generates combined video</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">Built For</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden"
              >
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                  <p className="text-white/80 text-sm">{useCase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
              Ready to Create?
            </h2>
            <p className="text-xl text-black/60 dark:text-white/60 mb-8">
              Start generating AI videos with version control today.
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black px-12 py-6 text-lg gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 py-8 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-black dark:text-white" />
            <span className="font-semibold text-black dark:text-white">Genvo</span>
          </div>
          <p className="text-sm text-black/50 dark:text-white/50">© 2026 Genvo</p>
        </div>
      </footer>
    </div>
  );
}
