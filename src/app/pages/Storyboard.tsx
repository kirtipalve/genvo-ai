import { useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ChevronRight, Plus, Trash2, Play, GripVertical, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import { cn } from "@/lib/utils";
import { getProject } from "@/app/data/dataService";
import { getShots, addShot, deleteShot, reorderShots, updateShot } from "@/app/data/dataService";
import type { Shot } from "@/app/data/mockData";

const ITEM_TYPE = "SHOT";

interface DragItem {
  id: string;
  index: number;
}

interface ShotCardProps {
  shot: Shot;
  index: number;
  moveShot: (dragIndex: number, hoverIndex: number) => void;
  onDropEnd: () => void;
  onDelete: (id: string) => void;
}

function ShotCard({ shot, index, moveShot, onDropEnd, onDelete }: ShotCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<DragItem>({
    accept: ITEM_TYPE,
    hover(item) {
      if (!ref.current) return;
      if (item.index === index) return;
      moveShot(item.index, index);
      item.index = index;
    },
    drop() {
      onDropEnd();
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id: shot.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  preview(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
      className={cn(
        "flex-shrink-0 w-56 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden",
        isDragging && "opacity-40"
      )}
    >
      {/* Thumbnail */}
      <div className="relative">
        <img src={shot.thumbnail} alt={`Shot ${index + 1}`} className="w-full h-32 object-cover" />
        {/* Shot number badge */}
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {index + 1}
        </span>
        {/* Status badge */}
        <span
          className={cn(
            "absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium",
            shot.status === "done"
              ? "bg-green-500/80 text-white"
              : shot.status === "generating"
              ? "bg-yellow-500/80 text-white"
              : "bg-black/50 text-white/80"
          )}
        >
          {shot.status === "done" ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Done
            </span>
          ) : shot.status === "generating" ? (
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Generating
            </span>
          ) : (
            "Pending"
          )}
        </span>
        {/* Drag handle overlay */}
        <div
          ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
          className="absolute bottom-2 right-2 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-black/70 dark:text-white/70 line-clamp-3 leading-relaxed">
          {shot.prompt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/40 dark:text-white/40">{shot.duration}s</span>
          <button
            onClick={() => onDelete(shot.id)}
            className="p-1 text-black/30 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface AddShotDialogProps {
  onAdd: (prompt: string, duration: number) => void;
  onClose: () => void;
}

function AddShotDialog({ onAdd, onClose }: AddShotDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([3]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl space-y-4"
      >
        <h3 className="text-lg font-semibold text-black dark:text-white">Add New Shot</h3>

        <div className="space-y-2">
          <Label>Shot Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe this shot..."
            rows={3}
            className="resize-none bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Duration</Label>
            <span className="text-sm text-black/60 dark:text-white/60">{duration[0]}s</span>
          </div>
          <Slider value={duration} onValueChange={setDuration} min={1} max={10} step={1} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-black/10 dark:border-white/10" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-black dark:bg-white text-white dark:text-black"
            disabled={!prompt.trim()}
            onClick={() => {
              onAdd(prompt.trim(), duration[0]);
              onClose();
            }}
          >
            Add Shot
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function StoryboardInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = id ? getProject(id) : null;

  const [shots, setShots] = useState<Shot[]>(() => (id ? getShots(id) : []));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);

  const moveShot = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setShots((prev) => {
        const next = [...prev];
        const [removed] = next.splice(dragIndex, 1);
        next.splice(hoverIndex, 0, removed);
        return next.map((s, i) => ({ ...s, order: i }));
      });
    },
    []
  );

  const handleDropEnd = useCallback(() => {
    if (!id) return;
    const orderedIds = shots.map((s) => s.id);
    reorderShots(id, orderedIds);
  }, [id, shots]);

  const handleDelete = (shotId: string) => {
    if (!id) return;
    deleteShot(id, shotId);
    setShots(getShots(id));
  };

  const handleAddShot = (prompt: string, duration: number) => {
    if (!id) return;
    addShot(id, prompt, duration);
    setShots(getShots(id));
  };

  const handleGenerateAll = async () => {
    if (!id || shots.length === 0) return;
    setIsGeneratingAll(true);
    setGenerateProgress(0);

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      if (shot.status === "done") {
        setGenerateProgress(Math.round(((i + 1) / shots.length) * 100));
        continue;
      }

      // Mark as generating
      updateShot(id, shot.id, { status: "generating" });
      setShots(getShots(id));

      await new Promise<void>((resolve) => setTimeout(resolve, 1200));

      // Mark as done
      updateShot(id, shot.id, { status: "done" });
      setShots(getShots(id));
      setGenerateProgress(Math.round(((i + 1) / shots.length) * 100));
    }

    setIsGeneratingAll(false);
  };

  if (!project) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-black/60 dark:text-white/60 mb-4">Project not found.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0);
  const doneCount = shots.filter((s) => s.status === "done").length;

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
        <Link to={`/project/${id}`} className="hover:text-black dark:hover:text-white transition-colors">
          {project.title}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-black dark:text-white">Storyboard</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/project/${id}`)}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Storyboard</h1>
            <p className="text-black/60 dark:text-white/60 mt-1">
              {shots.length} shot{shots.length !== 1 ? "s" : ""} • {totalDuration}s total •{" "}
              {doneCount}/{shots.length} generated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-black/10 dark:border-white/10"
            onClick={() => setShowAddDialog(true)}
            disabled={isGeneratingAll}
          >
            <Plus className="w-4 h-4" />
            Add Shot
          </Button>
          <Button
            className="gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || shots.length === 0}
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating... {generateProgress}%
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate All Shots
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Progress bar when generating */}
      {isGeneratingAll && (
        <div className="mb-6 bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-black dark:bg-white"
            animate={{ width: `${generateProgress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Shot timeline */}
      {shots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-black/30 dark:text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No shots yet</h3>
          <p className="text-black/50 dark:text-white/50 mb-6">
            Add shots to build your storyboard
          </p>
          <Button
            className="gap-2 bg-black dark:bg-white text-white dark:text-black"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4" />
            Add First Shot
          </Button>
        </motion.div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-max">
            {shots.map((shot, index) => (
              <ShotCard
                key={shot.id}
                shot={shot}
                index={index}
                moveShot={moveShot}
                onDropEnd={handleDropEnd}
                onDelete={handleDelete}
              />
            ))}

            {/* Add shot card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddDialog(true)}
              disabled={isGeneratingAll}
              className="flex-shrink-0 w-56 h-[232px] border-2 border-dashed border-black/15 dark:border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 text-black/40 dark:text-white/40 hover:border-black/30 dark:hover:border-white/30 hover:text-black/60 dark:hover:text-white/60 transition-all"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Add Shot</span>
            </motion.button>
          </div>
        </div>
      )}

      {showAddDialog && (
        <AddShotDialog onAdd={handleAddShot} onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}

export function Storyboard() {
  return (
    <DndProvider backend={HTML5Backend}>
      <StoryboardInner />
    </DndProvider>
  );
}
