// Video frame comparison tool for version diffing
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Link2,
  Unlink,
  ZoomIn,
  ZoomOut,
  Columns,
  Layers,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Version } from "@/app/data/mockData";

interface FrameComparisonProps {
  versionA: Version;
  versionB: Version;
  onClose?: () => void;
}

type CompareMode = "side-by-side" | "overlay" | "slider";

export function FrameComparison({
  versionA,
  versionB,
  onClose,
}: FrameComparisonProps) {
  const [mode, setMode] = useState<CompareMode>("side-by-side");
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [zoom, setZoom] = useState(100);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // Sync playback
  useEffect(() => {
    if (!synced) return;

    const syncVideos = () => {
      if (videoARef.current && videoBRef.current) {
        videoBRef.current.currentTime = videoARef.current.currentTime;
      }
    };

    videoARef.current?.addEventListener("timeupdate", syncVideos);
    return () => videoARef.current?.removeEventListener("timeupdate", syncVideos);
  }, [synced]);

  const handlePlayPause = () => {
    if (playing) {
      videoARef.current?.pause();
      videoBRef.current?.pause();
    } else {
      videoARef.current?.play();
      if (synced) videoBRef.current?.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * duration;
    if (videoARef.current) {
      videoARef.current.currentTime = time;
    }
    if (videoBRef.current) {
      videoBRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleStep = (direction: "back" | "forward") => {
    const step = direction === "back" ? -0.1 : 0.1;
    const newTime = Math.max(0, Math.min(duration, currentTime + step));

    if (videoARef.current) {
      videoARef.current.currentTime = newTime;
    }
    if (videoBRef.current) {
      videoBRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-black dark:text-white">
            Compare Versions
          </h3>
          <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
              v{versionA.versionNumber}
            </span>
            <span>vs</span>
            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
              v{versionB.versionNumber}
            </span>
          </div>
        </div>

        {/* Mode tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as CompareMode)}>
          <TabsList className="h-8">
            <TabsTrigger value="side-by-side" className="text-xs px-2 gap-1">
              <Columns className="w-3 h-3" />
              Side by Side
            </TabsTrigger>
            <TabsTrigger value="overlay" className="text-xs px-2 gap-1">
              <Layers className="w-3 h-3" />
              Overlay
            </TabsTrigger>
            <TabsTrigger value="slider" className="text-xs px-2 gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Slider
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Comparison view */}
      <div
        className="relative aspect-video bg-black/5 dark:bg-white/5 overflow-hidden"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
      >
        {mode === "side-by-side" && (
          <SideBySideView
            versionA={versionA}
            versionB={versionB}
            videoARef={videoARef}
            videoBRef={videoBRef}
          />
        )}

        {mode === "overlay" && (
          <OverlayView
            versionA={versionA}
            versionB={versionB}
            videoARef={videoARef}
            videoBRef={videoBRef}
            opacity={overlayOpacity}
          />
        )}

        {mode === "slider" && (
          <SliderView
            versionA={versionA}
            versionB={versionB}
            videoARef={videoARef}
            videoBRef={videoBRef}
            position={sliderPosition}
            onPositionChange={setSliderPosition}
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-4">
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/50 dark:text-white/50 w-12">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[(currentTime / duration) * 100]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-black/50 dark:text-white/50 w-12 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleStep("back")}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous frame</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black"
              onClick={handlePlayPause}
            >
              {playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleStep("forward")}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next frame</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={synced ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-1",
                      synced &&
                        "bg-black dark:bg-white text-white dark:text-black"
                    )}
                    onClick={() => setSynced(!synced)}
                  >
                    {synced ? (
                      <Link2 className="w-4 h-4" />
                    ) : (
                      <Unlink className="w-4 h-4" />
                    )}
                    Sync
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {synced ? "Videos synced" : "Videos independent"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Mode-specific controls */}
            {mode === "overlay" && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-black/50 dark:text-white/50">
                  Opacity
                </span>
                <Slider
                  value={[overlayOpacity]}
                  onValueChange={([v]) => setOverlayOpacity(v)}
                  max={100}
                  className="w-24"
                />
              </div>
            )}

            {/* Zoom */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-black/50 dark:text-white/50 w-10 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt comparison */}
      <div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/5 border-t border-black/5 dark:border-white/5">
        <div className="p-3">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1">
            Version {versionA.versionNumber}
          </p>
          <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2">
            {versionA.prompt}
          </p>
        </div>
        <div className="p-3">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1">
            Version {versionB.versionNumber}
          </p>
          <p className="text-sm text-black/70 dark:text-white/70 line-clamp-2">
            {versionB.prompt}
          </p>
        </div>
      </div>
    </div>
  );
}

// Side by side comparison
function SideBySideView({
  versionA,
  versionB,
  videoARef,
  videoBRef,
}: {
  versionA: Version;
  versionB: Version;
  videoARef: React.RefObject<HTMLVideoElement | null>;
  videoBRef: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 h-full">
      <div className="relative">
        <img
          src={versionA.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
          v{versionA.versionNumber}
        </div>
        <video
          ref={videoARef}
          src={versionA.videoUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          muted
          playsInline
        />
      </div>
      <div className="relative">
        <img
          src={versionB.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
          v{versionB.versionNumber}
        </div>
        <video
          ref={videoBRef}
          src={versionB.videoUrl}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          muted
          playsInline
        />
      </div>
    </div>
  );
}

// Overlay comparison
function OverlayView({
  versionA,
  versionB,
  videoARef,
  videoBRef,
  opacity,
}: {
  versionA: Version;
  versionB: Version;
  videoARef: React.RefObject<HTMLVideoElement | null>;
  videoBRef: React.RefObject<HTMLVideoElement | null>;
  opacity: number;
}) {
  return (
    <div className="relative h-full">
      <img
        src={versionA.thumbnail}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        src={versionB.thumbnail}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: opacity / 100 }}
      />
      <div className="absolute top-2 left-2 flex gap-2">
        <span
          className="px-2 py-1 rounded bg-black/70 text-white text-xs"
          style={{ opacity: 1 - opacity / 100 }}
        >
          v{versionA.versionNumber}
        </span>
        <span
          className="px-2 py-1 rounded bg-black/70 text-white text-xs"
          style={{ opacity: opacity / 100 }}
        >
          v{versionB.versionNumber}
        </span>
      </div>
      <video
        ref={videoARef}
        src={versionA.videoUrl}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        muted
        playsInline
      />
      <video
        ref={videoBRef}
        src={versionB.videoUrl}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        muted
        playsInline
      />
    </div>
  );
}

// Slider comparison
function SliderView({
  versionA,
  versionB,
  videoARef,
  videoBRef,
  position,
  onPositionChange,
}: {
  versionA: Version;
  versionB: Version;
  videoARef: React.RefObject<HTMLVideoElement | null>;
  videoBRef: React.RefObject<HTMLVideoElement | null>;
  position: number;
  onPositionChange: (value: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onPositionChange(percentage);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full cursor-col-resize"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      {/* Version B (right side, full) */}
      <img
        src={versionB.thumbnail}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Version A (left side, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={versionA.thumbnail}
          alt=""
          className="w-full h-full object-cover"
          style={{
            width: containerRef.current
              ? containerRef.current.offsetWidth
              : "100%",
          }}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={() => setDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
          <ChevronLeft className="w-3 h-3 text-black/40" />
          <ChevronRight className="w-3 h-3 text-black/40" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
        v{versionA.versionNumber}
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
        v{versionB.versionNumber}
      </div>

      <video
        ref={videoARef}
        src={versionA.videoUrl}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        muted
        playsInline
      />
      <video
        ref={videoBRef}
        src={versionB.videoUrl}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        muted
        playsInline
      />
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
