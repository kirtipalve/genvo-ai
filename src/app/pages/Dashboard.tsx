import { motion } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  Video,
  Clock,
  GitBranch,
  Sparkles,
  Search,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ProjectCard } from "@/app/components/ProjectCard";
import { DemoTip } from "@/app/components/DemoHint";
import { getProjects, getBranches } from "@/app/data/dataService";
import type { Project } from "@/app/data/mockData";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "completed" | "draft" | "generating";
type SortKey = "updated" | "created" | "views" | "name";
type SortDir = "desc" | "asc";
type ViewMode = "grid" | "list";

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [totalBranches, setTotalBranches] = useState(0);

  useEffect(() => {
    setProjects(getProjects());
    setTotalBranches(getBranches().length);
    const seen = localStorage.getItem("genvo-welcome-seen");
    if (seen) setShowWelcome(false);
  }, []);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("genvo-welcome-seen", "true");
  };

  const stats = useMemo(() => ({
    total: projects.length,
    versions: projects.reduce((acc, p) => acc + p.versions.length, 0),
    branches: totalBranches,
    views: projects.reduce((acc, p) => acc + p.views, 0),
  }), [projects, totalBranches]);

  const statusCounts = useMemo(() => ({
    all: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    draft: projects.filter((p) => p.status === "draft").length,
    generating: projects.filter((p) => p.status === "generating").length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "updated":
          cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case "created":
          cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "views":
          cmp = b.views - a.views;
          break;
        case "name":
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === "asc" ? -cmp : cmp;
    });

    return result;
  }, [projects, search, statusFilter, sortKey, sortDir]);

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "completed", label: "Completed" },
    { key: "draft", label: "Draft" },
    { key: "generating", label: "Generating" },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "updated", label: "Last Updated" },
    { key: "created", label: "Date Created" },
    { key: "views", label: "Most Viewed" },
    { key: "name", label: "Name" },
  ];

  return (
    <div className="min-h-screen p-8">
      {showWelcome && projects.length > 0 && (
        <DemoTip
          action={{
            label: "Try it now",
            onClick: () => {
              handleDismissWelcome();
              navigate("/project/1");
            },
          }}
        >
          <strong>Welcome to Genvo!</strong> Click on a project to see version history,
          create branches, and collaborate. Try the <strong>Cyberpunk City</strong> project
          to explore branching and versioning.
        </DemoTip>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-black/60 dark:text-white/60 mt-1">
          Manage your AI video projects
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: Video, label: "Projects", value: stats.total, color: "text-black dark:text-white", bg: "bg-black/5 dark:bg-white/10" },
          { icon: Sparkles, label: "Versions", value: stats.versions, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
          { icon: GitBranch, label: "Branches", value: stats.branches, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
          { icon: TrendingUp, label: "Total Views", value: stats.views.toLocaleString(), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-sm text-black/60 dark:text-white/60">{stat.label}</p>
                <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-6"
      >
        {/* Title + New Project button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Your Projects
          </h2>
          <Link to="/new">
            <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Search + Sort + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <Input
              placeholder="Search projects, prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="border-black/10 dark:border-white/10"
              title={sortDir === "asc" ? "Sort Descending" : "Sort Ascending"}
            >
              {sortDir === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>

            {/* View mode */}
            <div className="flex rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-white dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-white dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg w-fit">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                statusFilter === tab.key
                  ? "bg-white dark:bg-white/10 text-black dark:text-white shadow-sm"
                  : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              )}
            >
              {tab.label}
              {tab.key !== "all" && statusCounts[tab.key] > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                  {statusCounts[tab.key]}
                </span>
              )}
              {tab.key === "all" && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                  {statusCounts.all}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Projects */}
      {filteredProjects.length > 0 ? (
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-3"
        )}>
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} listView={viewMode === "list"} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"
        >
          {search || statusFilter !== "all" ? (
            <>
              <Search className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-black/60 dark:text-white/60 mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="border-black/10 dark:border-white/10"
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <Video className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                No projects yet
              </h3>
              <p className="text-black/60 dark:text-white/60 mb-6">
                Create your first AI video project to get started
              </p>
              <Link to="/new">
                <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
