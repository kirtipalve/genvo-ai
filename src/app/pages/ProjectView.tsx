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
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { VersionTimeline } from "@/app/components/VersionTimeline";
import { Feedback } from "@/app/components/Feedback";
import { DemoTip } from "@/app/components/DemoHint";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { getProject, updateProject, deleteProject, getBranchesByProject } from "@/app/data/dataService";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Project, Version, Branch } from "@/app/data/mockData";

export function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDemoTip, setShowDemoTip] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (id) {
      const loadedProject = getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        setSelectedVersion(
          loadedProject.versions[loadedProject.versions.length - 1] || null
        );
        setBranches(getBranchesByProject(id));
      }
    }
    // Check if tip was already dismissed
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
    if (updated) setProject(updated);
  };

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      navigate("/dashboard");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading/error state
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

  // Mock collaborators for demo
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
          directions explored by your team. Click on versions in the timeline to compare,
          or create a new version with different prompts.
        </DemoTip>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {project.title}
            </h1>
            <button
              onClick={handleToggleVisibility}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                project.isPublic
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                  : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
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
            </button>
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

        <div className="flex items-center gap-2">
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
            className="border-black/10 dark:border-white/10"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            onClick={handleDelete}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-black dark:text-white">
                  Version {selectedVersion.versionNumber}
                </h3>
                <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
                  <span>{selectedVersion.settings.model}</span>
                  <span>•</span>
                  <span>{selectedVersion.settings.duration}s</span>
                  <span>•</span>
                  <span>{selectedVersion.settings.aspectRatio}</span>
                </div>
              </div>
              <p className="text-black/70 dark:text-white/70 leading-relaxed">
                {selectedVersion.prompt}
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
            <h3 className="font-semibold text-black dark:text-white mb-4">
              Version History
            </h3>
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
    </div>
  );
}
