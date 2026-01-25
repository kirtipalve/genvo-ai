import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  GitBranch,
  GitMerge,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle,
  Wand2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import {
  getProject,
  getBranch,
  getBranchesByProject,
  mergeBranches,
} from "@/app/data/dataService";
import type { Project, Branch } from "@/app/data/mockData";

type MergeStatus = "editing" | "generating" | "completed";

export function Merge() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [branchA, setBranchA] = useState<Branch | null>(null);
  const [branchB, setBranchB] = useState<Branch | null>(null);
  const [mergedPrompt, setMergedPrompt] = useState("");
  const [status, setStatus] = useState<MergeStatus>("editing");
  const [progress, setProgress] = useState(0);

  const branchAId = searchParams.get("a") || searchParams.get("branch");
  const branchBId = searchParams.get("b");

  // Load data
  useEffect(() => {
    if (id) {
      const loadedProject = getProject(id);
      setProject(loadedProject || null);

      // Load branch A
      if (branchAId) {
        setBranchA(getBranch(branchAId) || null);
      }

      // Load branch B (or default to main)
      if (branchBId) {
        setBranchB(getBranch(branchBId) || null);
      } else {
        // Find main branch
        const branches = getBranchesByProject(id);
        const mainBranch = branches.find((b) => b.name === "main");
        setBranchB(mainBranch || null);
      }
    }
  }, [id, branchAId, branchBId]);

  // Initialize merged prompt when branches load
  useEffect(() => {
    if (branchA && branchB) {
      const wordsA = new Set(branchA.prompt.split(" "));
      const wordsB = branchB.prompt.split(" ");
      const combined = [...branchA.prompt.split(" ")];
      wordsB.forEach((word) => {
        if (!wordsA.has(word)) {
          combined.push(word);
        }
      });
      setMergedPrompt(combined.join(" "));
    }
  }, [branchA, branchB]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!branchA || !branchB || !project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
            Invalid branch selection
          </h2>
          <p className="text-black/60 dark:text-white/60 mb-4">
            Please select valid branches to merge.
          </p>
          <Link to={id ? `/project/${id}/branches` : "/dashboard"}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAutoMerge = () => {
    const suggestedMerge = `${branchA.prompt}, ${branchB.prompt
      .split(" ")
      .filter((word) => !branchA.prompt.includes(word))
      .join(" ")}`;
    setMergedPrompt(suggestedMerge);
  };

  const handleGenerate = () => {
    setStatus("generating");
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus("completed");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const handleSaveToMain = () => {
    if (!id || !project) return;

    // Merge creates a new version on the project
    mergeBranches(id, branchA.id, branchB.id, mergedPrompt, {
      ...branchA.settings,
      // Use the longer duration between the two
      duration: Math.max(branchA.settings.duration, branchB.settings.duration),
    });

    navigate(`/project/${id}`);
  };

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
        <span className="text-black dark:text-white">Merge</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
          <GitMerge className="w-8 h-8" />
          Merge Branches
        </h1>
        <p className="text-black/60 dark:text-white/60 mt-1 flex items-center gap-2">
          Merging
          <span className="font-medium text-black dark:text-white">{branchA.name}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-medium text-black dark:text-white">{branchB.name}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Source branches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Branch A */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-black/40 dark:text-white/40" />
              <span className="font-medium text-black dark:text-white">{branchA.name}</span>
              <span className="text-xs text-black/50 dark:text-white/50">by {branchA.author.name}</span>
            </div>
            {branchA.thumbnail && (
              <div className="p-4">
                <img
                  src={branchA.thumbnail}
                  alt={branchA.name}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              </div>
            )}
            <div className="p-4 pt-0">
              <p className="text-sm text-black/70 dark:text-white/70">{branchA.prompt}</p>
            </div>
          </div>

          {/* Branch B */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-black/40 dark:text-white/40" />
              <span className="font-medium text-black dark:text-white">{branchB.name}</span>
              <span className="text-xs text-black/50 dark:text-white/50">by {branchB.author.name}</span>
            </div>
            {branchB.thumbnail && (
              <div className="p-4">
                <img
                  src={branchB.thumbnail}
                  alt={branchB.name}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              </div>
            )}
            <div className="p-4 pt-0">
              <p className="text-sm text-black/70 dark:text-white/70">{branchB.prompt}</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Merged result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden sticky top-8">
            <div className="p-4 border-b border-black/5 dark:border-white/10">
              <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Merged Prompt
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                Edit the combined prompt, then generate the merged video
              </p>
            </div>

            <div className="p-4 space-y-4">
              {status === "editing" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Combined Prompt</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoMerge}
                        className="text-xs gap-1"
                      >
                        <Wand2 className="w-3 h-3" />
                        Auto-merge
                      </Button>
                    </div>
                    <Textarea
                      value={mergedPrompt}
                      onChange={(e) => setMergedPrompt(e.target.value)}
                      rows={6}
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 resize-none"
                      placeholder="Enter the merged prompt..."
                    />
                  </div>

                  {/* Merge preview hints */}
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-black/60 dark:text-white/60 mb-2">
                      Quick suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["blue neon lighting", "flying cars", "rain effect", "holographic ads"].map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() =>
                              setMergedPrompt((prev) =>
                                prev.includes(suggestion) ? prev : `${prev}, ${suggestion}`
                              )
                            }
                            className="text-xs px-2 py-1 rounded-full bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                          >
                            + {suggestion}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!mergedPrompt.trim()}
                    className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-6 gap-2"
                  >
                    <GitMerge className="w-5 h-5" />
                    Generate Merged Video
                  </Button>
                </>
              )}

              {status === "generating" && (
                <div className="py-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
                    <span className="font-medium text-black dark:text-white">
                      Generating merged video...
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-black dark:bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-black/50 dark:text-white/50 text-center mt-4">
                    {progress < 30 && "Analyzing prompts..."}
                    {progress >= 30 && progress < 60 && "Combining visual elements..."}
                    {progress >= 60 && progress < 90 && "Rendering merged video..."}
                    {progress >= 90 && "Finalizing..."}
                  </p>
                </div>
              )}

              {status === "completed" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Merge complete!
                    </span>
                  </div>

                  <VideoPlayer
                    thumbnail={branchA.thumbnail || branchB.thumbnail || ""}
                    title="Merged result"
                  />

                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                    <p className="text-xs text-black/50 dark:text-white/50 mb-1">Merged prompt:</p>
                    <p className="text-sm text-black/70 dark:text-white/70">{mergedPrompt}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStatus("editing");
                        setProgress(0);
                      }}
                      className="flex-1 border-black/10 dark:border-white/10"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handleSaveToMain}
                      className="flex-1 bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                    >
                      Save to Main
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
