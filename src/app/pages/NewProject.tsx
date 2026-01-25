import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Wand2, Image, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
import { styleOptions, modelOptions, aspectRatioOptions } from "@/app/data/mockData";
import { createProject } from "@/app/data/dataService";
import { cn } from "@/lib/utils";

const promptSuggestions = [
  "A serene mountain lake at sunrise with mist rising from the water",
  "Futuristic city street with flying cars and neon holographic signs",
  "Underwater scene with colorful coral reef and tropical fish",
  "Cozy coffee shop interior with rain on the windows",
  "Abstract flowing liquid metal with iridescent reflections",
];

export function NewProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [model, setModel] = useState("gen3");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState([5]);

  const handleCreate = () => {
    const modelName = modelOptions.find((m) => m.id === model)?.name || "Gen-3 Alpha";

    const newProject = createProject(title, prompt, {
      duration: duration[0],
      aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
      style,
      model: modelName,
    });

    // Navigate to the generate page for the new project
    navigate(`/project/${newProject.id}/generate`);
  };

  const handleSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">
          New Project
        </h1>
        <p className="text-black/60 dark:text-white/60 mt-1">
          Create a new AI-generated video
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-8"
      >
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            placeholder="My awesome video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
          />
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Video Prompt
          </Label>
          <Textarea
            id="prompt"
            placeholder="Describe the video you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none"
          />

          {/* Suggestions */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              Try a suggestion:
            </p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 transition-colors truncate max-w-[200px]"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Style */}
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={style} onValueChange={setStyle}>
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

          {/* Model */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span>{m.name}</span>
                    <span className="text-black/50 dark:text-white/50 ml-2 text-xs">
                      ({m.description})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <Label>Aspect Ratio</Label>
          <div className="flex gap-3">
            {aspectRatioOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAspectRatio(option.value)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2",
                  aspectRatio === option.value
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:border-black/30 dark:hover:border-white/30"
                )}
              >
                <div
                  className={cn(
                    "border-2 rounded",
                    aspectRatio === option.value
                      ? "border-white dark:border-black"
                      : "border-current",
                    option.value === "16:9" && "w-8 h-4.5",
                    option.value === "9:16" && "w-4.5 h-8",
                    option.value === "1:1" && "w-6 h-6"
                  )}
                  style={{
                    width: option.value === "16:9" ? 32 : option.value === "9:16" ? 18 : 24,
                    height: option.value === "16:9" ? 18 : option.value === "9:16" ? 32 : 24,
                  }}
                />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Duration</Label>
            <span className="text-sm text-black/60 dark:text-white/60">
              {duration[0]} seconds
            </span>
          </div>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={3}
            max={15}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
            <span>3s</span>
            <span>15s</span>
          </div>
        </div>

        {/* Reference Image (Optional) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Reference Image (Optional)
          </Label>
          <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl p-8 text-center hover:border-black/20 dark:hover:border-white/20 transition-colors cursor-pointer">
            <Image className="w-8 h-8 mx-auto text-black/30 dark:text-white/30 mb-2" />
            <p className="text-sm text-black/60 dark:text-white/60">
              Drag & drop an image or click to browse
            </p>
            <p className="text-xs text-black/40 dark:text-white/40 mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleCreate}
            disabled={!prompt.trim()}
            className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-6 text-lg gap-2"
          >
            Create Project
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
