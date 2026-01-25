import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Download,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Slider } from "@/app/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  thumbnail: string;
  videoUrl?: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({
  thumbnail,
  videoUrl,
  title,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [hasRealVideo, setHasRealVideo] = useState(false);

  // Check if we have a real playable video
  useEffect(() => {
    setHasRealVideo(!!videoUrl && !videoUrl.includes("placeholder"));
  }, [videoUrl]);

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [hasRealVideo]);

  const togglePlay = () => {
    const video = videoRef.current;

    if (hasRealVideo && video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
      }
    } else {
      // Simulate playback for demo mode
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsPlaying(false);
              return 0;
            }
            return prev + 2;
          });
        }, 100);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (hasRealVideo && video && video.duration) {
      video.currentTime = (value[0] / 100) * video.duration;
    }
    setProgress(value[0]);
  };

  const handleReset = () => {
    const video = videoRef.current;
    if (hasRealVideo && video) {
      video.currentTime = 0;
      video.pause();
    }
    setProgress(0);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (hasRealVideo && video) {
      video.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = `${title || "video"}.mp4`;
      link.click();
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const currentTime = hasRealVideo && videoRef.current
    ? videoRef.current.currentTime
    : (progress / 100) * 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative rounded-xl overflow-hidden bg-black group",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video/Thumbnail */}
      <div className="relative aspect-video">
        {hasRealVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
          />
        ) : (
          <img
            src={thumbnail}
            alt={title || "Video preview"}
            className="w-full h-full object-cover"
          />
        )}

        {/* Play overlay */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
            >
              <Play className="w-6 h-6 text-black ml-1" fill="black" />
            </motion.button>
          </motion.div>
        )}

        {/* Progress simulation overlay */}
        {isPlaying && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls || isPlaying ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[progress]}
            max={100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>

            <span className="text-white/70 text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration || 5)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {videoUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {hasRealVideo && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
