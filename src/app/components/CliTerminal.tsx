import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal } from "lucide-react";

interface Line {
  type: "cmd" | "out" | "success" | "info" | "blank";
  text: string;
  delay: number; // cumulative ms before this line appears
}

const LINES: Line[] = [
  { type: "cmd",     text: "genvo init \"Cyberpunk City Flythrough\"",             delay: 400 },
  { type: "success", text: "✓ Project initialized (id: proj_3f8a2c)",             delay: 900 },
  { type: "blank",   text: "",                                                     delay: 1100 },
  { type: "cmd",     text: "genvo generate --prompt \"neon city, aerial shot\"",   delay: 1400 },
  { type: "info",    text: "  Analyzing prompt...",                                delay: 1900 },
  { type: "info",    text: "  Loading model veo3...",                              delay: 2500 },
  { type: "info",    text: "  Generating frames [████████░░] 80%",                 delay: 3100 },
  { type: "success", text: "✓ Video saved  →  .genvo/v1/output.mp4",               delay: 3900 },
  { type: "blank",   text: "",                                                     delay: 4100 },
  { type: "cmd",     text: "genvo commit -m \"initial cinematic take\"",           delay: 4400 },
  { type: "success", text: "✓ [main a1b2c3d] initial cinematic take",              delay: 4900 },
  { type: "blank",   text: "",                                                     delay: 5100 },
  { type: "cmd",     text: "genvo branch create rain-effect",                      delay: 5400 },
  { type: "success", text: "✓ Switched to branch 'rain-effect'",                  delay: 5900 },
  { type: "cmd",     text: "genvo generate --prompt \"add heavy rain, wet streets\"", delay: 6200 },
  { type: "success", text: "✓ Video saved  →  .genvo/rain-effect/v1/output.mp4",   delay: 7400 },
  { type: "blank",   text: "",                                                     delay: 7600 },
  { type: "cmd",     text: "genvo merge rain-effect --into main",                  delay: 7900 },
  { type: "info",    text: "  AI conflict check: no conflicts found",              delay: 8400 },
  { type: "success", text: "✓ Merged. New HEAD: [main f9e8d7c]",                  delay: 9000 },
];

function CursorBlink() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "steps(1)" }}
      className="inline-block w-2 h-3.5 bg-green-400 align-middle ml-0.5"
    />
  );
}

export function CliTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const start = () => {
    setVisibleCount(0);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleCount(i + 1);
        containerRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
      }, line.delay);
      timers.push(t);
    });

    const done = setTimeout(() => setRunning(false), LINES[LINES.length - 1].delay + 600);
    timers.push(done);

    return () => timers.forEach(clearTimeout);
  }, [running]);

  // Auto-start on mount
  useEffect(() => {
    const t = setTimeout(start, 800);
    return () => clearTimeout(t);
  }, []);

  const lineColor = (type: Line["type"]) => {
    if (type === "cmd") return "text-white";
    if (type === "success") return "text-green-400";
    if (type === "info") return "text-white/50";
    return "text-white/20";
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-2xl font-mono text-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/40">genvo — zsh</span>
        </div>
        <button
          onClick={start}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          replay ↺
        </button>
      </div>

      {/* Terminal body */}
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto p-4 space-y-0.5 scrollbar-none"
      >
        <AnimatePresence>
          {LINES.slice(0, visibleCount).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={lineColor(line.type)}
            >
              {line.type === "blank" ? (
                <span>&nbsp;</span>
              ) : (
                <span>
                  {line.type === "cmd" && (
                    <span className="text-green-400 mr-2">❯</span>
                  )}
                  {line.text}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor at end */}
        {visibleCount >= LINES.length && (
          <div className="text-white/60">
            <span className="text-green-400 mr-2">❯</span>
            <CursorBlink />
          </div>
        )}
      </div>
    </div>
  );
}
