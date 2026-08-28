"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-800 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner cursor-pointer"
      title="Toggle Light / Dark Mode"
    >
      <Sun size={14} className="text-amber-500 absolute left-2" />
      <Moon size={14} className="text-purple-400 absolute right-2" />
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 z-10 ${
          isDark ? "translate-x-8 bg-slate-900" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}

