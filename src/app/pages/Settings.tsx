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
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  isApiKeyConfigured,
  saveApiKey,
  clearApiKey,
  getApiKey,
  VIDEO_MODELS,
} from "@/app/services/videoGeneration";

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const configured = isApiKeyConfigured();
    setHasKey(configured);
    if (configured) {
      const key = getApiKey();
      setSavedKey(key);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasKey(true);
      setSavedKey(apiKey.trim());
      setApiKey("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setHasKey(false);
    setSavedKey(null);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-black/60 dark:text-white/60 mb-8">
          Configure your API keys and preferences
        </p>
      </motion.div>

      {/* API Key Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 p-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
            <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-1">
              Bring Your Own Key
            </h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Add your fal.ai API key to generate real videos with AI models
            </p>
          </div>
        </div>

        {/* Current Status */}
        {hasKey ? (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    API Key Configured
                  </p>
                  <p className="text-sm text-green-600/70 dark:text-green-400/70 font-mono">
                    {savedKey ? maskKey(savedKey) : "••••••••"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
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
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  No API Key
                </p>
                <p className="text-sm text-yellow-600/70 dark:text-yellow-400/70">
                  Running in demo mode with simulated generation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">fal.ai API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your fal.ai API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10 bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={handleSave}
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
                  <p className="font-medium text-black dark:text-white">
                    {model.name}
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    {model.description}
                  </p>
                </div>
                <span className="text-sm font-mono text-black/40 dark:text-white/40">
                  {model.costPerVideo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
          <p className="text-sm text-black/60 dark:text-white/60">
            Your API key is stored locally in your browser and is never sent to
            our servers. All video generation requests are made directly from
            your browser to fal.ai.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
