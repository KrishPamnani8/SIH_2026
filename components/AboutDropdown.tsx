"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Info } from "lucide-react";

export default function AboutDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950/80 px-3.5 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors shadow-2xs cursor-pointer"
      >
        About SatQuery <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4.5 z-50 transition-all">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
            <Info size={16} className="text-purple-600 dark:text-purple-400" /> About SatQuery AI
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            SatQuery AI is an agentic remote-sensing assistant for Earth Observation imagery analysis, visual grounding, change detection, and multi-spectral classification.
          </p>
        </div>
      )}
    </div>
  );
}

