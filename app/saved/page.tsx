"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function SavedResultsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Results</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400 font-medium text-sm">Your bookmarked and saved satellite image analysis reports.</p>
      </div>
      
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 backdrop-blur-md transition-colors">
        <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 w-16 h-16 mx-auto flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Saved Reports Yet</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Analyze a satellite image on the home dashboard or specialist workspace and click &quot;Save Report&quot; to access them here.
        </p>
      </div>
    </div>

  );
}
