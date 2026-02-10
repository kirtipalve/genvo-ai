// Global search with command palette functionality
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Video,
  GitBranch,
  Folder,
  Clock,
  ArrowRight,
  Command,
  Plus,
  Sparkles,
  Settings,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { searchProjects } from "@/app/data/collaborationService";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  type: "project" | "version" | "branch" | "action";
  id: string;
  projectId?: string;
  title: string;
  description: string;
  thumbnail?: string;
  icon?: typeof Video;
  action?: () => void;
}

const QUICK_ACTIONS: SearchResult[] = [
  {
    type: "action",
    id: "new-project",
    title: "Create New Project",
    description: "Start a new AI video project",
    icon: Plus,
  },
  {
    type: "action",
    id: "generate",
    title: "Quick Generate",
    description: "Generate a video with AI",
    icon: Sparkles,
  },
  {
    type: "action",
    id: "explore",
    title: "Explore Community",
    description: "Discover public projects",
    icon: Search,
  },
  {
    type: "action",
    id: "settings",
    title: "Settings",
    description: "Manage your account and preferences",
    icon: Settings,
  },
  {
    type: "action",
    id: "team",
    title: "Manage Team",
    description: "Invite collaborators",
    icon: Users,
  },
  {
    type: "action",
    id: "help",
    title: "Help & Docs",
    description: "Get help and view documentation",
    icon: HelpCircle,
  },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem("genvo_recent_searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = searchProjects(query);
    const formattedResults: SearchResult[] = searchResults.map((r) => ({
      type: r.type as "project" | "version" | "branch",
      id: r.id,
      projectId: r.projectId,
      title: r.title,
      description: r.description,
      thumbnail: r.thumbnail,
    }));

    // Add matching quick actions
    const matchingActions = QUICK_ACTIONS.filter(
      (a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase())
    );

    setResults([...formattedResults, ...matchingActions]);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const displayResults = query ? results : QUICK_ACTIONS;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) =>
            i < displayResults.length - 1 ? i + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) =>
            i > 0 ? i - 1 : displayResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          const selected = displayResults[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    },
    [query, results, selectedIndex, onOpenChange]
  );

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem("genvo_recent_searches", JSON.stringify(updated));
    }

    onOpenChange(false);

    // Handle navigation
    switch (result.type) {
      case "project":
        navigate(`/project/${result.id}`);
        break;
      case "version":
        navigate(`/project/${result.projectId}`);
        break;
      case "branch":
        navigate(`/project/${result.projectId}/branches`);
        break;
      case "action":
        handleAction(result.id);
        break;
    }
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "new-project":
        navigate("/new");
        break;
      case "generate":
        navigate("/new");
        break;
      case "explore":
        navigate("/explore");
        break;
      case "settings":
        // Could open settings modal
        break;
      case "team":
        // Could open team modal
        break;
      case "help":
        window.open("https://github.com/genvo-ai/docs", "_blank");
        break;
    }
  };

  const displayResults = query.trim() ? results : QUICK_ACTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-black/5 dark:border-white/5">
          <Search className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, versions, or type a command..."
            className="border-0 p-0 h-auto text-base focus-visible:ring-0 bg-transparent"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-1.5 font-mono text-xs text-black/50 dark:text-white/50">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-b border-black/5 dark:border-white/5">
              <div className="px-2 py-1 text-xs font-medium text-black/40 dark:text-white/40">
                Recent Searches
              </div>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(search)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Quick actions or search results */}
          <div className="p-2">
            {!query && (
              <div className="px-2 py-1 text-xs font-medium text-black/40 dark:text-white/40">
                Quick Actions
              </div>
            )}

            {displayResults.length === 0 && query && (
              <div className="px-2 py-8 text-center text-black/50 dark:text-white/50">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {displayResults.map((result, index) => (
                <motion.button
                  key={`${result.type}-${result.id}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-black/5 dark:bg-white/5"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {/* Icon or thumbnail */}
                  {result.thumbnail ? (
                    <img
                      src={result.thumbnail}
                      alt=""
                      className="w-10 h-6 rounded object-cover"
                    />
                  ) : result.icon ? (
                    <div className="w-10 h-6 rounded bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      <result.icon className="w-4 h-4 text-black/40 dark:text-white/40" />
                    </div>
                  ) : (
                    <div className="w-10 h-6 rounded bg-black/5 dark:bg-white/5 flex items-center justify-center">
                      {result.type === "project" && (
                        <Video className="w-4 h-4 text-black/40 dark:text-white/40" />
                      )}
                      {result.type === "version" && (
                        <Folder className="w-4 h-4 text-black/40 dark:text-white/40" />
                      )}
                      {result.type === "branch" && (
                        <GitBranch className="w-4 h-4 text-black/40 dark:text-white/40" />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-black dark:text-white truncate">
                        {result.title}
                      </span>
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-xs text-black/50 dark:text-white/50 truncate">
                      {result.description}
                    </p>
                  </div>

                  {/* Action indicator */}
                  {selectedIndex === index && (
                    <ArrowRight className="w-4 h-4 text-black/30 dark:text-white/30" />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-black/40 dark:text-white/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5">↵</kbd>
              select
            </span>
          </div>
          <span>
            <Command className="w-3 h-3 inline mr-0.5" />K to open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for global keyboard shortcut
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}

// Search trigger button
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm text-black/60 dark:text-white/60"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex ml-2 h-5 items-center gap-0.5 rounded border border-black/10 dark:border-white/10 px-1.5 font-mono text-xs">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  );
}
