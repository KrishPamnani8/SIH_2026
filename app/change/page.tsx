"use client";

import WorkspaceGrid from "@/components/WorkspaceGrid";

export default function ChangeDetectionPage() {
  return (
    <div className="space-y-6">
      <div className="px-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">Bi-Temporal Change Detection</h1>
        <p className="text-sm text-slate-500">Compare two spatially corresponding satellite images to track land-use changes, urban expansion, and vegetation loss over time.</p>
      </div>
      <WorkspaceGrid mode="change" />

    </div>
  );
}
