"use client";

import WorkspaceGrid from "@/components/WorkspaceGrid";

export default function SingleImagePage() {
  return (
    <div className="space-y-6">
      <div className="px-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">Single Image Analysis</h1>
        <p className="text-sm text-slate-500">Visual Question Answering (VQA), scene captioning, and text-guided feature grounding.</p>
      </div>
      <WorkspaceGrid mode="single" />

    </div>
  );
}
