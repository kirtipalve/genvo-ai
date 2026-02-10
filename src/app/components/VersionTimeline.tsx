// Simple version timeline - like git commits
import { motion } from "motion/react";
import { GitBranch } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Version, Branch } from "@/app/data/mockData";

interface VersionTimelineProps {
  versions: Version[];
  branches?: Branch[];
  selectedVersionId?: string;
  onSelectVersion: (version: Version) => void;
  onSelectBranch?: (branch: Branch) => void;
}

export function VersionTimeline({
  versions,
  branches = [],
  selectedVersionId,
  onSelectVersion,
  onSelectBranch,
}: VersionTimelineProps) {
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const otherBranches = branches.filter((b) => b.name !== "main");

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-black/50 dark:text-white/50">
        <p className="text-sm">No versions yet</p>
        <p className="text-xs mt-1">Generate your first video to start versioning</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-black/10 dark:bg-white/10" />

        <div className="space-y-1">
          {sortedVersions.map((version, index) => (
            <motion.button
              key={version.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectVersion(version)}
              className={cn(
                "relative w-full flex items-center gap-4 p-3 pl-10 rounded-lg text-left transition-all",
                selectedVersionId === version.id
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {/* Commit dot */}
              <div
                className={cn(
                  "absolute left-2.5 w-3 h-3 rounded-full border-2",
                  selectedVersionId === version.id
                    ? "bg-white dark:bg-black border-white dark:border-black"
                    : "bg-black dark:bg-white border-black dark:border-white"
                )}
              />

              {/* Thumbnail */}
              <img
                src={version.thumbnail}
                alt=""
                className="w-14 h-9 rounded object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">v{version.versionNumber}</span>
                  <span className="text-xs opacity-60">
                    {formatRelativeTime(version.createdAt)}
                  </span>
                </div>
                <p className="text-sm opacity-70 truncate mt-0.5">
                  {version.prompt.length > 50
                    ? version.prompt.slice(0, 50) + "..."
                    : version.prompt}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Branch indicators */}
      {otherBranches.length > 0 && (
        <div className="pt-4 border-t border-black/5 dark:border-white/5">
          <p className="text-xs text-black/50 dark:text-white/50 mb-3 flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            {otherBranches.length} experimental branch{otherBranches.length !== 1 ? "es" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {otherBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => onSelectBranch?.(branch)}
                className={cn(
                  "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors",
                  "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    branch.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                  )}
                />
                <span className="text-black/70 dark:text-white/70">{branch.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
