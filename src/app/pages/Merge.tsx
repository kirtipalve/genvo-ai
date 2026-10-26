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
  Bot,
  AlertTriangle,
  CheckCircle2,
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

type MergeStatus = "analyzing" | "editing" | "generating" | "completed";

interface ConflictField {
  field: string;
  valueA: string;
  valueB: string;
}

function detectConflicts(a: Branch, b: Branch): ConflictField[] {
  const conflicts: ConflictField[] = [];
  if (a.settings.style !== b.settings.style)
    conflicts.push({ field: "Style", valueA: a.settings.style, valueB: b.settings.style });
  if (a.settings.model !== b.settings.model)
    conflicts.push({ field: "Model", valueA: a.settings.model, valueB: b.settings.model });
  if (a.settings.duration !== b.settings.duration)
    conflicts.push({ field: "Duration", valueA: `${a.settings.duration}s`, valueB: `${b.settings.duration}s` });
  if (a.settings.aspectRatio !== b.settings.aspectRatio)
    conflicts.push({ field: "Aspect Ratio", valueA: a.settings.aspectRatio, valueB: b.settings.aspectRatio });
  return conflicts;
}

function buildAiSuggestion(a: Branch, b: Branch, conflicts: ConflictField[]): string {
  const wordsA = new Set(a.prompt.toLowerCase().split(/\W+/));
  const uniqueFromB = b.prompt
    .split(" ")
    .filter((w) => !wordsA.has(w.toLowerCase()))
    .slice(0, 12)
    .join(" ");

  const base = `${a.prompt}, ${uniqueFromB}`;

  if (conflicts.length === 0) return base.trim();

  const resolutions = conflicts
    .map((c) => {
      if (c.field === "Duration") return `duration: ${Math.max(parseInt(c.valueA), parseInt(c.valueB))}s`;
      if (c.field === "Style") return `style: blend of ${c.valueA} and ${c.valueB}`;
      return null;
    })
    .filter(Boolean);

  return resolutions.length > 0 ? `${base.trim()} [${resolutions.join(", ")}]` : base.trim();
}

export function Merge() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [branchA, setBranchA] = useState<Branch | null>(null);
  const [branchB, setBranchB] = useState<Branch | null>(null);
  const [mergedPrompt, setMergedPrompt] = useState("");
  const [status, setStatus] = useState<MergeStatus>("analyzing");
  const [progress, setProgress] = useState(0);
  const [conflicts, setConflicts] = useState<ConflictField[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiStreamText, setAiStreamText] = useState("");

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

  // Run conflict analysis when branches load
  useEffect(() => {
    if (!branchA || !branchB) return;

    const detected = detectConflicts(branchA, branchB);
    const suggestion = buildAiSuggestion(branchA, branchB, detected);

    setConflicts(detected);
    setAiSuggestion(suggestion);
    setMergedPrompt(suggestion);
    setStatus("analyzing");

    // Simulate AI analysis + streaming
    const analysisTimer = setTimeout(() => {
      setAiStreaming(true);
      setAiStreamText("");

      const fullText = detected.length > 0
        ? `I found ${detected.length} conflict${detected.length > 1 ? "s" : ""} between these branches. ${detected.map((c) => `**${c.field}** differs (${c.valueA} vs ${c.valueB})`).join("; ")}. I recommend ${detected.find((c) => c.field === "Duration") ? `using the longer duration (${Math.max(parseInt(detected.find((c) => c.field === "Duration")!.valueA), parseInt(detected.find((c) => c.field === "Duration")!.valueB))}s)` : "keeping settings from branch A"}. The merged prompt combines unique visual elements from both branches while maintaining coherence.`
        : `No conflicts detected — both branches share compatible settings. I've combined the prompts by merging unique descriptors from each branch. The result should blend both visual directions cleanly.`;

      let i = 0;
      const streamInterval = setInterval(() => {
        i += 2;
        setAiStreamText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(streamInterval);
          setAiStreaming(false);
          setTimeout(() => setStatus("editing"), 400);
        }
      }, 18);

      return () => clearInterval(streamInterval);
    }, 800);

    return () => clearTimeout(analysisTimer);
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

        {/* Right: AI analysis + Merged result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* AI Conflict Analysis Card */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-black dark:text-white text-sm">AI Conflict Checker</span>
              {status === "analyzing" && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black/40 dark:text-white/40 ml-auto" />
              )}
              {status !== "analyzing" && conflicts.length === 0 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
              )}
              {status !== "analyzing" && conflicts.length > 0 && (
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 ml-auto" />
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Conflict fields */}
              {conflicts.length > 0 && (
                <div className="space-y-2">
                  {conflicts.map((c) => (
                    <div key={c.field} className="flex items-center gap-2 p-2 bg-yellow-500/8 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-black dark:text-white">{c.field}</span>
                      <span className="text-xs text-black/40 dark:text-white/40 ml-auto">
                        <span className="text-purple-500">{c.valueA}</span>
                        {" vs "}
                        <span className="text-cyan-500">{c.valueB}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {conflicts.length === 0 && status !== "analyzing" && (
                <div className="flex items-center gap-2 p-2 bg-green-500/8 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">No conflicts — clean merge</span>
                </div>
              )}

              {/* AI streaming text */}
              {(aiStreamText || status === "analyzing") && (
                <div className="p-3 bg-black/3 dark:bg-white/3 rounded-lg">
                  <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                    {status === "analyzing" && !aiStreamText ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing branches...
                      </span>
                    ) : (
                      <>
                        {aiStreamText.replace(/\*\*(.*?)\*\*/g, "$1")}
                        {aiStreaming && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-1.5 h-3 bg-black/40 dark:bg-white/40 ml-0.5 align-middle"
                          />
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Apply suggestion button */}
              {!aiStreaming && aiSuggestion && status === "editing" && (
                <button
                  onClick={() => setMergedPrompt(aiSuggestion)}
                  className="w-full text-xs py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 transition-colors text-left flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 flex-shrink-0" />
                  Apply AI suggestion
                </button>
              )}
            </div>
          </div>

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
                    disabled={!mergedPrompt.trim() || status === "analyzing"}
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
