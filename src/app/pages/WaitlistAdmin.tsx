import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Download, Users, Trash2 } from "lucide-react";
import {
  getWaitlist,
  exportWaitlist,
  clearWaitlist,
  getWaitlistCount,
  type WaitlistEntry,
} from "@/app/services/waitlistService";

export function WaitlistAdmin() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [count, setCount] = useState(0);

  const loadWaitlist = () => {
    setWaitlist(getWaitlist());
    setCount(getWaitlistCount());
  };

  useEffect(() => {
    loadWaitlist();
  }, []);

  const handleExport = () => {
    const csv = exportWaitlist();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genvo-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all waitlist entries? This cannot be undone."
      )
    ) {
      clearWaitlist();
      loadWaitlist();
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-black/60 dark:text-white/60">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                Waitlist Admin
              </h1>
              <p className="text-black/60 dark:text-white/60">
                Manage and export your waitlist entries
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <Users className="w-5 h-5 text-black dark:text-white" />
                <span className="text-2xl font-bold text-black dark:text-white">
                  {count}
                </span>
                <span className="text-sm text-black/60 dark:text-white/60">
                  {count === 1 ? "entry" : "entries"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <Button
            onClick={handleExport}
            disabled={count === 0}
            className="bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>

          <Button
            onClick={handleClear}
            disabled={count === 0}
            variant="outline"
            className="border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </motion.div>

        {/* Waitlist Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden"
        >
          {count === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                No entries yet
              </h3>
              <p className="text-black/60 dark:text-white/60 mb-6">
                Waitlist entries will appear here once people sign up
              </p>
              <Link to="/waitlist">
                <Button>Go to Waitlist Page</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="text-left p-4 text-sm font-semibold text-black dark:text-white">
                      Name
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-black dark:text-white">
                      Email
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-black dark:text-white">
                      Role
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-black dark:text-white">
                      Use Case
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-black dark:text-white">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry, index) => (
                    <tr
                      key={index}
                      className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-sm text-black dark:text-white">
                        {entry.name}
                      </td>
                      <td className="p-4 text-sm text-black/70 dark:text-white/70">
                        {entry.email}
                      </td>
                      <td className="p-4 text-sm text-black/70 dark:text-white/70">
                        <span className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs">
                          {entry.role
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-black/70 dark:text-white/70 max-w-xs truncate">
                        {entry.useCase || "-"}
                      </td>
                      <td className="p-4 text-sm text-black/50 dark:text-white/50 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl"
        >
          <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
            How to access
          </h3>
          <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
            This admin view is accessible at <code className="px-2 py-1 bg-blue-500/20 rounded text-xs">/waitlist/admin</code>.
            Data is stored in browser localStorage. For production, integrate with a backend service.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
