import React, { useState } from 'react';
import {
  UploadCloud,
  Layers,
  Sparkles,
  Play,
  CheckCircle2,
  FileCode,
  Radio,
  Clock,
} from 'lucide-react';
import type { AnalysisMode, DemoPreset, GeoTIFFMetadata, ThemeMode } from '../types/satquery';
import { DEMO_PRESETS } from '../services/mockAnalysisService';

interface LeftPanelProps {
  mode: AnalysisMode;
  onSelectMode: (mode: AnalysisMode) => void;
  query: string;
  onChangeQuery: (q: string) => void;
  metadata: GeoTIFFMetadata;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
  activePresetId?: string;
  theme: ThemeMode;
}

const SAMPLE_PROMPTS: Record<AnalysisMode, string[]> = {
  single: [
    'Describe the major land-cover features and calculate water surface area.',
    'Highlight water bodies and dense forest boundaries.',
    'Segment urban structures vs bare soil agricultural parcels.',
  ],
  cross_modal: [
    'Identify flooded regions obscured under cloud canopy.',
    'Detect sub-canopy water logging combining Sentinel-1 SAR backscatter.',
    'Fuse Optical RGB and Dual-Pol SAR to locate urban levees.',
  ],
  bi_temporal: [
    'What changed between 2024 and 2026 in the urban sector?',
    'Quantify urban footprint growth and vegetation canopy loss.',
    'Identify reservoir surface area expansion between T1 and T2.',
  ],
};

export const LeftPanel: React.FC<LeftPanelProps> = ({
  mode,
  onSelectMode,
  query,
  onChangeQuery,
  metadata,
  isAnalyzing,
  onAnalyze,
  onSelectPreset,
  activePresetId,
  theme,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const isDark = theme === 'dark';

  // Trigger step progress mock when analyzing starts
  React.useEffect(() => {
    if (isAnalyzing) {
      setAnalyzingStep(1);
      const timer1 = setTimeout(() => setAnalyzingStep(2), 150);
      const timer2 = setTimeout(() => setAnalyzingStep(3), 320);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setAnalyzingStep(0);
    }
  }, [isAnalyzing]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const cardBg = isDark
    ? 'bg-slate-900/80 border-slate-800'
    : 'bg-white border-slate-200 shadow-sm';
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-700';

  return (
    <div className="space-y-5 flex flex-col h-full overflow-y-auto pr-1">
      {/* Mode Selector Tabs */}
      <div className={`p-1.5 rounded-xl border ${cardBg}`}>
        <label className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 block ${labelColor}`}>
          1. Select Modality Mode
        </label>
        <div className="grid grid-cols-3 gap-1 mt-1">
          <button
            onClick={() => onSelectMode('single')}
            className={`px-2 py-2 rounded-lg text-xs font-semibold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Single Image</span>
          </button>

          <button
            onClick={() => onSelectMode('cross_modal')}
            className={`px-2 py-2 rounded-lg text-xs font-semibold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              mode === 'cross_modal'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Optical + SAR</span>
          </button>

          <button
            onClick={() => onSelectMode('bi_temporal')}
            className={`px-2 py-2 rounded-lg text-xs font-semibold flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              mode === 'bi_temporal'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Bi-Temporal</span>
          </button>
        </div>
      </div>

      {/* Preset Evaluation Scenarios */}
      <div className={`p-3 rounded-xl border ${cardBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold flex items-center space-x-1.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>ISRO Hackathon Demo Presets</span>
          </span>
          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1-Click Test</span>
        </div>
        <div className="space-y-1.5">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`w-full text-left p-2 rounded-lg border transition-all flex items-start justify-between cursor-pointer ${
                activePresetId === preset.id
                  ? isDark
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                    : 'bg-sky-50 border-sky-400 text-sky-800 font-semibold shadow-sm'
                  : isDark
                  ? 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div>
                <div className="text-xs font-semibold flex items-center space-x-2">
                  <span>{preset.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {preset.datasetTag}
                  </span>
                </div>
                <p className={`text-[11px] truncate max-w-[200px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {preset.question}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Ingestion Dropzone & GeoTIFF Metadata Inspector */}
      <div className={`p-3.5 rounded-xl border ${cardBg} space-y-3`}>
        <div className="flex items-center justify-between">
          <label className={`text-[11px] font-bold uppercase tracking-wider ${labelColor}`}>
            2. Satellite Imagery Ingestion
          </label>
          <span className={`text-[10px] font-mono ${isDark ? 'text-sky-400' : 'text-sky-600 font-semibold'}`}>GeoTIFF / PNG / JPG</span>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-sky-400 bg-sky-500/10'
              : isDark
              ? 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/60'
          }`}
        >
          <UploadCloud className={`w-7 h-7 mx-auto mb-1.5 animate-bounce ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Drag & Drop Satellite Image
          </p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Auto-detects EPSG projection, bands & raster spatial resolution
          </p>
        </div>

        {/* Metadata Inspector Card */}
        <div className={`border rounded-lg p-2.5 space-y-1.5 font-mono text-[11px] ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100/90 border-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-1 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'}`}>
            <span className={`flex items-center space-x-1 font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
              <FileCode className="w-3.5 h-3.5" />
              <span>GeoTIFF Inspector</span>
            </span>
            <span className={`text-[10px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Valid Spatial CRS</span>
          </div>

          <div className="grid grid-cols-2 gap-y-1">
            <div>
              <span className={`block text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>FILE:</span>
              <span className={`truncate block font-semibold text-[10px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`} title={metadata.fileName}>
                {metadata.fileName}
              </span>
            </div>
            <div>
              <span className={`block text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>CRS PROJECTION:</span>
              <span className={`font-semibold text-[10px] ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{metadata.crs}</span>
            </div>
            <div>
              <span className={`block text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>BANDS:</span>
              <span className={`text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{metadata.bands.length} Bands ({metadata.bands[0]})</span>
            </div>
            <div>
              <span className={`block text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>RESOLUTION:</span>
              <span className={`text-[10px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{metadata.resolution}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Prompt & Sample Quick Chips */}
      <div className={`p-3.5 rounded-xl border ${cardBg} space-y-3`}>
        <label className={`text-[11px] font-bold uppercase tracking-wider block ${labelColor}`}>
          3. Natural Language Query Prompt
        </label>

        <textarea
          rows={3}
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="Ask a question about the satellite scene (e.g. Describe land cover features, calculate water area, locate flooded regions under clouds)..."
          className={`w-full border rounded-lg p-2.5 text-xs transition-colors resize-none ${
            isDark
              ? 'bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-sky-500'
              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-600'
          }`}
        />

        {/* Sample Prompt Chips */}
        <div>
          <span className={`text-[10px] block mb-1.5 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Suggested Remote Sensing Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS[mode].map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => onChangeQuery(promptText)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-all text-left truncate max-w-full cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                "{promptText}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analyze Action Button */}
      <div className="pt-1">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !query.trim()}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            isAnalyzing || !query.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-white hover:opacity-95 shadow-sky-500/25 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Satellite Image...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Satellite Image</span>
            </div>
          )}
        </button>

        {/* Loading Step Progress */}
        {isAnalyzing && (
          <div className={`mt-3 p-2.5 rounded-lg border space-y-1.5 font-mono text-[10px] ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <div className={`flex items-center space-x-2 ${analyzingStep >= 1 ? (isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold') : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>1. Extracting Multi-Spectral & SAR Tensors</span>
            </div>
            <div className={`flex items-center space-x-2 ${analyzingStep >= 2 ? (isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold') : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>2. Fusing Dual-Branch ViT Cross-Attention</span>
            </div>
            <div className={`flex items-center space-x-2 ${analyzingStep >= 3 ? (isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold') : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>3. Grounding DINO + SAM-GRI Reliability Index</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
