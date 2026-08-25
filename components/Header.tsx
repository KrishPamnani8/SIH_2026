"use client";

import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AboutDropdown from "./AboutDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-8 py-3.5 shadow-xs transition-colors">
      {/* Left – Tagline & Status */}
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Satellite Intelligence Workspace</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Ask. Analyze. Understand Earth.</span>
      </div>


      {/* Right – controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AboutDropdown />
      </div>
    </header>
  );
}

