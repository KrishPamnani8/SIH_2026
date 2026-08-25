"use client";

import { Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 dark:from-purple-950/80 dark:via-indigo-950/80 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 text-slate-900 dark:text-white shadow-md w-full transition-colors">
      {/* Earth + satellite illustration */}
      <img
        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80"
        alt="Earth from space with satellite"
        className="absolute top-1/2 right-8 w-64 h-64 object-cover translate-y-[-50%] rounded-2xl border border-white/20 dark:border-slate-700/40 opacity-85 shadow-lg hidden sm:block"
      />

      {/* Text content */}
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-xs font-bold mb-3 uppercase tracking-wider">
          <Sparkles size={14} /> AI-Powered Remote Sensing Assistant
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
          Welcome to SatQuery AI
        </h2>
        <p className="text-base text-slate-700 dark:text-slate-300 mb-5 font-medium leading-relaxed">
          Your interactive AI platform for multi-spectral Earth Observation analysis, visual grounding, change detection, and SAR fusion.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs">
            💬 Ask in Natural Language
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs">
            🛰️ Multi-Spectral & SAR
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs">
            🛡️ Verifiable Evidence & Trace
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-xs">
            📥 PDF Report Export
          </span>
        </div>
      </div>
    </section>
  );
}

