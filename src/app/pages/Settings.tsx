import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  User,
  Database,
  RefreshCw,
  Download,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  isApiKeyConfigured,
  saveApiKey,
  clearApiKey,
  getApiKey,
  VIDEO_MODELS,
} from "@/app/services/videoGeneration";
import { getProjects, getBranches, resetToMockData, clearAllData } from "@/app/data/dataService";
import { styleOptions } from "@/app/data/mockData";
import { toast } from "sonner";

const PROFILE_KEY = "genvo_profile";
const DEFAULT_SETTINGS_KEY = "genvo_default_settings";

interface UserProfile {
  displayName: string;
  avatarSeed: string;
  bio: string;
}

interface DefaultGenerationSettings {
  model: string;
  style: string;
  aspectRatio: string;
  duration: number;
}

function getProfile(): UserProfile {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return { displayName: "", avatarSeed: "user", bio: "" };
  }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getDefaultSettings(): DefaultGenerationSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(DEFAULT_SETTINGS_KEY) || "{}");
    return {
      model: saved.model || "veo3",
      style: saved.style || "Cinematic",
      aspectRatio: saved.aspectRatio || "16:9",
      duration: saved.duration || 5,
    };
  } catch {
    return { model: "veo3", style: "Cinematic", aspectRatio: "16:9", duration: 5 };
  }
}

function saveDefaultSettings(settings: DefaultGenerationSettings) {
  localStorage.setItem(DEFAULT_SETTINGS_KEY, JSON.stringify(settings));
}

type SettingsSection = "api" | "profile" | "generation" | "data";

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("api");

  // API Key state
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("user");
  const [bio, setBio] = useState("");

  // Default generation settings
  const [defaultModel, setDefaultModel] = useState("veo3");
  const [defaultStyle, setDefaultStyle] = useState("Cinematic");
  const [defaultAspectRatio, setDefaultAspectRatio] = useState("16:9");
  const [defaultDuration, setDefaultDuration] = useState(5);

  // Data management
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [dataStats, setDataStats] = useState({ projects: 0, branches: 0 });

  useEffect(() => {
    const configured = isApiKeyConfigured();
    setHasKey(configured);
    if (configured) setSavedKey(getApiKey());

    const profile = getProfile();
    setDisplayName(profile.displayName || "");
    setAvatarSeed(profile.avatarSeed || "user");
    setBio(profile.bio || "");

    const defaults = getDefaultSettings();
    setDefaultModel(defaults.model);
    setDefaultStyle(defaults.style);
    setDefaultAspectRatio(defaults.aspectRatio);
    setDefaultDuration(defaults.duration);

    setDataStats({
      projects: getProjects().length,
      branches: getBranches().length,
    });
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasKey(true);
      setSavedKey(apiKey.trim());
      setApiKey("");
      setSaveSuccess(true);
      toast.success("API key saved successfully");
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setHasKey(false);
    setSavedKey(null);
    toast.success("API key removed");
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  };

  const handleSaveProfile = () => {
    saveProfile({ displayName, avatarSeed, bio });
    toast.success("Profile saved");
  };

  const handleSaveDefaults = () => {
    saveDefaultSettings({
      model: defaultModel,
      style: defaultStyle,
      aspectRatio: defaultAspectRatio,
      duration: defaultDuration,
    });
    toast.success("Default settings saved");
  };

  const handleReset = () => {
    resetToMockData();
    setDataStats({ projects: getProjects().length, branches: getBranches().length });
    setShowResetDialog(false);
    toast.success("Data reset to sample projects");
  };

  const handleClearAll = () => {
    clearAllData();
    setDataStats({ projects: 0, branches: 0 });
    setShowClearDialog(false);
    toast.success("All data cleared");
  };

  const handleExportData = () => {
    const data = {
      projects: getProjects(),
      branches: getBranches(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genvo-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const sections: { key: SettingsSection; label: string; icon: typeof Key; description: string }[] = [
    { key: "api", label: "API Keys", icon: Key, description: "Configure your fal.ai API key" },
    { key: "profile", label: "Profile", icon: User, description: "Your display name and avatar" },
    { key: "generation", label: "Generation Defaults", icon: Settings2, description: "Default model and style settings" },
    { key: "data", label: "Data Management", icon: Database, description: "Export, reset, or clear data" },
  ];

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Settings</h1>
        <p className="text-black/60 dark:text-white/60">
          Configure your preferences and API keys
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-56 flex-shrink-0"
        >
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeSection === section.key
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span>{section.label}</span>
                {activeSection !== section.key && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                )}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 max-w-2xl"
        >

          {/* API Keys */}
          {activeSection === "api" && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                  <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-1">
                    Bring Your Own Key
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Add your fal.ai API key to generate real videos
                  </p>
                </div>
              </div>

              {hasKey ? (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">API Key Active</p>
                        <p className="text-sm text-green-600/70 dark:text-green-400/70 font-mono">
                          {savedKey ? maskKey(savedKey) : "••••••••"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearApiKey}
                      className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">No API Key</p>
                      <p className="text-sm text-yellow-600/70 dark:text-yellow-400/70">
                        Running in demo mode with simulated generation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">fal.ai API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showKey ? "text" : "password"}
                        placeholder={hasKey ? "Enter new key to replace existing" : "Enter your fal.ai API key"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                        className="pr-10 bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      onClick={handleSaveApiKey}
                      disabled={!apiKey.trim()}
                      className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                    >
                      {hasKey ? "Update" : "Save"}
                    </Button>
                  </div>
                </div>

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    API key saved successfully!
                  </motion.div>
                )}

                <a
                  href="https://fal.ai/dashboard/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Get your API key from fal.ai
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Available Models */}
              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                <h3 className="font-medium text-black dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Available Models
                </h3>
                <div className="grid gap-3">
                  {Object.entries(VIDEO_MODELS).map(([key, model]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-black dark:text-white">{model.name}</p>
                        <p className="text-sm text-black/50 dark:text-white/50">{model.description}</p>
                      </div>
                      <span className="text-sm font-mono text-black/40 dark:text-white/40">
                        {model.costPerVideo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Your API key is stored locally in your browser and is never sent to our servers.
                  All video generation requests are made directly from your browser to fal.ai.
                </p>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeSection === "profile" && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-1">Profile</h2>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Customize how you appear in the app
                  </p>
                </div>
              </div>

              {/* Avatar preview */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || "user"}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-2 border-white dark:border-zinc-800"
                />
                <div>
                  <p className="font-medium text-black dark:text-white">
                    {displayName || "Your Name"}
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    {bio || "No bio yet"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avatar Style</Label>
                  <Input
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    placeholder="Enter a word to generate your avatar (e.g. user, alice, neo)"
                    className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                  />
                  <p className="text-xs text-black/40 dark:text-white/40">
                    Type any word to change your avatar style
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A short description about yourself"
                    className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                >
                  Save Profile
                </Button>
              </div>
            </div>
          )}

          {/* Generation Defaults */}
          {activeSection === "generation" && (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Settings2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-1">
                    Generation Defaults
                  </h2>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Pre-fill your preferred settings for new generations
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Default AI Model</Label>
                  <Select value={defaultModel} onValueChange={setDefaultModel}>
                    <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VIDEO_MODELS).map(([key, m]) => (
                        <SelectItem key={key} value={key}>
                          {m.name} — {m.costPerVideo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Style</Label>
                  <Select value={defaultStyle} onValueChange={setDefaultStyle}>
                    <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Aspect Ratio</Label>
                  <div className="flex gap-3">
                    {(["16:9", "9:16", "1:1"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setDefaultAspectRatio(ratio)}
                        className={`flex-1 py-2.5 px-3 rounded-lg border text-sm transition-all ${
                          defaultAspectRatio === ratio
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                            : "bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Default Duration</Label>
                    <span className="text-sm text-black/60 dark:text-white/60">{defaultDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={1}
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(Number(e.target.value))}
                    className="w-full accent-black dark:accent-white"
                  />
                  <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
                    <span>3s</span>
                    <span>15s</span>
                  </div>
                </div>

                <Button
                  onClick={handleSaveDefaults}
                  className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
                >
                  Save Defaults
                </Button>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeSection === "data" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white mb-1">
                      Data Management
                    </h2>
                    <p className="text-sm text-black/60 dark:text-white/60">
                      Export, reset, or clear your local data
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-black dark:text-white">{dataStats.projects}</p>
                    <p className="text-xs text-black/50 dark:text-white/50 mt-1">Projects</p>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-black dark:text-white">{dataStats.branches}</p>
                    <p className="text-xs text-black/50 dark:text-white/50 mt-1">Branches</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Export */}
                  <div className="flex items-center justify-between p-4 border border-black/5 dark:border-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-black/60 dark:text-white/60" />
                      <div>
                        <p className="font-medium text-black dark:text-white text-sm">Export Data</p>
                        <p className="text-xs text-black/50 dark:text-white/50">Download all your projects as JSON</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      className="border-black/10 dark:border-white/10"
                    >
                      Export
                    </Button>
                  </div>

                  {/* Reset to sample data */}
                  <div className="flex items-center justify-between p-4 border border-yellow-500/20 rounded-xl bg-yellow-500/5">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-medium text-yellow-600 dark:text-yellow-400 text-sm">Reset to Sample Data</p>
                        <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                          Restore the original demo projects
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetDialog(true)}
                      className="border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Clear all data */}
                  <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-500 text-sm">Clear All Data</p>
                        <p className="text-xs text-red-500/70">
                          Permanently delete all projects and branches
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearDialog(true)}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                  <p className="text-xs text-black/60 dark:text-white/60">
                    All data is stored locally in your browser (localStorage). Nothing is sent to any server.
                    Clearing browser data or localStorage will also remove your projects.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to Sample Data</DialogTitle>
            <DialogDescription>
              This will replace all your current projects with the original demo data.
              Any projects you've created will be lost. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button onClick={handleReset} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all {dataStats.projects} projects and {dataStats.branches} branches.
              This action cannot be undone. You'll start with a completely empty workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>Cancel</Button>
            <Button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
