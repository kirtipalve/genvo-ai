import { motion } from "motion/react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  GitBranch,
  GitMerge,
  ChevronRight,
  ArrowRight,
  Plus,
  Minus,
  Equal,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { mockProjects, mockBranches } from "@/app/data/mockData";
import { cn } from "@/lib/utils";

export function Compare() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];

  const branchAId = searchParams.get("a");
  const branchBId = searchParams.get("b");

  const branchA = mockBranches.find((b) => b.id === branchAId);
  const branchB = mockBranches.find((b) => b.id === branchBId);

  if (!branchA || !branchB) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-black/60 dark:text-white/60">Invalid branch selection</p>
      </div>
    );
  }

  // Simple word-level diff
  const getPromptDiff = () => {
    const wordsA = branchA.prompt.split(" ");
    const wordsB = branchB.prompt.split(" ");
    const wordsASet = new Set(wordsA);
    const wordsBSet = new Set(wordsB);

    const common: string[] = [];
    const onlyInA: string[] = [];
    const onlyInB: string[] = [];

    wordsA.forEach((word) => {
      if (wordsBSet.has(word)) {
        if (!common.includes(word)) common.push(word);
      } else {
        onlyInA.push(word);
      }
    });

    wordsB.forEach((word) => {
      if (!wordsASet.has(word)) {
        onlyInB.push(word);
      }
    });

    return { common, onlyInA, onlyInB };
  };

  const diff = getPromptDiff();

  return (
    <div className="min-h-screen p-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 mb-6"
      >
        <Link to="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to={`/project/${id}`}
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          {project.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to={`/project/${id}/branches`}
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          Branches
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black dark:text-white">Compare</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Compare Branches
          </h1>
          <p className="text-black/60 dark:text-white/60 mt-1 flex items-center gap-2">
            <span className="font-medium">{branchA.name}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{branchB.name}</span>
          </p>
        </div>

        <Link to={`/project/${id}/merge?a=${branchAId}&b=${branchBId}`}>
          <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
            <GitMerge className="w-4 h-4" />
            Merge Branches
          </Button>
        </Link>
      </motion.div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Branch A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-black/40 dark:text-white/40" />
            <h2 className="font-semibold text-black dark:text-white">{branchA.name}</h2>
            <span className="text-xs text-black/50 dark:text-white/50">by {branchA.author.name}</span>
          </div>
          {branchA.thumbnail && (
            <VideoPlayer thumbnail={branchA.thumbnail} title={branchA.name} />
          )}
        </motion.div>

        {/* Branch B */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-black/40 dark:text-white/40" />
            <h2 className="font-semibold text-black dark:text-white">{branchB.name}</h2>
            <span className="text-xs text-black/50 dark:text-white/50">by {branchB.author.name}</span>
          </div>
          {branchB.thumbnail && (
            <VideoPlayer thumbnail={branchB.thumbnail} title={branchB.name} />
          )}
        </motion.div>
      </div>

      {/* Prompt Diff */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-black/5 dark:border-white/10">
          <h3 className="font-semibold text-black dark:text-white">Prompt Comparison</h3>
        </div>

        <div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/10">
          {/* Branch A Prompt */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-black/50 dark:text-white/50">
              <GitBranch className="w-4 h-4" />
              {branchA.name}
            </div>
            <p className="text-black/80 dark:text-white/80 leading-relaxed">
              {branchA.prompt.split(" ").map((word, i) => {
                const isUnique = !branchB.prompt.includes(word);
                return (
                  <span
                    key={i}
                    className={cn(
                      isUnique && "bg-red-500/20 text-red-700 dark:text-red-300 px-1 rounded"
                    )}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Branch B Prompt */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-black/50 dark:text-white/50">
              <GitBranch className="w-4 h-4" />
              {branchB.name}
            </div>
            <p className="text-black/80 dark:text-white/80 leading-relaxed">
              {branchB.prompt.split(" ").map((word, i) => {
                const isUnique = !branchA.prompt.includes(word);
                return (
                  <span
                    key={i}
                    className={cn(
                      isUnique && "bg-green-500/20 text-green-700 dark:text-green-300 px-1 rounded"
                    )}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Diff Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Equal className="w-4 h-4 text-black/40 dark:text-white/40" />
            <span className="text-sm text-black/60 dark:text-white/60">Common words</span>
          </div>
          <p className="text-2xl font-bold text-black dark:text-white">{diff.common.length}</p>
        </div>

        <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">Only in {branchA.name}</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{diff.onlyInA.length}</p>
        </div>

        <div className="bg-green-500/5 rounded-xl border border-green-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">Only in {branchB.name}</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{diff.onlyInB.length}</p>
        </div>
      </motion.div>

      {/* Settings Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-black/5 dark:border-white/10">
          <h3 className="font-semibold text-black dark:text-white">Settings Comparison</h3>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {[
            { label: "Duration", a: `${branchA.settings.duration}s`, b: `${branchB.settings.duration}s` },
            { label: "Aspect Ratio", a: branchA.settings.aspectRatio, b: branchB.settings.aspectRatio },
            { label: "Style", a: branchA.settings.style, b: branchB.settings.style },
            { label: "Model", a: branchA.settings.model, b: branchB.settings.model },
          ].map((setting) => (
            <div key={setting.label} className="grid grid-cols-3 p-3 text-sm">
              <span className="text-black/50 dark:text-white/50">{setting.label}</span>
              <span
                className={cn(
                  "text-center",
                  setting.a !== setting.b
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-black/70 dark:text-white/70"
                )}
              >
                {setting.a}
              </span>
              <span
                className={cn(
                  "text-center",
                  setting.a !== setting.b
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-black/70 dark:text-white/70"
                )}
              >
                {setting.b}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
