import { motion } from "motion/react";
import { useState } from "react";
import { Search, Filter, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ProjectCard } from "@/app/components/ProjectCard";
import { communityProjects, styleOptions } from "@/app/data/mockData";
import { cn } from "@/lib/utils";

type SortOption = "trending" | "newest" | "popular";

export function Explore() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [filterStyle, setFilterStyle] = useState<string>("all");

  const filteredProjects = communityProjects
    .filter((project) => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.prompt.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((project) => {
      if (filterStyle !== "all") {
        return project.settings.style === filterStyle;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return b.forks - a.forks;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const sortOptions = [
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "newest", label: "Newest", icon: Clock },
    { value: "popular", label: "Most Popular", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Explore
        </h1>
        <p className="text-black/60 dark:text-white/60 mt-1">
          Discover and fork amazing AI-generated videos from the community
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
          <Input
            placeholder="Search videos, prompts, creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
          />
        </div>

        {/* Style Filter */}
        <Select value={filterStyle} onValueChange={setFilterStyle}>
          <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Styles</SelectItem>
            {styleOptions.map((style) => (
              <SelectItem key={style} value={style}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <div className="flex rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as SortOption)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm transition-colors",
                sortBy === option.value
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-white dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <option.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Section */}
      {!search && filterStyle === "all" && sortBy === "trending" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Featured This Week
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.slice(0, 2).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl opacity-20 group-hover:opacity-40 blur transition-opacity" />
                  <div className="relative">
                    <ProjectCard project={project} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {search || filterStyle !== "all"
              ? `${filteredProjects.length} results`
              : "All Videos"}
          </h2>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"
          >
            <Search className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No videos found
            </h3>
            <p className="text-black/60 dark:text-white/60 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilterStyle("all");
              }}
              className="border-black/10 dark:border-white/10"
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
