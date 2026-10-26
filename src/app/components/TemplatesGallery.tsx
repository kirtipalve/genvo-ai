import { useState } from "react";
import { motion } from "motion/react";
import { X, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { promptTemplates } from "@/app/data/mockData";
import type { PromptTemplate } from "@/app/data/mockData";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Cinematic", "Product", "Nature", "Urban", "Abstract"] as const;

interface TemplatesGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: string, style: string) => void;
}

export function TemplatesGallery({ isOpen, onClose, onSelect }: TemplatesGalleryProps) {
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = promptTemplates.filter((t) => {
    const matchesCategory = category === "All" || t.category === category;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (t: PromptTemplate) => {
    onSelect(t.prompt, t.style);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl max-h-[80vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-semibold text-black dark:text-white">Prompt Templates</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search + Category filter */}
        <div className="px-6 py-3 border-b border-black/10 dark:border-white/10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 bg-black/5 dark:bg-white/5 border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  category === cat
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <p className="text-center text-black/40 dark:text-white/40 py-12">No templates match your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -2 }}
                  className="group border border-black/10 dark:border-white/10 rounded-xl overflow-hidden cursor-pointer bg-white dark:bg-white/5 hover:border-black/30 dark:hover:border-white/30 transition-all"
                  onClick={() => handleSelect(t)}
                >
                  <div className="relative">
                    <img
                      src={t.thumbnail}
                      alt={t.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                        Use Template
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                      {t.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-black dark:text-white">{t.title}</p>
                    <p className="text-xs text-black/50 dark:text-white/50 mt-1 line-clamp-2">{t.prompt}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-black/50 dark:text-white/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/10 dark:border-white/10 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
