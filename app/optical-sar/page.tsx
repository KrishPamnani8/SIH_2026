"use client";

import WorkspaceGrid from "@/components/WorkspaceGrid";

export default function OpticalSarPage() {
  return (
    <div className="space-y-6">
      <div className="px-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-800">Optical + SAR Cross-Modal Analysis</h1>
        <p className="text-sm text-slate-500">Joint analysis of optical/multispectral imagery paired with Synthetic Aperture Radar (SAR) backscatter data.</p>
      </div>
      <WorkspaceGrid mode="optical-sar" />

    </div>
  );
}
