import { motion } from "motion/react";
import { CliTerminal } from "./CliTerminal";
import { Terminal, MonitorSmartphone, HardDrive } from "lucide-react";

const pills = [
  { icon: Terminal, label: "CLI" },
  { icon: MonitorSmartphone, label: "GUI" },
  { icon: HardDrive, label: "Local-first" },
];

export function CliSection() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Pills */}
            <div className="flex gap-3 mb-6">
              {pills.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Works where
              <br />
              <span className="text-white/40">you work.</span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed mb-8">
              Use the GUI for exploration, or drop into the CLI for scripted
              pipelines and CI/CD integration. Either way, your videos and
              version history stay{" "}
              <span className="text-white/80 font-medium">100% local</span> —
              no cloud upload required.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Full CLI parity",
                  desc: "Every GUI action has a CLI equivalent. Scriptable, composable, pipeable.",
                },
                {
                  title: "Files on your disk",
                  desc: "Videos stored in .genvo/ alongside your project. Git-ignored or committed — your call.",
                },
                {
                  title: "Works offline",
                  desc: "All version history, diffs, and branches work without internet. Only generation needs a connection.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <CliTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
