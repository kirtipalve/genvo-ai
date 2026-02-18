import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  GitBranch,
  GitFork,
  Clock,
  Eye,
  Globe,
  Lock,
  Download,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Trash2,
  Share2,
  Check,
  MessageSquare,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { VersionTimeline } from "@/app/components/VersionTimeline";
import { Feedback } from "@/app/components/Feedback";
import { DemoTip } from "@/app/components/DemoHint";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  getProject,
  updateProject,
  deleteProject,
  getBranchesByProject,
  createProject,
} from "@/app/data/dataService";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Project, Version, Branch } from "@/app/data/mockData";
import { toast } from "sonner";

export function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDemoTip, setShowDemoTip] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  useEffect(() => {
    if (id) {
      const loadedProject = getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        setSelectedVersion(loadedProject.versions[loadedProject.versions.length - 1] || null);
        setBranches(getBranchesByProject(id));
        setTitleDraft(loadedProject.title);
        setDescriptionDraft(loadedProject.description);
      }
    }
    const dismissed = localStorage.getItem("genvo-project-tip-seen");
    if (dismissed) setShowDemoTip(false);
  }, [id]);

  const dismissTip = () => {
    setShowDemoTip(false);
    localStorage.setItem("genvo-project-tip-seen", "true");
  };

  const handleToggleVisibility = () => {
    if (!project || !id) return;
    const updated = updateProject(id, { isPublic: !project.isPublic });
    if (updated) {
      setProject(updated);
      toast.success(updated.isPublic ? "Project is now public" : "Project is now private");
    }
  };

  const handleSaveTitle = () => {
    if (!project || !id || !titleDraft.trim()) return;
    const updated = updateProject(id, { title: titleDraft.trim() });
    if (updated) {
      setProject(updated);
      toast.success("Title updated");
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (!project || !id) return;
    const updated = updateProject(id, { description: descriptionDraft });
    if (updated) {
      setProject(updated);
      toast.success("Description updated");
    }
    setEditingDescription(false);
  };

  const handleDelete = () => {
    if (!id) return;
    deleteProject(id);
    toast.success("Project deleted");
    navigate("/dashboard");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const videoUrl = selectedVersion?.videoUrl || project?.thumbnail;
    if (!videoUrl || videoUrl.includes("placeholder")) {
      toast.error("No video available to download (demo mode)");
      return;
    }
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${project?.title || "video"}-v${selectedVersion?.versionNumber || 1}.mp4`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Download started");
  };

  const handleFork = () => {
    if (!project) return;
    const forked = createProject(
      `${project.title} (Fork)`,
      project.prompt,
      project.settings
    );
    toast.success("Project forked! Opening it now...");
    setTimeout(() => navigate(`/project/${forked.id}`), 800);
  };

  if (!project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
          <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
            Project not found
          </h2>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const collaborators = [
    { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user" },
    { name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" },
    { name: "John", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john" },
  ];

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
        <span className="text-black dark:text-white">{project.title}</span>
      </motion.div>

      {/* Demo tip */}
      {showDemoTip && branches.length > 1 && (
        <DemoTip
          action={{
            label: "View Branches",
            onClick: () => {
              dismissTip();
              navigate(`/project/${id}/branches`);
            },
          }}
        >
          This project has <strong>{branches.length} branches</strong> — different creative
          directions. Click on versions in the timeline to compare.
        </DemoTip>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div className="flex-1 min-w-0 mr-4">
          {/* Editable Title */}
          <div className="flex items-center gap-2 mb-2">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(project.title); }
                  }}
                  className="text-2xl font-bold bg-white dark:bg-white/10 border-black/10 dark:border-white/10 h-auto py-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveTitle} className="flex-shrink-0">
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingTitle(false); setTitleDraft(project.title); }}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-black dark:text-white truncate">
                  {project.title}
                </h1>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors flex-shrink-0"
                  title="Edit title"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={handleToggleVisibility}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0",
                project.isPublic
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                  : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              {project.isPublic ? (
                <><Globe className="w-3 h-3" />Public</>
              ) : (
                <><Lock className="w-3 h-3" />Private</>
              )}
            </button>
          </div>

          {/* Editable Description */}
          <div className="group relative mb-3">
            {editingDescription ? (
              <div className="flex items-start gap-2">
                <Input
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveDescription();
                    if (e.key === "Escape") { setEditingDescription(false); setDescriptionDraft(project.description); }
                  }}
                  className="bg-white dark:bg-white/10 border-black/10 dark:border-white/10"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveDescription}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingDescription(false); setDescriptionDraft(project.description); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setEditingDescription(true)}
              >
                <p className="text-black/60 dark:text-white/60 text-sm hover:text-black/80 dark:hover:text-white/80 transition-colors">
                  {project.description || "Add a description..."}
                </p>
                <Pencil className="w-3 h-3 text-black/20 dark:text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-black/50 dark:text-white/50">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.views} views
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {project.forks} forks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(project.updatedAt)}
            </span>
          </div>

          {/* Team avatars */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex -space-x-2">
              {collaborators.map((c, i) => (
                <Avatar key={i} className="w-7 h-7 border-2 border-white dark:border-zinc-900">
                  <AvatarImage src={c.avatar} />
                  <AvatarFallback>{c.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              <button className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border-2 border-white dark:border-zinc-900">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-black/50 dark:text-white/50">
              {collaborators.length} collaborators
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2 border-black/10 dark:border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="border-black/10 dark:border-white/10"
            title="Download video"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            onClick={() => setShowDeleteDialog(true)}
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Link to={`/project/${id}/generate`}>
            <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
              <Sparkles className="w-4 h-4" />
              New Version
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Content - 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video + Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Video Player */}
          <VideoPlayer
            thumbnail={selectedVersion?.thumbnail || project.thumbnail}
            videoUrl={selectedVersion?.videoUrl}
            title={project.title}
          />

          {/* Current version info */}
          {selectedVersion && (
            <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Version {selectedVersion.versionNumber}
                </h3>
                <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full">
                  <span>{selectedVersion.settings.model}</span>
                  <span>•</span>
                  <span>{selectedVersion.settings.duration}s</span>
                  <span>•</span>
                  <span>{selectedVersion.settings.aspectRatio}</span>
                  <span>•</span>
                  <span>{selectedVersion.settings.style}</span>
                </div>
              </div>
              <p className="text-black/70 dark:text-white/70 leading-relaxed text-sm">
                {selectedVersion.prompt}
              </p>
              <p className="text-xs text-black/40 dark:text-white/40 mt-3">
                Generated {formatRelativeTime(selectedVersion.createdAt)}
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link to={`/project/${id}/branches`} className="flex-1">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-black/10 dark:border-white/10 h-12"
              >
                <GitBranch className="w-4 h-4" />
                Branches
                <span className="ml-1 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-xs">
                  {branches.length}
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleFork}
              className="flex-1 justify-center gap-2 border-black/10 dark:border-white/10 h-12"
            >
              <GitFork className="w-4 h-4" />
              Fork Project
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFeedback(!showFeedback)}
              className={cn(
                "flex-1 justify-center gap-2 border-black/10 dark:border-white/10 h-12",
                showFeedback && "bg-black/5 dark:bg-white/5"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Feedback
            </Button>
          </div>

          {/* Feedback section */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5"
            >
              <h3 className="font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Team Feedback
              </h3>
              <Feedback projectId={id || ""} versionId={selectedVersion?.id} />
            </motion.div>
          )}
        </motion.div>

        {/* Right: Version history */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black dark:text-white">Version History</h3>
              <span className="text-xs text-black/40 dark:text-white/40 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
                {project.versions.length} versions
              </span>
            </div>
            <VersionTimeline
              versions={project.versions}
              branches={branches}
              selectedVersionId={selectedVersion?.id}
              onSelectVersion={setSelectedVersion}
              onSelectBranch={() => navigate(`/project/${id}/branches`)}
            />
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{project.title}"</strong>? This will
              permanently remove all {project.versions.length} versions and associated branches.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
