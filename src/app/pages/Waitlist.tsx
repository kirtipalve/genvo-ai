import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Progress } from "@/app/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import { addToWaitlist, getWaitlistCount } from "@/app/services/waitlistService";
import { MeshGradient } from "@/app/components/MeshGradient";
import { AnimatedGrid } from "@/app/components/AnimatedGrid";

const BASE_OFFSET = 200;
const TOTAL_SPOTS = 500;

export function Waitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [claimedCount, setClaimedCount] = useState(() => getWaitlistCount() + BASE_OFFSET);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !role) {
      setError("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    addToWaitlist({
      name: name.trim(),
      email: email.trim(),
      role,
      useCase: useCase.trim(),
      timestamp: new Date().toISOString(),
    });

    setClaimedCount(getWaitlistCount() + BASE_OFFSET);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-500 relative overflow-hidden">
        <MeshGradient />
        <AnimatedGrid />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              You're on the list!
            </h1>

            <p className="text-lg text-black/60 dark:text-white/60 mb-8">
              We'll reach out soon with early access to Genvo. Keep an eye on your inbox at{" "}
              <span className="font-medium text-black dark:text-white">{email}</span>
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" className="border-black/10 dark:border-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black">
                  Try Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-500 relative overflow-hidden py-12">
      <MeshGradient />
      <AnimatedGrid />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <Button variant="ghost" size="sm" className="text-black/60 dark:text-white/60">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-8 h-8 text-black dark:text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Join the Waitlist
            </h1>

            <p className="text-lg text-black/60 dark:text-white/60">
              Be the first to experience Git-like version control for AI video
            </p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-8 space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-black dark:text-white">
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black dark:text-white">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-black dark:text-white">
                Role *
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content-creator">Content Creator</SelectItem>
                  <SelectItem value="marketing">Marketing Team</SelectItem>
                  <SelectItem value="agency">Agency / Studio</SelectItem>
                  <SelectItem value="developer">Developer / AI Engineer</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase" className="text-black dark:text-white">
                What would you use Genvo for? (Optional)
              </Label>
              <Textarea
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g., Managing social media video variations, A/B testing video ads, collaborating with team on AI video projects..."
                rows={4}
                className="bg-white dark:bg-white/5 border-black/10 dark:border-white/10 resize-none"
              />
            </div>

            {/* Spots counter */}
            <div className="p-4 bg-black/3 dark:bg-white/3 border border-black/8 dark:border-white/8 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/70 dark:text-white/70 font-medium">
                  {claimedCount} of {TOTAL_SPOTS} early access spots claimed
                </span>
                <span className="text-black/40 dark:text-white/40">
                  {TOTAL_SPOTS - claimedCount} left
                </span>
              </div>
              <Progress value={(claimedCount / TOTAL_SPOTS) * 100} className="h-1.5" />
            </div>

            <Button
              type="submit"
              className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-6 text-lg"
            >
              Join Waitlist
            </Button>

            <p className="text-xs text-center text-black/40 dark:text-white/40">
              We respect your privacy. Your information will only be used to contact you about Genvo.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
