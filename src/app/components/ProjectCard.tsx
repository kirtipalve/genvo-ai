import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Eye, GitFork, Clock, Globe, Lock, Loader2, Sparkles } from "lucide-react";
import { cn, formatRelativeTime, formatNumber } from "@/lib/utils";
import type { Project } from "@/app/data/mockData";

interface ProjectCardProps {
  project: Project;
  index?: number;
  listView?: boolean;
}

export function ProjectCard({ project, index = 0, listView = false }: ProjectCardProps) {
  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    generating: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    completed: "bg-green-500/20 text-green-600 dark:text-green-400",
    failed: "bg-red-500/20 text-red-600 dark:text-red-400",
  };

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link to={`/project/${project.id}`}>
          <motion.div
            whileHover={{ x: 4 }}
            className="group flex items-center gap-4 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4 transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md"
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {project.status === "generating" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-black dark:text-white truncate">{project.title}</h3>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0", statusColors[project.status])}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60 truncate">{project.description}</p>
            </div>

            {/* Meta */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-black/50 dark:text-white/50 flex-shrink-0">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {project.versions.length}v
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(project.views)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                {formatNumber(project.forks)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(project.updatedAt)}
              </span>
              <span>
                {project.isPublic ? (
                  <Globe className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-black/30 dark:text-white/30" />
                )}
              </span>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/project/${project.id}`}>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 hover:shadow-xl"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                  statusColors[project.status]
                )}
              >
                {project.status === "generating" && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>

            {/* Visibility badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-white backdrop-blur-sm">
                {project.isPublic ? (
                  <>
                    <Globe className="w-3 h-3" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    Private
                  </>
                )}
              </span>
            </div>

            {/* Version count badge */}
            {project.versions.length > 0 && (
              <div className="absolute bottom-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-white backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  {project.versions.length}v
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-black dark:text-white truncate">
              {project.title}
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1 line-clamp-2">
              {project.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-xs text-black/50 dark:text-white/50">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(project.views)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                {formatNumber(project.forks)}
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(project.updatedAt)}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
