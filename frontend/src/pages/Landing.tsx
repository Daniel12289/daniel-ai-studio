import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { StatusConsole } from "../components/StatusConsole";
import { useState } from "react";

const EXAMPLES = [
  "Build a modern portfolio website",
  "Create a restaurant ordering site with Firebase",
  "Build a chat application",
  "Make a school management dashboard",
];

export default function Landing() {
  const [demoActive, setDemoActive] = useState(true);

  return (
    <div className="min-h-screen bg-ink">
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber" size={20} />
          <span className="font-display font-semibold">Daniel AI Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-ash-300 hover:text-ash-50">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm !py-2">Start building</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="label text-amber">natural language → shipped project</span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold mt-3 leading-tight">
            Describe it. Watch it build.
          </h1>
          <p className="text-ash-500 mt-4 text-base leading-relaxed max-w-md">
            Daniel AI Studio turns a plain-English prompt into a complete website or app —
            full file tree, live preview, and a code editor to keep shaping it with follow-up prompts.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/signup" className="btn-primary">
              Start building <ArrowRight size={16} />
            </Link>
            <Link to="/templates" className="btn-secondary">Browse templates</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="card p-5"
          onMouseEnter={() => setDemoActive(true)}
        >
          <p className="font-mono text-xs text-ash-500 mb-3">
            <span className="text-cyan">$</span> {EXAMPLES[0]}
          </p>
          <StatusConsole active={demoActive} />
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <p className="label mb-4">try a prompt like</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {EXAMPLES.map((ex) => (
            <div key={ex} className="card px-4 py-3 text-sm text-ash-300 font-mono">"{ex}"</div>
          ))}
        </div>
      </section>
    </div>
  );
}
