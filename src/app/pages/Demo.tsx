// Interactive Demo Walkthrough for Investors
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Play,
  GitBranch,
  GitFork,
  Users,
  Sparkles,
  CheckCircle,
  Video,
  Layers,
  MessageSquare,
  Rocket,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  highlight?: string;
}

const demoSteps: DemoStep[] = [
  {
    id: "intro",
    title: "Welcome to Genvo",
    subtitle: "GitHub for AI-Generated Video",
    description:
      "Genvo is collaborative infrastructure for generative video production. We help creative teams version, branch, and iterate on AI-generated video across tools like Sora, Runway, and Firefly.",
    icon: <Video className="w-8 h-8" />,
    visual: (
      <div className="relative">
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center"
            >
              <Play className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=450&fit=crop"
            alt="Demo"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
      </div>
    ),
  },
  {
    id: "problem",
    title: "The Problem",
    subtitle: "Chaos in AI Video Production",
    description:
      "Today's AI video workflows are a mess: scattered files, lost prompts, no version history, and no way for teams to collaborate. Creative teams waste hours recreating work and lose their best iterations.",
    icon: <Zap className="w-8 h-8" />,
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {["final_v2_FINAL.mp4", "video_new_edit3.mp4", "output_fixed.mp4", "test_render_v4.mp4", "final_REAL.mp4", "video_USE_THIS.mp4"].map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, rotate: -5 + Math.random() * 10 }}
            animate={{ opacity: 1, rotate: -5 + Math.random() * 10 }}
            transition={{ delay: i * 0.1 }}
            className="aspect-video rounded-lg bg-red-500/10 border border-red-500/20 p-2 flex items-end"
          >
            <span className="text-[10px] text-red-400 truncate">{name}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "versioning",
    title: "Version Control",
    subtitle: "Never Lose Your Best Work",
    description:
      "Every generation is automatically versioned. See your complete history, compare any two versions, and instantly roll back to previous iterations. Just like Git, but for video.",
    icon: <Layers className="w-8 h-8" />,
    highlight: "Git for Video",
    visual: (
      <div className="space-y-3">
        {[
          { v: 3, prompt: "Neon city with flying cars, holographic billboards", time: "2 hours ago", active: true },
          { v: 2, prompt: "Cyberpunk city at night, neon reflections", time: "Yesterday" },
          { v: 1, prompt: "Futuristic city with neon lights", time: "2 days ago" },
        ].map((version, i) => (
          <motion.div
            key={version.v}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border",
              version.active
                ? "bg-white dark:bg-white/10 border-black/20 dark:border-white/20"
                : "bg-black/5 dark:bg-white/5 border-transparent"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full",
              version.active ? "bg-green-500" : "bg-black/20 dark:bg-white/20"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">v{version.v}</span>
                <span className="text-xs text-black/40 dark:text-white/40">{version.time}</span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 truncate">{version.prompt}</p>
            </div>
            {version.active && <CheckCircle className="w-4 h-4 text-green-500" />}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "branching",
    title: "Branching",
    subtitle: "Explore Without Fear",
    description:
      "Create branches to explore different creative directions without affecting your main version. Try new prompts, styles, or models — then merge the best results back.",
    icon: <GitBranch className="w-8 h-8" />,
    highlight: "Creative Experimentation",
    visual: (
      <div className="relative py-8">
        {/* Main branch line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-black/20 dark:bg-white/20" />

        {/* Branch visualization */}
        <div className="space-y-4 ml-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <span className="text-xs font-bold text-white dark:text-black">M</span>
            </div>
            <span className="font-semibold">main</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">default</span>
          </motion.div>

          {/* Branch lines */}
          <div className="relative ml-4 pl-8 border-l-2 border-dashed border-purple-500/50 space-y-3">
            {[
              { name: "blue-lighting", color: "bg-blue-500", status: "completed" },
              { name: "more-traffic", color: "bg-purple-500", status: "completed" },
              { name: "rain-effect", color: "bg-cyan-500", status: "draft" },
            ].map((branch, i) => (
              <motion.div
                key={branch.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", branch.color)}>
                  <GitBranch className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">{branch.name}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  branch.status === "completed" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"
                )}>
                  {branch.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "collaboration",
    title: "Team Collaboration",
    subtitle: "Work Together in Real-Time",
    description:
      "Invite team members, leave timestamped feedback on specific frames, approve versions, and track who changed what. Built for creative teams that move fast.",
    icon: <Users className="w-8 h-8" />,
    highlight: "Real-Time Collaboration",
    visual: (
      <div className="space-y-4">
        {/* Team avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["user", "sarah", "john", "mike"].map((seed, i) => (
              <motion.img
                key={seed}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900"
              />
            ))}
          </div>
          <span className="text-sm text-black/60 dark:text-white/60">4 team members</span>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          {[
            { user: "Sarah", comment: "Love the neon! Can we try more blue?", time: "2m ago" },
            { user: "John", comment: "Added more traffic in my branch", time: "1h ago" },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-start gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5"
            >
              <MessageSquare className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.user}</span>
                  <span className="text-xs text-black/40 dark:text-white/40">{c.time}</span>
                </div>
                <p className="text-sm text-black/70 dark:text-white/70">{c.comment}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "generation",
    title: "Multi-Model Generation",
    subtitle: "Use Any AI Video Tool",
    description:
      "Generate videos with Sora, Runway Gen-3, Firefly, Kling, and more — all from one interface. Compare outputs across models and pick the best for your project.",
    icon: <Sparkles className="w-8 h-8" />,
    highlight: "Model Agnostic",
    visual: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Veo 3", provider: "Google", color: "from-blue-500 to-cyan-500" },
          { name: "Mochi", provider: "Genmo", color: "from-purple-500 to-pink-500" },
          { name: "Hunyuan", provider: "Tencent", color: "from-orange-500 to-red-500" },
          { name: "MiniMax", provider: "MiniMax", color: "from-green-500 to-emerald-500" },
        ].map((model, i) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-4 rounded-xl bg-gradient-to-br text-white",
              model.color
            )}
          >
            <div className="text-lg font-bold">{model.name}</div>
            <div className="text-sm opacity-80">{model.provider}</div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "forking",
    title: "Fork & Remix",
    subtitle: "Build on Others' Work",
    description:
      "Discover public projects, fork them to start from proven prompts, and remix with your own creative vision. A community of AI video creators, learning from each other.",
    icon: <GitFork className="w-8 h-8" />,
    highlight: "Community-Driven",
    visual: (
      <div className="space-y-3">
        {[
          { title: "Northern Lights Dance", forks: 89, views: "5.4K", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&h=112&fit=crop" },
          { title: "Tokyo Street Walk", forks: 156, views: "8.9K", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=112&fit=crop" },
          { title: "Space Station Orbit", forks: 203, views: "12.4K", img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=112&fit=crop" },
        ].map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-white/5"
          >
            <img src={project.img} alt="" className="w-16 h-9 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{project.title}</div>
              <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50">
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {project.forks}
                </span>
                <span>{project.views} views</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "cta",
    title: "Ready to Transform Your Workflow?",
    subtitle: "Join the Future of AI Video",
    description:
      "Genvo replaces chaotic file-and-prompt workflows with a scalable production system. Version control, collaboration, and multi-model generation — all in one platform.",
    icon: <Rocket className="w-8 h-8" />,
    visual: (
      <div className="text-center py-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
        >
          <Video className="w-10 h-10 text-white" />
        </motion.div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-black dark:text-white">Genvo</div>
          <div className="text-black/60 dark:text-white/60">GitHub for AI Video</div>
        </div>
      </div>
    ),
  },
];

export function Demo() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const step = demoSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === demoSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigate("/dashboard");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step indicators */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
        {demoSteps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentStep
                ? "w-8 bg-black dark:bg-white"
                : i < currentStep
                ? "bg-black/40 dark:bg-white/40"
                : "bg-black/10 dark:bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8 pt-16">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left: Content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400"
                >
                  {step.icon}
                </motion.div>

                {step.highlight && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400"
                  >
                    {step.highlight}
                  </motion.span>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                    {step.title}
                  </h1>
                  <h2 className="text-xl text-black/60 dark:text-white/60">
                    {step.subtitle}
                  </h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-lg text-black/70 dark:text-white/70 leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Right: Visual */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6"
              >
                {step.visual}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-black to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirst}
            className={cn("gap-2", isFirst && "opacity-0 pointer-events-none")}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-black/50 dark:text-white/50">
            {currentStep + 1} / {demoSteps.length}
          </div>

          <Button
            onClick={handleNext}
            className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2 px-6"
          >
            {isLast ? (
              <>
                Try Genvo
                <Rocket className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="fixed top-6 right-6 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
      >
        Skip Demo
      </button>
    </div>
  );
}
