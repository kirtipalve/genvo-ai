// Activity feed for project history
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  GitBranch,
  GitMerge,
  MessageSquare,
  UserPlus,
  Sparkles,
  Globe,
  Settings,
  GitFork,
  Play,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  getActivitiesByProject,
  initializeCollaborationData,
} from "@/app/data/collaborationService";
import type { Activity as ActivityType, ActivityType as ActivityTypeEnum } from "@/app/data/types";
import { cn, formatRelativeTime } from "@/lib/utils";

interface ActivityFeedProps {
  projectId: string;
  limit?: number;
  compact?: boolean;
}

const ACTIVITY_CONFIG: Record<
  ActivityTypeEnum,
  {
    icon: typeof Activity;
    label: string;
    color: string;
    getMessage: (metadata: Record<string, unknown>) => string;
  }
> = {
  project_created: {
    icon: Sparkles,
    label: "Project created",
    color: "text-purple-500",
    getMessage: (m) => `created project "${m.title || "Untitled"}"`,
  },
  version_generated: {
    icon: Play,
    label: "Version generated",
    color: "text-green-500",
    getMessage: (m) => `generated version ${m.versionNumber || ""}`,
  },
  branch_created: {
    icon: GitBranch,
    label: "Branch created",
    color: "text-blue-500",
    getMessage: (m) => `created branch "${m.branchName || ""}"`,
  },
  branch_merged: {
    icon: GitMerge,
    label: "Branch merged",
    color: "text-orange-500",
    getMessage: () => `merged branches`,
  },
  comment_added: {
    icon: MessageSquare,
    label: "Comment added",
    color: "text-cyan-500",
    getMessage: (m) => `commented: "${(m.content as string)?.slice(0, 50) || ""}..."`,
  },
  collaborator_added: {
    icon: UserPlus,
    label: "Collaborator added",
    color: "text-pink-500",
    getMessage: (m) => `added ${m.collaborator || "a collaborator"}`,
  },
  project_forked: {
    icon: GitFork,
    label: "Project forked",
    color: "text-indigo-500",
    getMessage: () => `forked this project`,
  },
  project_published: {
    icon: Globe,
    label: "Project published",
    color: "text-emerald-500",
    getMessage: () => `made the project public`,
  },
  settings_changed: {
    icon: Settings,
    label: "Settings changed",
    color: "text-gray-500",
    getMessage: () => `updated project settings`,
  },
};

export function ActivityFeed({
  projectId,
  limit = 20,
  compact = false,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [filter, setFilter] = useState<Set<ActivityTypeEnum>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Initialize mock data if needed
    initializeCollaborationData(projectId);
    loadActivities();
  }, [projectId]);

  const loadActivities = () => {
    const loaded = getActivitiesByProject(projectId, limit);
    setActivities(loaded);
    setLoaded(true);
  };

  const filteredActivities =
    filter.size === 0
      ? activities
      : activities.filter((a) => filter.has(a.type));

  // Group activities by date
  const groupedActivities = groupByDate(filteredActivities);

  if (compact) {
    return (
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, index) => (
          <ActivityItemCompact key={activity.id} activity={activity} index={index} />
        ))}
        {activities.length > 5 && (
          <div className="text-xs text-black/50 dark:text-white/50 text-center">
            +{activities.length - 5} more activities
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Activity
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-black/60 dark:text-white/60"
            >
              <Filter className="w-3 h-3" />
              Filter
              {filter.size > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black dark:bg-white text-white dark:text-black">
                  {filter.size}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(ACTIVITY_CONFIG).map(([type, config]) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filter.has(type as ActivityTypeEnum)}
                onCheckedChange={(checked) => {
                  setFilter((prev) => {
                    const next = new Set(prev);
                    if (checked) {
                      next.add(type as ActivityTypeEnum);
                    } else {
                      next.delete(type as ActivityTypeEnum);
                    }
                    return next;
                  });
                }}
              >
                <config.icon className={cn("w-4 h-4 mr-2", config.color)} />
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Activity list */}
      {!loaded ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-black/50 dark:text-white/50">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-3">
                {date}
              </div>
              <div className="space-y-3">
                {dateActivities.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityItem({
  activity,
  index,
}: {
  activity: ActivityType;
  index: number;
}) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-start gap-3 group"
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5",
          config.color
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={activity.actor.avatar} />
            <AvatarFallback>{activity.actor.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm">
            <span className="font-medium text-black dark:text-white">
              {activity.actor.name}
            </span>{" "}
            <span className="text-black/60 dark:text-white/60">
              {config.getMessage(activity.metadata)}
            </span>
          </span>
        </div>
        <span className="text-xs text-black/40 dark:text-white/40 mt-0.5 block">
          {formatRelativeTime(activity.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}

function ActivityItemCompact({
  activity,
  index,
}: {
  activity: ActivityType;
  index: number;
}) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center gap-2 text-sm"
    >
      <Icon className={cn("w-3 h-3 flex-shrink-0", config.color)} />
      <span className="text-black/60 dark:text-white/60 truncate">
        <span className="font-medium text-black dark:text-white">
          {activity.actor.name}
        </span>{" "}
        {config.getMessage(activity.metadata).slice(0, 30)}
      </span>
      <span className="text-xs text-black/40 dark:text-white/40 flex-shrink-0 ml-auto">
        {formatRelativeTime(activity.createdAt)}
      </span>
    </motion.div>
  );
}

function groupByDate(
  activities: ActivityType[]
): Record<string, ActivityType[]> {
  const groups: Record<string, ActivityType[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const activity of activities) {
    const date = new Date(activity.createdAt);
    date.setHours(0, 0, 0, 0);

    let label: string;
    if (date.getTime() === today.getTime()) {
      label = "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(activity);
  }

  return groups;
}

// Inline activity indicator for project cards
export function ActivityIndicator({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    const activities = getActivitiesByProject(projectId, 10);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = activities.filter(
      (a) => new Date(a.createdAt).getTime() > oneDayAgo
    );
    setRecentCount(recent.length);
  }, [projectId]);

  if (recentCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs text-green-600 dark:text-green-400",
        className
      )}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {recentCount} recent
    </div>
  );
}
