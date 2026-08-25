"use client";

import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AboutDropdown from "./AboutDropdown";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 px-4 py-2 shadow-sm">
      {/* Left – logo */}
      <div className="flex items-center gap-2">
        <Sparkles className="text-indigo-600" size={24} />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          SatQuery AI
        </h1>
      </div>

      {/* Center – tagline (hidden on small screens) */}
      <div className="hidden md:block text-slate-500 dark:text-slate-300">
        <Sparkles className="inline-block mr-1" size={18} />
        Ask. Analyze. Understand Earth.
      </div>

      {/* Right – controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AboutDropdown />
      </div>
    </header>
  );
}
