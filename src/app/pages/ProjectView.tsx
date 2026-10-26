import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  GitBranch,
  GitFork,
  Clock,
  Eye,
  Globe,
  Lock,
  Download,
  Share2,
  ChevronRight,
  Sparkles,
  History,
  Settings,
  AlertCircle,
  Trash2,
  MessageSquare,
  Send,
  LayoutList,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { getProject, updateProject, deleteProject, getCommentsByVersion, addComment, getBranchesByProject, exportProject } from "@/app/data/dataService";
import { cn, formatRelativeTime, formatDate } from "@/lib/utils";
import type { Project, Version, Comment, Branch } from "@/app/data/mockData";
import { CommitGraph } from "@/app/components/CommitGraph";

// Comments section component
function CommentsSection({ projectId, versionId }: { projectId: string; versionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setComments(getCommentsByVersion(projectId, versionId));
  }, [projectId, versionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(projectId, versionId, text.trim());
    setComments(getCommentsByVersion(projectId, versionId));
    setText("");
  };

  return (
    <div className="mt-6 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4">
      <h3 className="font-semibold text-black dark:text-white flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4" />
        Comments
        <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 font-normal">
          {comments.length}
        </span>
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
        <img
          src="https://api.dicebear.com/9.x/avataaars/svg?seed=user"
          alt="You"
          className="w-8 h-8 rounded-full flex-shrink-0 bg-black/5 dark:bg-white/5"
        />
        <div className="flex-1 flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            rows={1}
            className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none flex-1 min-h-[36px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim()}
            className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-black/40 dark:text-white/40 text-center py-4">
          Be the first to comment on this version.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full flex-shrink-0 bg-black/5 dark:bg-white/5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-black dark:text-white">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {formatRelativeTime(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-black/80 dark:text-white/80 mt-0.5">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (id) {
      const loadedProject = getProject(id);
      if (loadedProject) {
        setProject(loadedProject);
        setSelectedVersion(
          loadedProject.versions[loadedProject.versions.length - 1] || null
        );
      }
      setBranches(getBranchesByProject(id));
    }
  }, [id]);

  const handleToggleVisibility = () => {
    if (!project || !id) return;
    const updated = updateProject(id, { isPublic: !project.isPublic });
    if (updated) setProject(updated);
  };

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      window.location.href = "/dashboard";
    }
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
          <p className="text-black/60 dark:text-white/60 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                project.isPublic
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60"
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
            </span>
          </div>
          <p className="text-black/60 dark:text-white/60">
            {project.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-black/50 dark:text-white/50">
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
              Updated {formatRelativeTime(project.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-black/10 dark:border-white/10">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-black/10 dark:border-white/10">
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-black/10 dark:border-white/10"
            onClick={handleToggleVisibility}
            title={project.isPublic ? "Make private" : "Make public"}
          >
            {project.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            onClick={handleDelete}
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Link to={`/project/${id}/generate`}>
            <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
              <Sparkles className="w-4 h-4" />
              Generate New Version
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <VideoPlayer
            thumbnail={selectedVersion?.thumbnail || project.thumbnail}
            videoUrl={selectedVersion?.videoUrl}
            title={project.title}
          />

          {/* Tabs */}
          <Tabs defaultValue="prompt" className="mt-6">
            <TabsList className="bg-black/5 dark:bg-white/5">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>

            <TabsContent value="prompt" className="mt-4">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4">
                <p className="text-black/80 dark:text-white/80 leading-relaxed">
                  {selectedVersion?.prompt || project.prompt}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-black/50 dark:text-white/50">Model</span>
                    <p className="text-black dark:text-white font-medium">
                      {selectedVersion?.settings.model || project.settings.model}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/50 dark:text-white/50">Style</span>
                    <p className="text-black dark:text-white font-medium">
                      {selectedVersion?.settings.style || project.settings.style}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/50 dark:text-white/50">Duration</span>
                    <p className="text-black dark:text-white font-medium">
                      {selectedVersion?.settings.duration || project.settings.duration}s
                    </p>
                  </div>
                  <div>
                    <span className="text-black/50 dark:text-white/50">Aspect Ratio</span>
                    <p className="text-black dark:text-white font-medium">
                      {selectedVersion?.settings.aspectRatio || project.settings.aspectRatio}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
                <p className="text-xs text-black/40 dark:text-white/40 font-mono mb-4 uppercase tracking-wider">
                  Commit Graph
                </p>
                {project.versions.length > 0 ? (
                  <CommitGraph
                    versions={project.versions}
                    branches={branches}
                    selectedVersionId={selectedVersion?.id}
                    onSelectVersion={(vid) => {
                      const v = project.versions.find((v) => v.id === vid);
                      if (v) setSelectedVersion(v);
                    }}
                  />
                ) : (
                  <p className="text-sm text-black/40 dark:text-white/40 py-4 text-center">
                    No commits yet — generate your first version.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="log" className="mt-4">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5">
                {[
                  ...project.versions.map((v) => ({
                    key: v.id,
                    icon: "●",
                    color: "text-green-500",
                    text: `Generated v${v.versionNumber}`,
                    sub: v.settings.model,
                    time: v.createdAt,
                  })),
                  ...branches.map((b) => ({
                    key: b.id,
                    icon: "⑂",
                    color: "text-purple-500",
                    text: `Branch "${b.name}" created`,
                    sub: `by ${b.author.name}`,
                    time: b.createdAt,
                  })),
                  {
                    key: "init",
                    icon: "✦",
                    color: "text-blue-500",
                    text: "Project created",
                    sub: project.author.name,
                    time: project.createdAt,
                  },
                ]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .map((entry) => (
                    <div key={entry.key} className="flex items-start gap-3 px-4 py-3">
                      <span className={cn("text-sm mt-0.5 font-mono", entry.color)}>{entry.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black dark:text-white">{entry.text}</p>
                        <p className="text-xs text-black/40 dark:text-white/40">{entry.sub}</p>
                      </div>
                      <span className="text-xs text-black/30 dark:text-white/30 whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(entry.time)}
                      </span>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Comments */}
          {selectedVersion && (
            <CommentsSection projectId={project.id} versionId={selectedVersion.id} />
          )}
        </motion.div>

        {/* Version History Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-black/5 dark:border-white/10">
              <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                <History className="w-4 h-4" />
                Version History
              </h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                {project.versions.length} versions
              </p>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[500px] overflow-y-auto">
              {project.versions.length > 0 ? (
                [...project.versions].reverse().map((version) => (
                  <motion.button
                    key={version.id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    onClick={() => setSelectedVersion(version)}
                    className={cn(
                      "w-full p-4 text-left transition-colors",
                      selectedVersion?.id === version.id &&
                        "bg-black/5 dark:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={version.thumbnail}
                        alt={`Version ${version.versionNumber}`}
                        className="w-16 h-10 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-black dark:text-white">
                            v{version.versionNumber}
                          </span>
                          {selectedVersion?.id === version.id && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                          {formatDate(version.createdAt)}
                        </p>
                        <p className="text-xs text-black/60 dark:text-white/60 mt-1 line-clamp-2">
                          {version.prompt}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <GitBranch className="w-8 h-8 mx-auto text-black/20 dark:text-white/20 mb-2" />
                  <p className="text-sm text-black/50 dark:text-white/50">
                    No versions yet
                  </p>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                    Generate your first video
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <Link to={`/project/${id}/storyboard`}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-black/10 dark:border-white/10"
              >
                <LayoutList className="w-4 h-4" />
                Storyboard
              </Button>
            </Link>
            <Link to={`/project/${id}/branches`}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-black/10 dark:border-white/10"
              >
                <GitBranch className="w-4 h-4" />
                View Branches
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-black/10 dark:border-white/10"
            >
              <GitFork className="w-4 h-4" />
              Fork Project
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-black/10 dark:border-white/10"
              onClick={() => id && exportProject(id)}
            >
              <Download className="w-4 h-4" />
              Export .genvo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-black/10 dark:border-white/10"
            >
              <Settings className="w-4 h-4" />
              Project Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
