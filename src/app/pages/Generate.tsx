import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Wand2,
  ChevronRight,
  Loader2,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Key,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { styleOptions, aspectRatioOptions } from "@/app/data/mockData";
import { getProject, addVersion, updateProject } from "@/app/data/dataService";
import type { Project } from "@/app/data/mockData";
import { cn } from "@/lib/utils";
import {
  generateVideo,
  simulateGeneration,
  isApiKeyConfigured,
  saveApiKey,
  VIDEO_MODELS,
  type VideoModelKey,
} from "@/app/services/videoGeneration";
import { toast } from "sonner";

type GenerationStatus = "idle" | "generating" | "completed" | "error";

const PROMPT_HISTORY_KEY = "genvo_prompt_history";

function getPromptHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PROMPT_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePromptToHistory(prompt: string) {
  const history = getPromptHistory().filter((p) => p !== prompt);
  history.unshift(prompt);
  localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

// Simple client-side prompt enhancer
function enhancePrompt(prompt: string, style: string, model: VideoModelKey): string {
  const styleEnhancements: Record<string, string> = {
    Cinematic: "cinematic lighting, dramatic depth of field, film grain, anamorphic lens flare",
    Natural: "natural lighting, realistic textures, documentary-style, true-to-life colors",
    Abstract: "abstract forms, fluid motion, vivid color gradients, artistic visualization",
    Anime: "anime art style, cel shading, vibrant colors, dynamic action lines",
    Product: "studio lighting, clean background, high-detail product shot, commercial quality",
    Lofi: "lo-fi aesthetic, warm tones, grainy texture, nostalgic atmosphere",
    Vintage: "vintage film look, warm color grading, 8mm aesthetic, retro vibes",
    Neon: "neon glow effects, cyberpunk atmosphere, vibrant neon lights, dark contrasts",
    Minimalist: "minimalist composition, clean lines, negative space, simple elegance",
    Fantasy: "magical atmosphere, ethereal lighting, fantasy world-building, epic scale",
  };

  const modelEnhancements: Record<string, string> = {
    veo3: "high resolution, smooth motion, photorealistic",
    mochi: "fluid motion, high fidelity, detailed textures",
    minimax: "fast-paced, commercial quality, clean visuals",
    hunyuan: "high visual quality, artistic composition, cinematic feel",
  };

  const styleHint = styleEnhancements[style] || "high quality";
  const modelHint = modelEnhancements[model] || "high quality";

  const basePrompt = prompt.trim().replace(/[.,!?]+$/, "");
  return `${basePrompt}, ${styleHint}, ${modelHint}, 4K quality, professional production`;
}

function estimateCost(model: VideoModelKey, duration: number): string {
  const baseCosts: Record<VideoModelKey, number> = {
    veo3: 0.5,
    mochi: 0.1,
    minimax: 0.5,
    hunyuan: 0.2,
  };
  const base = baseCosts[model];
  const durationMultiplier = duration / 5;
  const estimated = (base * durationMultiplier).toFixed(2);
  return `~$${estimated}`;
}

export function Generate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [model, setModel] = useState<VideoModelKey>("veo3");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [duration, setDuration] = useState([5]);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (id) {
      const loadedProject = getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        setPrompt(loadedProject.prompt);
        setStyle(loadedProject.settings.style);
        setAspectRatio(loadedProject.settings.aspectRatio);
        setDuration([loadedProject.settings.duration]);
      }
    }
    setHasApiKey(isApiKeyConfigured());
    setPromptHistory(getPromptHistory());
  }, [id]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasApiKey(true);
      setShowApiKeyInput(false);
      toast.success("API key saved successfully");
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    // Simulate a brief "thinking" delay for UX
    await new Promise((r) => setTimeout(r, 600));
    const enhanced = enhancePrompt(prompt, style, model);
    setPrompt(enhanced);
    setEnhancing(false);
    toast.success("Prompt enhanced!");
  };

  const handleGenerate = async () => {
    if (!project || !id) return;

    setStatus("generating");
    setProgress(0);
    setStatusMessage("Starting generation...");
    setErrorMessage("");
    setGeneratedVideoUrl(null);

    savePromptToHistory(prompt);
    setPromptHistory(getPromptHistory());

    updateProject(id, { status: "generating" });

    const modelConfig = VIDEO_MODELS[model];

    try {
      if (hasApiKey) {
        const result = await generateVideo({
          prompt: `${prompt}, ${style} style`,
          model,
          negativePrompt: negativePrompt || undefined,
          onProgress: (statusText) => {
            setStatusMessage(statusText);
            if (statusText.includes("queue")) setProgress(10);
            else if (statusText.includes("Generating")) setProgress(50);
          },
        });

        setProgress(100);
        setGeneratedVideoUrl(result.videoUrl);

        addVersion(id, prompt, {
          duration: duration[0],
          aspectRatio,
          style,
          model: modelConfig.name,
        }, result.videoUrl);
      } else {
        await simulateGeneration((prog, statusText) => {
          setProgress(prog);
          setStatusMessage(statusText);
        });

        addVersion(id, prompt, {
          duration: duration[0],
          aspectRatio,
          style,
          model: modelConfig.name,
        });
      }

      const updatedProject = getProject(id);
      if (updatedProject) setProject(updatedProject);

      setStatus("completed");
      toast.success("Video generated successfully!");
    } catch (error) {
      setStatus("error");
      const msg = error instanceof Error ? error.message : "Generation failed";
      setErrorMessage(msg);
      updateProject(id, { status: "draft" });
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setStatusMessage("");
    setErrorMessage("");
    setGeneratedVideoUrl(null);
  };

  if (!project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
            Project not found
          </h2>
          <p className="text-black/60 dark:text-white/60 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedCost = estimateCost(model, duration[0]);

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
        <Link to={`/project/${id}`} className="hover:text-black dark:hover:text-white transition-colors">
          {project.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black dark:text-white">Generate</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/project/${id}`)}
          className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Generate New Version
          </h1>
          <p className="text-black/60 dark:text-white/60 mt-1">
            Create a new version of "{project.title}"
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Video Prompt
              </Label>
              {promptHistory.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  History
                  {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Prompt history dropdown */}
            <AnimatePresence>
              {showHistory && promptHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden"
                >
                  <div className="p-2 border-b border-black/5 dark:border-white/5">
                    <p className="text-xs text-black/40 dark:text-white/40 px-1">Recent prompts</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {promptHistory.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrompt(p);
                          setShowHistory(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              disabled={status === "generating"}
              className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none"
              placeholder="Describe your video..."
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-black/10 dark:border-white/10 gap-1"
                disabled={status === "generating" || !prompt.trim() || enhancing}
                onClick={handleEnhancePrompt}
              >
                {enhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                {enhancing ? "Enhancing..." : "Enhance with AI"}
              </Button>
              <span className="text-xs text-black/30 dark:text-white/30">
                {prompt.length}/500 chars
              </span>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={status === "generating"}>
                <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={model} onValueChange={(v) => setModel(v as VideoModelKey)} disabled={status === "generating"}>
                <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIDEO_MODELS).map(([key, m]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{m.name}</span>
                        <span className="text-xs text-black/50 dark:text-white/50">{m.costPerVideo}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-black/50 dark:text-white/50">
                {VIDEO_MODELS[model].description}
              </p>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <Label>Aspect Ratio</Label>
            <div className="flex gap-2">
              {aspectRatioOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: status === "generating" ? 1 : 1.02 }}
                  whileTap={{ scale: status === "generating" ? 1 : 0.98 }}
                  onClick={() => status !== "generating" && setAspectRatio(option.value)}
                  disabled={status === "generating"}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-lg border transition-all duration-200 text-sm",
                    aspectRatio === option.value
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70",
                    status === "generating" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {option.value}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Duration</Label>
              <span className="text-sm text-black/60 dark:text-white/60">{duration[0]}s</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={3}
              max={15}
              step={1}
              disabled={status === "generating"}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
              <span>3s</span>
              <span>15s</span>
            </div>
          </div>

          {/* Cost estimate */}
          {hasApiKey && (
            <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
              <DollarSign className="w-4 h-4 text-black/40 dark:text-white/40" />
              <span className="text-sm text-black/60 dark:text-white/60">
                Estimated cost: <span className="font-medium text-black dark:text-white">{estimatedCost}</span>
              </span>
              <span className="ml-auto text-xs text-black/40 dark:text-white/40">via fal.ai</span>
            </div>
          )}

          {/* Advanced Options toggle */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <div className="space-y-2">
                    <Label className="text-sm">Negative Prompt</Label>
                    <Textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={2}
                      disabled={status === "generating"}
                      className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none text-sm"
                      placeholder="What to avoid in the video (blur, watermarks, etc.)"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* API Status */}
          {hasApiKey ? (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Your fal.ai API key is active
              </span>
              <Link to="/settings" className="ml-auto">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30 transition-colors">
                  Manage
                </span>
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Bring Your Own Key
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                    Add your fal.ai API key to generate real videos with AI
                  </p>
                  {showApiKeyInput ? (
                    <div className="mt-3 flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter fal.ai API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                        className="text-sm bg-white dark:bg-white/10"
                      />
                      <Button size="sm" onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500/30 text-purple-600 dark:text-purple-400"
                        onClick={() => setShowApiKeyInput(true)}
                      >
                        <Key className="w-3 h-3 mr-1" />
                        Add Key
                      </Button>
                      <Link to="/settings">
                        <Button variant="ghost" size="sm" className="text-purple-600/70 dark:text-purple-400/70">
                          Settings
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-purple-500/10">
                    <p className="text-xs text-purple-600/50 dark:text-purple-400/50">
                      Or try without an API key in demo mode
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-4">
            {status === "idle" && (
              <div className="space-y-3">
                {hasApiKey ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-6 text-lg gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Video
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Try Demo Generation
                    </Button>
                    <p className="text-center text-xs text-black/40 dark:text-white/40">
                      No API key required — simulates generation flow
                    </p>
                  </>
                )}
              </div>
            )}

            {status === "generating" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
                    <span className="font-medium text-black dark:text-white">
                      {statusMessage || "Generating video..."}
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-black/50 dark:text-white/50">
                      {VIDEO_MODELS[model].name} • {hasApiKey ? "fal.ai" : "Demo mode"}
                    </p>
                    <p className="text-xs text-black/50 dark:text-white/50">{progress}%</p>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Generation failed
                    </span>
                  </div>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-2">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full border-black/10 dark:border-white/10 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            )}

            {status === "completed" && (
              <div className="space-y-4">
                <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">
                      Video generated successfully!
                    </span>
                  </div>
                  <p className="text-xs text-green-600/60 dark:text-green-400/60 mt-1">
                    New version v{project.versions.length + 1} created
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 border-black/10 dark:border-white/10 gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate Another
                  </Button>
                  <Button
                    onClick={() => navigate(`/project/${id}`)}
                    className="flex-1 bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                  >
                    View Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="sticky top-8 space-y-4">
            <h3 className="font-semibold text-black dark:text-white">
              {status === "completed" ? "Generated Video" : "Current Version"}
            </h3>
            <VideoPlayer
              thumbnail={project.thumbnail}
              title={project.title}
              videoUrl={generatedVideoUrl || undefined}
            />

            {/* Version info */}
            {project.versions.length > 0 && status === "idle" && (
              <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/60 dark:text-white/60">
                    Current: <span className="font-medium text-black dark:text-white">v{project.versions.length}</span>
                  </span>
                  <span className="text-black/40 dark:text-white/40">→</span>
                  <span className="text-black/60 dark:text-white/60">
                    Will create: <span className="font-medium text-black dark:text-white">v{project.versions.length + 1}</span>
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-1">
                  <p className="text-xs text-black/40 dark:text-white/40">Last version prompt:</p>
                  <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2">
                    {project.versions[project.versions.length - 1]?.prompt}
                  </p>
                </div>
              </div>
            )}

            {/* Model info card */}
            <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 space-y-2">
              <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wider">
                Selected Model
              </p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-black dark:text-white">{VIDEO_MODELS[model].name}</p>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{VIDEO_MODELS[model].description}</p>
                </div>
                <span className="text-sm font-mono text-black/50 dark:text-white/50">{VIDEO_MODELS[model].costPerVideo}</span>
              </div>
              <div className="flex gap-3 text-xs text-black/50 dark:text-white/50 pt-1">
                <span>{duration[0]}s</span>
                <span>•</span>
                <span>{aspectRatio}</span>
                <span>•</span>
                <span>{style}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
