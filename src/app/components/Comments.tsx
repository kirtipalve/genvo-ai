// Comments and review system for video versions
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Reply,
  CheckCircle,
  Clock,
  SmilePlus,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  getCommentsByVersion,
  getCommentsByProject,
  addComment,
  updateComment,
  deleteComment,
  resolveComment,
  addReaction,
  getCurrentUser,
} from "@/app/data/collaborationService";
import type { Comment } from "@/app/data/types";
import { cn, formatRelativeTime } from "@/lib/utils";

interface CommentsProps {
  projectId: string;
  versionId?: string;
  currentTimestamp?: number;
  onTimestampClick?: (timestamp: number) => void;
  showResolved?: boolean;
}

const EMOJI_OPTIONS = ["👍", "👎", "🔥", "💯", "🎉", "🤔", "❤️", "👀"];

export function Comments({
  projectId,
  versionId,
  currentTimestamp,
  onTimestampClick,
  showResolved = true,
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [addTimestamp, setAddTimestamp] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadComments();
  }, [projectId, versionId]);

  const loadComments = () => {
    const loaded = versionId
      ? getCommentsByVersion(projectId, versionId)
      : getCommentsByProject(projectId);
    setComments(loaded);
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    addComment(projectId, newComment, {
      versionId,
      parentId: replyTo || undefined,
      timestamp: addTimestamp && currentTimestamp !== undefined ? currentTimestamp : undefined,
    });

    setNewComment("");
    setReplyTo(null);
    setAddTimestamp(false);
    loadComments();
  };

  const handleEdit = (commentId: string) => {
    if (!editContent.trim()) return;

    updateComment(commentId, editContent);
    setEditingId(null);
    setEditContent("");
    loadComments();
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm("Delete this comment?")) {
      deleteComment(commentId);
      loadComments();
    }
  };

  const handleResolve = (commentId: string, resolved: boolean) => {
    resolveComment(commentId, resolved);
    loadComments();
  };

  const handleReaction = (commentId: string, emoji: string) => {
    addReaction(commentId, emoji);
    loadComments();
  };

  // Group comments by parent
  const rootComments = comments.filter((c) => !c.parentId && (showResolved || !c.resolved));
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) acc[comment.parentId] = [];
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments
          {comments.length > 0 && (
            <span className="text-sm font-normal text-black/50 dark:text-white/50">
              ({comments.length})
            </span>
          )}
        </h3>
        {comments.some((c) => c.resolved) && (
          <button className="text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
            {showResolved ? "Hide resolved" : "Show resolved"}
          </button>
        )}
      </div>

      {/* Comment input */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
              rows={2}
              className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentTimestamp !== undefined && (
                  <button
                    onClick={() => setAddTimestamp(!addTimestamp)}
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors",
                      addTimestamp
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {addTimestamp
                      ? `at ${currentTimestamp.toFixed(1)}s`
                      : "Add timestamp"}
                  </button>
                )}
                {replyTo && (
                  <button
                    onClick={() => setReplyTo(null)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  >
                    Replying
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-1"
              >
                <Send className="w-3 h-3" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {rootComments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-black/50 dark:text-white/50"
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to share feedback</p>
            </motion.div>
          ) : (
            rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={repliesMap[comment.id] || []}
                currentUserId={currentUser.id}
                editingId={editingId}
                editContent={editContent}
                onEdit={(id) => {
                  setEditingId(id);
                  setEditContent(comment.content);
                }}
                onEditChange={setEditContent}
                onEditSubmit={() => handleEdit(comment.id)}
                onEditCancel={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
                onDelete={handleDelete}
                onReply={(id) => {
                  setReplyTo(id);
                  inputRef.current?.focus();
                }}
                onResolve={handleResolve}
                onReaction={handleReaction}
                onTimestampClick={onTimestampClick}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  currentUserId: string;
  editingId: string | null;
  editContent: string;
  onEdit: (id: string) => void;
  onEditChange: (content: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  onReply: (id: string) => void;
  onResolve: (id: string, resolved: boolean) => void;
  onReaction: (id: string, emoji: string) => void;
  onTimestampClick?: (timestamp: number) => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  editingId,
  editContent,
  onEdit,
  onEditChange,
  onEditSubmit,
  onEditCancel,
  onDelete,
  onReply,
  onResolve,
  onReaction,
  onTimestampClick,
  isReply = false,
}: CommentItemProps) {
  const isEditing = editingId === comment.id;
  const isOwner = comment.author.id === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group",
        isReply && "ml-11",
        comment.resolved && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className={cn("flex-shrink-0", isReply ? "w-6 h-6" : "w-8 h-8")}>
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-black dark:text-white">
              {comment.author.name}
            </span>
            <span className="text-xs text-black/40 dark:text-white/40">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.timestamp !== undefined && (
              <button
                onClick={() => onTimestampClick?.(comment.timestamp!)}
                className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                {comment.timestamp.toFixed(1)}s
              </button>
            )}
            {comment.resolved && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => onEditChange(e.target.value)}
                rows={2}
                className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={onEditSubmit} className="gap-1">
                  <Check className="w-3 h-3" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={onEditCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-black/80 dark:text-white/80 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {comment.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => onReaction(comment.id, reaction.emoji)}
                  className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors",
                    reaction.users.includes(currentUserId)
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
                  )}
                >
                  {reaction.emoji}
                  <span>{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <SmilePlus className="w-4 h-4 text-black/40 dark:text-white/40" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex gap-1">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReaction(comment.id, emoji)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {!isReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}

              {!isReply && (
                <button
                  onClick={() => onResolve(comment.id, !comment.resolved)}
                  className="flex items-center gap-1 text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  {comment.resolved ? "Unresolve" : "Resolve"}
                </button>
              )}

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-black/40 dark:text-white/40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(comment.id)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  currentUserId={currentUserId}
                  editingId={editingId}
                  editContent={editContent}
                  onEdit={onEdit}
                  onEditChange={onEditChange}
                  onEditSubmit={onEditSubmit}
                  onEditCancel={onEditCancel}
                  onDelete={onDelete}
                  onReply={onReply}
                  onResolve={onResolve}
                  onReaction={onReaction}
                  onTimestampClick={onTimestampClick}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact comment indicator for video player
export function CommentMarkers({
  comments,
  duration,
  onMarkerClick,
}: {
  comments: Comment[];
  duration: number;
  onMarkerClick: (comment: Comment) => void;
}) {
  const timestampedComments = comments.filter((c) => c.timestamp !== undefined);

  if (timestampedComments.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none">
      {timestampedComments.map((comment) => (
        <button
          key={comment.id}
          onClick={() => onMarkerClick(comment)}
          className="absolute w-2 h-2 -top-0.5 rounded-full bg-blue-500 hover:bg-blue-400 pointer-events-auto transition-colors transform -translate-x-1/2"
          style={{ left: `${(comment.timestamp! / duration) * 100}%` }}
          title={`${comment.author.name}: ${comment.content.slice(0, 50)}...`}
        />
      ))}
    </div>
  );
}
