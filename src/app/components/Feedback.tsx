// Simple inline feedback for versions
import { motion } from "motion/react";
import { useState } from "react";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn, formatRelativeTime } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  author: { name: string; avatar: string };
  content: string;
  createdAt: string;
  likes: number;
  liked?: boolean;
}

// Mock feedback data
const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    author: { name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" },
    content: "Love the neon reflections! Maybe try more blue tones?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 3,
    liked: false,
  },
  {
    id: "2",
    author: { name: "John", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john" },
    content: "The flying cars look great. Can we add more traffic?",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 2,
    liked: true,
  },
];

interface FeedbackProps {
  projectId: string;
  versionId?: string;
  compact?: boolean;
}

export function Feedback({ compact = false }: FeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(mockFeedback);
  const [newFeedback, setNewFeedback] = useState("");

  const handleSubmit = () => {
    if (!newFeedback.trim()) return;

    const item: FeedbackItem = {
      id: Date.now().toString(),
      author: { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user" },
      content: newFeedback,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
    };

    setFeedback([item, ...feedback]);
    setNewFeedback("");
  };

  const handleLike = (id: string) => {
    setFeedback(feedback.map(f =>
      f.id === id
        ? { ...f, liked: !f.liked, likes: f.liked ? f.likes - 1 : f.likes + 1 }
        : f
    ));
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
        <MessageSquare className="w-4 h-4" />
        <span>{feedback.length} comments</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Add feedback..."
            className="flex-1 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border-none text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newFeedback.trim()}
            className="bg-black dark:bg-white text-white dark:text-black"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {feedback.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 group"
          >
            <Avatar className="w-7 h-7">
              <AvatarImage src={item.author.avatar} />
              <AvatarFallback>{item.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black dark:text-white">
                  {item.author.name}
                </span>
                <span className="text-xs text-black/40 dark:text-white/40">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
              <p className="text-sm text-black/70 dark:text-white/70 mt-0.5">
                {item.content}
              </p>
            </div>
            <button
              onClick={() => handleLike(item.id)}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors opacity-0 group-hover:opacity-100",
                item.liked
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              <ThumbsUp className="w-3 h-3" />
              {item.likes > 0 && item.likes}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
