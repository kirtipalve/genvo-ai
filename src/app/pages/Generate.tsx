import { motion } from "motion/react";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Wand2,
  ChevronRight,
  Loader2,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { mockProjects, styleOptions, modelOptions, aspectRatioOptions } from "@/app/data/mockData";
import { cn } from "@/lib/utils";

type GenerationStatus = "idle" | "generating" | "completed";

export function Generate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];

  const [prompt, setPrompt] = useState(project.prompt);
  const [style, setStyle] = useState(project.settings.style);
  const [model, setModel] = useState("gen3");
  const [aspectRatio, setAspectRatio] = useState(project.settings.aspectRatio);
  const [duration, setDuration] = useState([project.settings.duration]);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setStatus("generating");
    setProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("completed");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
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
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Video Prompt
            </Label>
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
                className="text-xs border-black/10 dark:border-white/10"
                disabled={status === "generating"}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Enhance with AI
              </Button>
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
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={model} onValueChange={setModel} disabled={status === "generating"}>
                <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <span className="text-sm text-black/60 dark:text-white/60">
                {duration[0]}s
              </span>
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
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            {status === "idle" && (
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-6 text-lg gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Video
              </Button>
            )}

            {status === "generating" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
                    <span className="font-medium text-black dark:text-white">
                      Generating video...
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
                  <p className="text-sm text-black/50 dark:text-white/50 mt-3">
                    {progress < 30 && "Analyzing prompt..."}
                    {progress >= 30 && progress < 60 && "Generating frames..."}
                    {progress >= 60 && progress < 90 && "Rendering video..."}
                    {progress >= 90 && "Finalizing..."}
                  </p>
                </div>
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
          <div className="sticky top-8">
            <h3 className="font-semibold text-black dark:text-white mb-4">
              {status === "completed" ? "Generated Video" : "Current Version"}
            </h3>
            <VideoPlayer
              thumbnail={project.thumbnail}
              title={project.title}
            />

            {/* Version comparison hint */}
            {project.versions.length > 0 && status === "idle" && (
              <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Current version: <span className="font-medium">v{project.versions.length}</span>
                </p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                  Generating will create v{project.versions.length + 1}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
