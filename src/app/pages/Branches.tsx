import { motion } from "motion/react";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  GitBranch,
  GitMerge,
  Plus,
  ChevronRight,
  Clock,
  User,
  MoreHorizontal,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { mockProjects, mockBranches } from "@/app/data/mockData";
import { cn, formatRelativeTime } from "@/lib/utils";

export function Branches() {
  const { id } = useParams();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];
  const branches = mockBranches.filter((b) => b.projectId === id);
  const [newBranchName, setNewBranchName] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const mainBranch = branches.find((b) => b.name === "main");
  const otherBranches = branches.filter((b) => b.name !== "main");

  const toggleBranchSelection = (branchId: string) => {
    if (selectedBranches.includes(branchId)) {
      setSelectedBranches(selectedBranches.filter((id) => id !== branchId));
    } else if (selectedBranches.length < 2) {
      setSelectedBranches([...selectedBranches, branchId]);
    }
  };

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    generating: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    completed: "bg-green-500/20 text-green-600 dark:text-green-400",
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
        <span className="text-black dark:text-white">Branches</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
            <GitBranch className="w-8 h-8" />
            Branches
          </h1>
          <p className="text-black/60 dark:text-white/60 mt-1">
            {branches.length} branches in {project.title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedBranches.length === 2 && (
            <Link to={`/project/${id}/compare?a=${selectedBranches[0]}&b=${selectedBranches[1]}`}>
              <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Compare Selected
              </Button>
            </Link>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-black/10 dark:border-white/10 gap-2">
                <Plus className="w-4 h-4" />
                New Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Branch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input
                    placeholder="my-new-branch"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Version</Label>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Branching from: v{project.versions.length} (latest)
                  </p>
                </div>
                <Button className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black">
                  Create Branch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Selection hint */}
      {selectedBranches.length > 0 && selectedBranches.length < 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-600 dark:text-blue-400"
        >
          Select one more branch to compare
        </motion.div>
      )}

      {/* Main Branch */}
      {mainBranch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-sm font-medium text-black/50 dark:text-white/50 mb-3">
            Default Branch
          </h2>
          <BranchCard
            branch={mainBranch}
            projectId={id!}
            isMain
            isSelected={selectedBranches.includes(mainBranch.id)}
            onSelect={() => toggleBranchSelection(mainBranch.id)}
            statusColors={statusColors}
          />
        </motion.div>
      )}

      {/* Other Branches */}
      {otherBranches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-medium text-black/50 dark:text-white/50 mb-3">
            Other Branches ({otherBranches.length})
          </h2>
          <div className="space-y-3">
            {otherBranches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                projectId={id!}
                isSelected={selectedBranches.includes(branch.id)}
                onSelect={() => toggleBranchSelection(branch.id)}
                statusColors={statusColors}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {branches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"
        >
          <GitBranch className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            No branches yet
          </h3>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Create a branch to explore different creative directions
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface BranchCardProps {
  branch: (typeof mockBranches)[0];
  projectId: string;
  isMain?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  statusColors: Record<string, string>;
  index?: number;
}

function BranchCard({
  branch,
  projectId,
  isMain,
  isSelected,
  onSelect,
  statusColors,
  index = 0,
}: BranchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={cn(
        "group relative bg-white dark:bg-white/5 rounded-xl border p-4 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
          : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        {branch.thumbnail && (
          <div className="w-24 h-14 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 flex-shrink-0">
            <img
              src={branch.thumbnail}
              alt={branch.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-black/40 dark:text-white/40" />
            <span className="font-semibold text-black dark:text-white">
              {branch.name}
            </span>
            {isMain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
                default
              </span>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[branch.status])}>
              {branch.status}
            </span>
          </div>

          <p className="text-sm text-black/60 dark:text-white/60 line-clamp-1 mb-2">
            {branch.prompt}
          </p>

          <div className="flex items-center gap-4 text-xs text-black/50 dark:text-white/50">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {branch.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(branch.updatedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!isMain && branch.status === "completed" && (
            <Link to={`/project/${projectId}/merge?branch=${branch.id}`}>
              <Button variant="outline" size="sm" className="border-black/10 dark:border-white/10 gap-1">
                <GitMerge className="w-3 h-3" />
                Merge
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Prompt</DropdownMenuItem>
              <DropdownMenuItem>Regenerate</DropdownMenuItem>
              {!isMain && (
                <DropdownMenuItem className="text-red-600">Delete Branch</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white dark:text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
