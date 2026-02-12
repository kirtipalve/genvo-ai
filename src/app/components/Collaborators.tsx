// Team and collaborator management
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  Edit3,
  Eye,
  MoreHorizontal,
  X,
  Check,
  Copy,
  Link2,
  Settings,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { getMockCollaborators, getCurrentUser } from "@/app/data/collaborationService";
import type { TeamMember, User } from "@/app/data/types";
import { cn } from "@/lib/utils";

interface CollaboratorsProps {
  projectId: string;
  isOwner?: boolean;
}

const ROLE_CONFIG = {
  owner: {
    icon: Crown,
    label: "Owner",
    description: "Full access and ownership",
    color: "text-yellow-500",
  },
  admin: {
    icon: Shield,
    label: "Admin",
    description: "Manage settings and members",
    color: "text-purple-500",
  },
  editor: {
    icon: Edit3,
    label: "Editor",
    description: "Create and edit content",
    color: "text-blue-500",
  },
  viewer: {
    icon: Eye,
    label: "Viewer",
    description: "View only access",
    color: "text-gray-500",
  },
};

export function Collaborators({ projectId, isOwner = true }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<TeamMember[]>(getMockCollaborators());
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [copied, setCopied] = useState(false);
  const currentUser = getCurrentUser();

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;

    // Simulate adding collaborator
    const newMember: TeamMember = {
      userId: `user-${Date.now()}`,
      user: {
        id: `user-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`,
        role: inviteRole,
        createdAt: new Date().toISOString(),
      },
      role: inviteRole,
      joinedAt: new Date().toISOString(),
    };

    setCollaborators([...collaborators, newMember]);
    setInviteEmail("");
    setInviteDialogOpen(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/invite/${projectId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (userId: string) => {
    setCollaborators(collaborators.filter((c) => c.userId !== userId));
  };

  const handleRoleChange = (userId: string, role: TeamMember["role"]) => {
    setCollaborators(
      collaborators.map((c) =>
        c.userId === userId ? { ...c, role } : c
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4" />
          Collaborators
          <span className="text-sm font-normal text-black/50 dark:text-white/50">
            ({collaborators.length + 1})
          </span>
        </h3>

        {isOwner && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-black/10 dark:border-white/10"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Collaborator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* Email input */}
                <div className="space-y-2">
                  <Label>Email address</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-zinc-950 text-black/50 dark:text-white/50">
                      or share invite link
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full border-black/10 dark:border-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Copy Invite Link
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Collaborator list */}
      <div className="space-y-2">
        {/* Owner (current user) */}
        <CollaboratorItem
          member={{
            userId: currentUser.id,
            user: currentUser,
            role: "owner",
            joinedAt: currentUser.createdAt,
          }}
          isCurrentUser
          isOwner={isOwner}
          onRemove={() => {}}
          onRoleChange={() => {}}
        />

        {/* Other collaborators */}
        <AnimatePresence mode="popLayout">
          {collaborators.map((member, index) => (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03 }}
            >
              <CollaboratorItem
                member={member}
                isOwner={isOwner}
                onRemove={() => handleRemove(member.userId)}
                onRoleChange={(role) => handleRoleChange(member.userId, role)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CollaboratorItemProps {
  member: TeamMember;
  isCurrentUser?: boolean;
  isOwner: boolean;
  onRemove: () => void;
  onRoleChange: (role: TeamMember["role"]) => void;
}

function CollaboratorItem({
  member,
  isCurrentUser,
  isOwner,
  onRemove,
  onRoleChange,
}: CollaboratorItemProps) {
  const roleConfig = ROLE_CONFIG[member.role];
  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group transition-colors">
      <Avatar className="w-8 h-8">
        <AvatarImage src={member.user.avatar} />
        <AvatarFallback>{member.user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-black dark:text-white truncate">
            {member.user.name}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-black/40 dark:text-white/40">(you)</span>
          )}
        </div>
        <span className="text-xs text-black/50 dark:text-white/50">
          {member.user.email}
        </span>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                roleConfig.color,
                member.role === "owner"
                  ? "bg-yellow-500/10"
                  : member.role === "admin"
                  ? "bg-purple-500/10"
                  : member.role === "editor"
                  ? "bg-blue-500/10"
                  : "bg-gray-500/10"
              )}
            >
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </div>
          </TooltipTrigger>
          <TooltipContent>{roleConfig.description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOwner && !isCurrentUser && member.role !== "owner" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <MoreHorizontal className="w-4 h-4 text-black/40 dark:text-white/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRoleChange("admin")}>
              <Shield className="w-4 h-4 mr-2 text-purple-500" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("editor")}>
              <Edit3 className="w-4 h-4 mr-2 text-blue-500" />
              Make Editor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("viewer")}>
              <Eye className="w-4 h-4 mr-2 text-gray-500" />
              Make Viewer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-red-600">
              <X className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Compact avatar stack for displaying in headers
export function CollaboratorAvatars({
  collaborators,
  max = 4,
  size = "sm",
  onViewAll,
}: {
  collaborators: TeamMember[];
  max?: number;
  size?: "sm" | "md";
  onViewAll?: () => void;
}) {
  const displayed = collaborators.slice(0, max);
  const remaining = collaborators.length - max;
  const sizeClasses = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayed.map((member, index) => (
          <TooltipProvider key={member.userId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn(
                    sizeClasses,
                    "border-2 border-white dark:border-zinc-900",
                    "ring-2 ring-transparent hover:ring-black/10 dark:hover:ring-white/10",
                    "transition-all cursor-pointer"
                  )}
                  style={{ zIndex: displayed.length - index }}
                >
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-xs opacity-70">{member.role}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {remaining > 0 && (
          <button
            onClick={onViewAll}
            className={cn(
              sizeClasses,
              "rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center",
              "text-xs font-medium text-black/60 dark:text-white/60",
              "border-2 border-white dark:border-zinc-900",
              "hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
            )}
          >
            +{remaining}
          </button>
        )}
      </div>
    </div>
  );
}
