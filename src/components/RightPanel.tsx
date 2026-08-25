import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle,
  Download,
  Cpu,
  Globe2,
  Sparkles,
  PieChart,
} from 'lucide-react';
import type { AnalysisResult, ThemeMode } from '../types/satquery';
import { downloadAnalysisPDFReport, downloadGeoJSONReport } from '../utils/reportExporter';
import confetti from 'canvas-confetti';

interface RightPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  theme: ThemeMode;
}

export const RightPanel: React.FC<RightPanelProps> = ({ result, isAnalyzing, theme }) => {
  const isDark = theme === 'dark';

  const handleDownloadPDF = () => {
    if (!result) return;
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    downloadAnalysisPDFReport(result);
  };

  const handleDownloadGeoJSON = () => {
    if (!result) return;
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    downloadGeoJSONReport(result);
  };

  const cardBg = isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  if (isAnalyzing) {
    return (
      <div className={`p-6 rounded-2xl border ${cardBg} h-full flex flex-col items-center justify-center space-y-4 text-center`}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
          <Cpu className={`w-6 h-6 absolute inset-0 m-auto animate-pulse ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Evaluating Satellite Tensors...</h3>
          <p className={`text-xs mt-1 max-w-[220px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Synthesizing vision-language grounding, SAM-GRI attribution, and spatial bounding boxes.
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`p-6 rounded-2xl border ${cardBg} h-full flex flex-col items-center justify-center space-y-3 text-center`}>
        <Sparkles className={`w-10 h-10 opacity-60 animate-bounce ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
        <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Awaiting Query Analysis</h3>
        <p className={`text-xs max-w-[220px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Select a mode or demo preset and click "Analyze Satellite Image" to view evidence-grounded insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full overflow-y-auto pr-1">
      {/* Evidence-Grounded Text Answer Box */}
      <div className={`p-4 rounded-xl border ${cardBg} space-y-3 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Evidence-Grounded Intelligence
            </h3>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
            isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-100 text-sky-800 border-sky-300 font-semibold'
          }`}>
            {result.confidenceScore}% Confidence
          </span>
        </div>

        {/* Answer Text */}
        <p className={`text-xs leading-relaxed font-sans font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {result.answerText}
        </p>

        {/* Structured Observation Bullet Points */}
        <div className={`space-y-1.5 pt-1 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          {result.bulletPoints.map((pt, idx) => (
            <div key={idx} className={`flex items-start space-x-2 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LULC Composition Breakdown Bar Chart */}
      <div className={`p-4 rounded-xl border ${cardBg} space-y-3 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              LULC Composition Breakdown
            </h3>
          </div>
          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CORINE Standard</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className={`h-3 w-full rounded-full overflow-hidden flex shadow-inner ${isDark ? 'bg-slate-950' : 'bg-slate-200'}`}>
          <div
            style={{ width: `${result.lulc.water}%` }}
            className="bg-[#0284c7] h-full transition-all duration-500"
            title={`Water Body: ${result.lulc.water}%`}
          />
          <div
            style={{ width: `${result.lulc.denseVeg}%` }}
            className="bg-[#10b981] h-full transition-all duration-500"
            title={`Dense Vegetation: ${result.lulc.denseVeg}%`}
          />
          <div
            style={{ width: `${result.lulc.urban}%` }}
            className="bg-[#f43f5e] h-full transition-all duration-500"
            title={`Urban Fabric: ${result.lulc.urban}%`}
          />
          <div
            style={{ width: `${result.lulc.agriculture}%` }}
            className="bg-[#f59e0b] h-full transition-all duration-500"
            title={`Agricultural Land: ${result.lulc.agriculture}%`}
          />
          <div
            style={{ width: `${result.lulc.bareSoil}%` }}
            className="bg-[#d97706] h-full transition-all duration-500"
            title={`Bare Soil: ${result.lulc.bareSoil}%`}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className={`flex items-center justify-between p-1.5 rounded border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Water Body</span>
            </span>
            <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>{result.lulc.water}%</span>
          </div>

          <div className={`flex items-center justify-between p-1.5 rounded border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Dense Veg</span>
            </span>
            <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{result.lulc.denseVeg}%</span>
          </div>

          <div className={`flex items-center justify-between p-1.5 rounded border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Urban Fabric</span>
            </span>
            <span className={`font-bold ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>{result.lulc.urban}%</span>
          </div>

          <div className={`flex items-center justify-between p-1.5 rounded border ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Agriculture</span>
            </span>
            <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{result.lulc.agriculture}%</span>
          </div>
        </div>
      </div>

      {/* Auditable Execution Summary Card (ISRO Benchmark Compliance) */}
      <div className={`p-4 rounded-xl border space-y-2.5 shadow-md font-mono text-[11px] ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`flex items-center justify-between pb-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
          <div className={`flex items-center space-x-1.5 font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Auditable Execution Trace</span>
          </div>
          <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ISRO Benchmark Verified</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-500' : 'text-slate-500 font-semibold'}>TASK ID:</span>
            <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{result.executionTrace.taskId}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-500' : 'text-slate-500 font-semibold'}>LATENCY:</span>
            <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{result.executionTrace.processingLatencyMs} ms</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-slate-500' : 'text-slate-500 font-semibold'}>PROJECTION:</span>
            <span className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{result.executionTrace.epsgProjection}</span>
          </div>
          <div className="pt-1">
            <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500 font-semibold'}`}>INVOKED SPECIALIST MODELS:</span>
            <ul className={`list-disc list-inside text-[10px] pl-1 space-y-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {result.executionTrace.modelsInvoked.map((m, idx) => (
                <li key={idx} className="truncate">{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Download Triggers */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleDownloadPDF}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
            isDark
              ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30'
              : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300 font-bold'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF Report</span>
        </button>

        <button
          onClick={handleDownloadGeoJSON}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
            isDark
              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 font-bold'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Download GeoJSON</span>
        </button>
      </div>
    </div>
  );
};
