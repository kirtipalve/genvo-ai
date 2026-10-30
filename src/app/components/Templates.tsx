// Project templates for quick starts
import { motion } from "motion/react";
import { useState } from "react";
import {
  Layout,
  Sparkles,
  Film,
  Camera,
  Palette,
  Music,
  Building2,
  Leaf,
  Gamepad2,
  ShoppingBag,
  Heart,
  Globe,
  Star,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import type { GenerationSettings } from "@/app/data/types";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  icon: typeof Layout;
  prompt: string;
  settings: GenerationSettings;
  tags: string[];
  usageCount: number;
  featured?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "cinematic-city",
    name: "Cinematic City",
    description: "Stunning urban flythrough with neon lights",
    thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=225&fit=crop",
    category: "Urban",
    icon: Building2,
    prompt: "A cinematic aerial flythrough of a futuristic city at night, neon lights reflecting on wet streets, flying cars, holographic billboards, 4K quality",
    settings: { duration: 5, aspectRatio: "16:9", style: "Cinematic", model: "Veo 3" },
    tags: ["cityscape", "neon", "futuristic"],
    usageCount: 12450,
    featured: true,
  },
  {
    id: "nature-timelapse",
    name: "Nature Timelapse",
    description: "Breathtaking natural scenery transitions",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=225&fit=crop",
    category: "Nature",
    icon: Leaf,
    prompt: "Timelapse of a beautiful sunrise over mountains, clouds moving across the sky, golden light spreading across the landscape, peaceful atmosphere",
    settings: { duration: 8, aspectRatio: "16:9", style: "Natural", model: "Veo 3" },
    tags: ["nature", "timelapse", "landscape"],
    usageCount: 8920,
    featured: true,
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Professional product rotation for e-commerce",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=225&fit=crop",
    category: "Commercial",
    icon: ShoppingBag,
    prompt: "Elegant 360-degree product rotation on a clean white background, soft studio lighting, professional product photography style",
    settings: { duration: 4, aspectRatio: "1:1", style: "Product", model: "Mochi v1" },
    tags: ["product", "commercial", "ecommerce"],
    usageCount: 15670,
    featured: true,
  },
  {
    id: "abstract-fluid",
    name: "Abstract Fluid",
    description: "Mesmerizing liquid motion graphics",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop",
    category: "Abstract",
    icon: Palette,
    prompt: "Abstract fluid dynamics with vibrant colors flowing and merging, iridescent bubbles, smooth organic motion, dreamlike atmosphere",
    settings: { duration: 6, aspectRatio: "1:1", style: "Abstract", model: "Mochi v1" },
    tags: ["abstract", "fluid", "colorful"],
    usageCount: 6340,
  },
  {
    id: "anime-scene",
    name: "Anime Scene",
    description: "Studio Ghibli inspired animation",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop",
    category: "Animation",
    icon: Film,
    prompt: "Anime style scene of a peaceful countryside, cherry blossoms falling, gentle wind, Studio Ghibli inspired, warm colors, nostalgic feeling",
    settings: { duration: 5, aspectRatio: "16:9", style: "Anime", model: "MiniMax Video" },
    tags: ["anime", "animation", "ghibli"],
    usageCount: 9870,
  },
  {
    id: "gaming-intro",
    name: "Gaming Intro",
    description: "Dynamic esports and gaming visuals",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop",
    category: "Gaming",
    icon: Gamepad2,
    prompt: "Dynamic gaming intro with glowing particles, epic motion graphics, dark atmosphere with neon accents, esports energy, fast-paced transitions",
    settings: { duration: 4, aspectRatio: "16:9", style: "Neon", model: "Veo 3" },
    tags: ["gaming", "esports", "intro"],
    usageCount: 11230,
  },
  {
    id: "wedding-romantic",
    name: "Wedding Romantic",
    description: "Soft romantic visuals for weddings",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=225&fit=crop",
    category: "Event",
    icon: Heart,
    prompt: "Romantic soft focus scene with flower petals floating, warm golden hour lighting, dreamy bokeh, gentle movement, wedding atmosphere",
    settings: { duration: 6, aspectRatio: "16:9", style: "Cinematic", model: "Hunyuan Video" },
    tags: ["wedding", "romantic", "soft"],
    usageCount: 4560,
  },
  {
    id: "music-visualizer",
    name: "Music Visualizer",
    description: "Audio-reactive visual patterns",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop",
    category: "Music",
    icon: Music,
    prompt: "Abstract music visualizer with geometric shapes pulsing to rhythm, vibrant colors, flowing energy waves, EDM concert atmosphere",
    settings: { duration: 8, aspectRatio: "16:9", style: "Abstract", model: "Mochi v1" },
    tags: ["music", "visualizer", "abstract"],
    usageCount: 7890,
  },
  {
    id: "travel-vlog",
    name: "Travel Vlog",
    description: "Dynamic travel montage style",
    thumbnail: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=225&fit=crop",
    category: "Travel",
    icon: Globe,
    prompt: "Cinematic travel montage with quick cuts, aerial drone shots, vibrant destinations, adventure vibes, golden hour lighting, wanderlust aesthetic",
    settings: { duration: 5, aspectRatio: "9:16", style: "Cinematic", model: "Veo 3" },
    tags: ["travel", "vlog", "adventure"],
    usageCount: 8340,
  },
  {
    id: "portrait-headshot",
    name: "Portrait Headshot",
    description: "Professional AI portrait generation",
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=225&fit=crop",
    category: "Portrait",
    icon: Camera,
    prompt: "Professional headshot portrait, soft studio lighting, clean background, natural expression, high-end photography style, sharp details",
    settings: { duration: 3, aspectRatio: "9:16", style: "Product", model: "MiniMax Video" },
    tags: ["portrait", "headshot", "professional"],
    usageCount: 5670,
  },
];

const CATEGORIES = [
  { id: "all", name: "All Templates", icon: Layout },
  { id: "featured", name: "Featured", icon: Star },
  { id: "Urban", name: "Urban", icon: Building2 },
  { id: "Nature", name: "Nature", icon: Leaf },
  { id: "Commercial", name: "Commercial", icon: ShoppingBag },
  { id: "Abstract", name: "Abstract", icon: Palette },
  { id: "Animation", name: "Animation", icon: Film },
];

interface TemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function Templates({ onSelectTemplate }: TemplatesProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      category === "all" ||
      (category === "featured" && template.featured) ||
      template.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              category === cat.id
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onSelect={() => onSelectTemplate(template)}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
          <p className="text-black/60 dark:text-white/60">
            No templates found matching your search
          </p>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  index,
  onSelect,
}: {
  template: Template;
  index: number;
  onSelect: () => void;
}) {
  const Icon = template.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className="group relative bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden text-left hover:border-black/20 dark:hover:border-white/20 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Featured badge */}
        {template.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-black text-xs gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          </div>
        )}

        {/* Category */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {template.category}
        </div>

        {/* Usage count */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-xs">
          <Users className="w-3 h-3" />
          {(template.usageCount / 1000).toFixed(1)}k uses
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-black dark:text-white mb-1">
          {template.name}
        </h3>
        <p className="text-sm text-black/60 dark:text-white/60 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium flex items-center gap-2">
          Use Template
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </motion.button>
  );
}

// Template preview dialog
export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onUse,
}: {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: () => void;
}) {
  if (!template) return null;

  const Icon = template.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <p className="text-black/70 dark:text-white/70">
            {template.description}
          </p>

          {/* Prompt preview */}
          <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
            <p className="text-xs text-black/50 dark:text-white/50 mb-1">
              Prompt
            </p>
            <p className="text-sm text-black/80 dark:text-white/80">
              {template.prompt}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center">
              <p className="text-xs text-black/50 dark:text-white/50">Duration</p>
              <p className="font-medium text-black dark:text-white">
                {template.settings.duration}s
              </p>
            </div>
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center">
              <p className="text-xs text-black/50 dark:text-white/50">Ratio</p>
              <p className="font-medium text-black dark:text-white">
                {template.settings.aspectRatio}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center">
              <p className="text-xs text-black/50 dark:text-white/50">Style</p>
              <p className="font-medium text-black dark:text-white">
                {template.settings.style}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-center">
              <p className="text-xs text-black/50 dark:text-white/50">Model</p>
              <p className="font-medium text-black dark:text-white">
                {template.settings.model}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action */}
          <Button
            onClick={onUse}
            className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TEMPLATES };
export type { Template };
