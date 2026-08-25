"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface SamplePreset {
  id: string;
  name: string;
  clc_code: string;
  query: string;
  category: string;
  png_url: string;
  filename: string;
}

interface SamplePresetsProps {
  mode?: "single" | "change" | "optical-sar";
  onSelectSample: (file: File, query: string, secondFile?: File) => void;
}

export default function SamplePresets({ mode = "single", onSelectSample }: SamplePresetsProps) {
  const [samples, setSamples] = useState<SamplePreset[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/samples/manifest.json")
      .then((res) => res.json())
      .then((data) => setSamples(data))
      .catch((err) => console.warn("Failed to load sample presets manifest:", err));
  }, []);

  const handlePresetClick = async (preset: SamplePreset) => {
    setLoadingId(preset.id);
    try {
      if (mode === "change") {
        // Fetch Before & After pair
        const res1 = await fetch("/samples/S2B_MSIL2A_20180524T101021_64_75_Dense_Forest.png");
        const res2 = await fetch("/samples/S2B_MSIL2A_20180524T101021_12_44_Urban_Fabric.png");
        const blob1 = await res1.blob();
        const blob2 = await res2.blob();
        const file1 = new File([blob1], "S2B_MSIL2A_20200812_Forest_Before.png", { type: "image/png" });
        const file2 = new File([blob2], "S2B_MSIL2A_20240812_Urban_After.png", { type: "image/png" });
        onSelectSample(file1, "Compare these two satellite images for bi-temporal land-use changes", file2);
      } else if (mode === "optical-sar") {
        const res1 = await fetch(preset.png_url);
        const res2 = await fetch("/samples/S2B_MSIL2A_20180524T101021_32_18_Water_Bodies.png");
        const blob1 = await res1.blob();
        const blob2 = await res2.blob();
        const file1 = new File([blob1], preset.filename, { type: "image/png" });
        const file2 = new File([blob2], "Sentinel1_SAR_Radar_Backscatter.png", { type: "image/png" });
        onSelectSample(file1, "Analyze the optical and SAR images together for flooding evidence", file2);
      } else {
        const res = await fetch(preset.png_url);
        const blob = await res.blob();
        const file = new File([blob], preset.filename, { type: "image/png" });
        onSelectSample(file, preset.query);
      }
    } catch (e) {
      console.error("Error fetching preset sample file:", e);
    } finally {
      setLoadingId(null);
    }
  };

  if (samples.length === 0) return null;

  return (
    <div className="w-full space-y-2 mb-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
          <Sparkles size={14} /> 1-Click BigEarthNet Sentinel-2 Preset Samples
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Click tile to load & analyze</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {samples.slice(0, 4).map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset)}
            disabled={loadingId !== null}
            className="group relative flex flex-col items-center border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-2 text-left transition-all shadow-2xs hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            <div className="relative w-full h-16 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-slate-950 mb-1.5">
              <img src={preset.png_url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                CLC #{preset.clc_code}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {preset.name}
            </p>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 inline-flex items-center gap-0.5">
              {loadingId === preset.id ? "Loading..." : "Load Sample"} <ArrowRight size={10} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
