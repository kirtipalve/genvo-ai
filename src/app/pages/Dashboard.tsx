import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Video, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ProjectCard } from "@/app/components/ProjectCard";
import { getProjects } from "@/app/data/dataService";
import type { Project } from "@/app/data/mockData";

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const completedCount = projects.filter((p) => p.status === "completed").length;
  const totalViews = projects.reduce((acc, p) => acc + p.views, 0);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Dashboard
        </h1>
        <p className="text-black/60 dark:text-white/60 mt-1">
          Manage your AI video projects
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Total Projects</p>
              <p className="text-2xl font-bold text-black dark:text-white">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Completed</p>
              <p className="text-2xl font-bold text-black dark:text-white">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">Total Views</p>
              <p className="text-2xl font-bold text-black dark:text-white">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Your Projects
        </h2>
        <Link to="/new">
          <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </motion.div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10"
        >
          <Video className="w-12 h-12 mx-auto text-black/30 dark:text-white/30 mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Create your first AI video project to get started
          </p>
          <Link to="/new">
            <Button className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
