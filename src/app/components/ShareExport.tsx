// Sharing and export functionality
import { useState } from "react";
import { motion } from "motion/react";
import {
  Share2,
  Download,
  Link2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Mail,
  Code,
  Globe,
  Lock,
  Image,
  Film,
  FileJson,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ShareExportProps {
  projectId: string;
  projectTitle: string;
  isPublic: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
  versionId?: string;
  videoUrl?: string;
  thumbnail?: string;
}

export function ShareExportDialog({
  projectId,
  projectTitle,
  isPublic,
  onTogglePublic,
  versionId,
  videoUrl,
  thumbnail,
}: ShareExportProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-black/10 dark:border-white/10"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share & Export</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="share" className="flex-1">
              Share
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1">
              Export
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex-1">
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="mt-4 space-y-4">
            <ShareTab
              projectId={projectId}
              projectTitle={projectTitle}
              isPublic={isPublic}
              onTogglePublic={onTogglePublic}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-4 space-y-4">
            <ExportTab
              projectId={projectId}
              versionId={versionId}
              videoUrl={videoUrl}
              thumbnail={thumbnail}
            />
          </TabsContent>

          <TabsContent value="embed" className="mt-4 space-y-4">
            <EmbedTab projectId={projectId} isPublic={isPublic} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ShareTab({
  projectId,
  projectTitle,
  isPublic,
  onTogglePublic,
}: {
  projectId: string;
  projectTitle: string;
  isPublic: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/project/${projectId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: "twitter" | "linkedin" | "email") => {
    const text = `Check out "${projectTitle}" on Genvo`;
    const url = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let shareLink = "";
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "email":
        shareLink = `mailto:?subject=${encodedText}&body=${text}%0A%0A${url}`;
        break;
    }

    window.open(shareLink, "_blank");
  };

  return (
    <>
      {/* Visibility toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Globe className="w-5 h-5 text-green-500" />
          ) : (
            <Lock className="w-5 h-5 text-black/40 dark:text-white/40" />
          )}
          <div>
            <p className="font-medium text-sm text-black dark:text-white">
              {isPublic ? "Public" : "Private"}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">
              {isPublic
                ? "Anyone with the link can view"
                : "Only collaborators can view"}
            </p>
          </div>
        </div>
        <Switch checked={isPublic} onCheckedChange={onTogglePublic} />
      </div>

      {/* Share link */}
      <div className="space-y-2">
        <Label>Share Link</Label>
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="text-sm" />
          <Button onClick={handleCopy} variant="outline">
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Social sharing */}
      <div className="space-y-2">
        <Label>Share on Social</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => handleSocialShare("twitter")}
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => handleSocialShare("linkedin")}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => handleSocialShare("email")}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        </div>
      </div>

      {/* QR Code placeholder */}
      <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-black/10 dark:border-white/10">
        <div className="text-center">
          <QrCode className="w-16 h-16 mx-auto text-black/20 dark:text-white/20 mb-2" />
          <p className="text-sm text-black/50 dark:text-white/50">
            QR Code for sharing
          </p>
        </div>
      </div>
    </>
  );
}

function ExportTab({
  projectId,
  versionId,
  videoUrl,
  thumbnail,
}: {
  projectId: string;
  versionId?: string;
  videoUrl?: string;
  thumbnail?: string;
}) {
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("1080p");
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type: "video" | "thumbnail" | "data") => {
    setExporting(true);
    // Simulate export delay
    await new Promise((r) => setTimeout(r, 1000));

    switch (type) {
      case "video":
        if (videoUrl) {
          window.open(videoUrl, "_blank");
        }
        break;
      case "thumbnail":
        if (thumbnail) {
          const link = document.createElement("a");
          link.href = thumbnail;
          link.download = `${projectId}-thumbnail.jpg`;
          link.click();
        }
        break;
      case "data":
        // Export project data as JSON
        const projectData = localStorage.getItem("genvo_projects");
        if (projectData) {
          const projects = JSON.parse(projectData);
          const project = projects.find((p: { id: string }) => p.id === projectId);
          if (project) {
            const blob = new Blob([JSON.stringify(project, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${projectId}-export.json`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }
        break;
    }

    setExporting(false);
  };

  return (
    <>
      {/* Video export */}
      <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-black/60 dark:text-white/60" />
          <div className="flex-1">
            <p className="font-medium text-sm text-black dark:text-white">
              Download Video
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">
              Export the generated video
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4k">4K</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => handleExport("video")}
          disabled={exporting || !videoUrl}
          className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? "Preparing..." : "Download Video"}
        </Button>
      </div>

      {/* Other exports */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleExport("thumbnail")}
          disabled={!thumbnail}
          className={cn(
            "p-3 rounded-lg border border-black/10 dark:border-white/10 text-left transition-colors",
            thumbnail
              ? "hover:bg-black/5 dark:hover:bg-white/5"
              : "opacity-50 cursor-not-allowed"
          )}
        >
          <Image className="w-5 h-5 text-black/60 dark:text-white/60 mb-2" />
          <p className="font-medium text-sm text-black dark:text-white">
            Thumbnail
          </p>
          <p className="text-xs text-black/50 dark:text-white/50">PNG image</p>
        </button>

        <button
          onClick={() => handleExport("data")}
          className="p-3 rounded-lg border border-black/10 dark:border-white/10 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <FileJson className="w-5 h-5 text-black/60 dark:text-white/60 mb-2" />
          <p className="font-medium text-sm text-black dark:text-white">
            Project Data
          </p>
          <p className="text-xs text-black/50 dark:text-white/50">JSON export</p>
        </button>
      </div>

      <p className="text-xs text-black/40 dark:text-white/40 text-center">
        Exports include prompt history and version metadata
      </p>
    </>
  );
}

function EmbedTab({
  projectId,
  isPublic,
}: {
  projectId: string;
  isPublic: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  const sizes = {
    small: { width: 320, height: 180 },
    medium: { width: 640, height: 360 },
    large: { width: 1280, height: 720 },
  };

  const embedUrl = `${window.location.origin}/embed/${projectId}`;
  const { width, height } = sizes[size];

  const embedCode = `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="autoplay; fullscreen"
  allowfullscreen
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isPublic) {
    return (
      <div className="text-center py-8">
        <Lock className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
        <p className="font-medium text-black dark:text-white mb-1">
          Private Project
        </p>
        <p className="text-sm text-black/50 dark:text-white/50 mb-4">
          Make this project public to enable embedding
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Size selector */}
      <div className="space-y-2">
        <Label>Embed Size</Label>
        <div className="flex gap-2">
          {(["small", "medium", "large"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border text-sm transition-colors",
                size === s
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="block text-xs opacity-70 mt-0.5">
                {sizes[s].width}×{sizes[s].height}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Embed preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="relative aspect-video bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Code className="w-8 h-8 mx-auto text-black/30 dark:text-white/30 mb-2" />
              <p className="text-sm text-black/50 dark:text-white/50">
                Embed preview
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Embed Code</Label>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Textarea
          value={embedCode}
          readOnly
          rows={6}
          className="font-mono text-xs bg-black/5 dark:bg-white/5"
        />
      </div>

      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open embed in new tab
      </a>
    </>
  );
}
