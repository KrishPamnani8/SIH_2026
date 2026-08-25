import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Layers,
  Box,
  Flame,
  Grid,
  Info,
  MapPin,
} from 'lucide-react';
import type { AnalysisMode, AnalysisResult, ThemeMode } from '../types/satquery';
import {
  renderOpticalSatelliteScene,
  renderSARSatelliteScene,
  renderSegmentationMaskScene,
  renderChangeHeatmapScene,
} from '../utils/imageGenerator';
import { AdvancedMap } from '@/components/ui/interactive-map';

interface CenterViewportProps {
  mode: AnalysisMode;
  result: AnalysisResult | null;
  samGriWeight: number;
  onUpdateSamGriWeight: (w: number) => void;
  theme: ThemeMode;
}

export const CenterViewport: React.FC<CenterViewportProps> = ({
  mode,
  result,
  samGriWeight,
  onUpdateSamGriWeight,
  theme,
}) => {
  // Layer Toggles
  const [activeBaseLayer, setActiveBaseLayer] = useState<'optical1' | 'sar1' | 'optical2'>('optical1');
  const [showMaskLayer, setShowMaskLayer] = useState(true);
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [showChangeHeatmap, setShowChangeHeatmap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const isDark = theme === 'dark';

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [selectedBBoxId, setSelectedBBoxId] = useState<string | null>(null);
  const [hoveredCoords, setHoveredCoords] = useState<{ utm: string; latLon: string } | null>(null);

  // Canvas Refs
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Convert bounding boxes to Leaflet markers format for AdvancedMap
  const mapMarkers = result
    ? result.boundingBoxes.map((box) => ({
        id: box.id,
        position: [
          18.6601 + (box.bbox[0] - 50) * 0.0004,
          73.5012 + (box.bbox[1] - 50) * 0.0004,
        ] as [number, number],
        color: box.category === 'flood' ? 'blue' : box.category === 'water' ? 'cyan' : 'red',
        size: 'medium' as const,
        popup: {
          title: box.label,
          content: `Score: ${(box.score * 100).toFixed(1)}% | UTM: ${box.utmCoordinates}`,
        },
      }))
    : [];

  // Re-render canvases whenever mode, base layer, or result updates
  useEffect(() => {
    if (!baseCanvasRef.current) return;

    const baseCanvas = baseCanvasRef.current;
    baseCanvas.width = 640;
    baseCanvas.height = 540;

    const cloudCover = result ? result.samGri.cloudCoveragePercent : 20;

    if (activeBaseLayer === 'optical1') {
      renderOpticalSatelliteScene(baseCanvas, mode, false, cloudCover);
    } else if (activeBaseLayer === 'sar1') {
      renderSARSatelliteScene(baseCanvas);
    } else if (activeBaseLayer === 'optical2') {
      renderOpticalSatelliteScene(baseCanvas, mode, true, 2);
    }

    if (maskCanvasRef.current) {
      const maskCanvas = maskCanvasRef.current;
      maskCanvas.width = 640;
      maskCanvas.height = 540;
      renderSegmentationMaskScene(maskCanvas, 0.6);
    }

    if (heatmapCanvasRef.current) {
      const heatmapCanvas = heatmapCanvasRef.current;
      heatmapCanvas.width = 640;
      heatmapCanvas.height = 540;
      renderChangeHeatmapScene(heatmapCanvas, 0.65);
    }
  }, [mode, activeBaseLayer, result]);

  // Track cursor location on viewport for coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    const normY = Math.min(Math.max((y / rect.height) * 100, 0), 100);

    const utmE = Math.floor(342000 + normX * 10);
    const utmN = Math.floor(2064000 + (100 - normY) * 10);
    const lat = (18.6500 + (100 - normY) * 0.0002).toFixed(4);
    const lon = (73.4900 + normX * 0.0002).toFixed(4);

    setHoveredCoords({
      utm: `43N ${utmE}E ${utmN}N`,
      latLon: `${lat}° N, ${lon}° E`,
    });
  };

  const cardBg = isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md';
  const gridClass = isDark ? 'grid-bg-dark' : 'grid-bg-light';
  const overlayBg = isDark ? 'bg-slate-950/90 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-300 text-slate-800 shadow-md';

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Toolbar & Layer Selectors */}
      <div className={`p-2.5 rounded-xl border ${cardBg} flex flex-wrap items-center justify-between gap-2`}>
        {/* Base Layer Switcher */}
        <div className={`flex items-center space-x-1 p-1 rounded-lg border ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            onClick={() => setActiveBaseLayer('optical1')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeBaseLayer === 'optical1'
                ? 'bg-sky-500 text-white'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode === 'bi_temporal' ? 'Optical T1 (2024)' : 'Optical RGB'}
          </button>

          {(mode === 'cross_modal' || mode === 'single') && (
            <button
              onClick={() => setActiveBaseLayer('sar1')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeBaseLayer === 'sar1'
                  ? 'bg-emerald-500 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SAR Sentinel-1
            </button>
          )}

          {mode === 'bi_temporal' && (
            <button
              onClick={() => setActiveBaseLayer('optical2')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeBaseLayer === 'optical2'
                  ? 'bg-amber-500 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optical T2 (2026)
            </button>
          )}
        </div>

        {/* Feature Layer Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowMaskLayer(!showMaskLayer)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all cursor-pointer ${
              showMaskLayer
                ? isDark
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold'
                : isDark
                ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Segmentation Mask</span>
          </button>

          <button
            onClick={() => setShowBBoxes(!showBBoxes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all cursor-pointer ${
              showBBoxes
                ? isDark
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'bg-sky-50 border-sky-400 text-sky-700 font-semibold'
                : isDark
                ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Bounding Boxes</span>
          </button>

          {mode === 'bi_temporal' && (
            <button
              onClick={() => setShowChangeHeatmap(!showChangeHeatmap)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 transition-all cursor-pointer ${
                showChangeHeatmap
                  ? isDark
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'bg-amber-50 border-amber-400 text-amber-700 font-semibold'
                  : isDark
                  ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Change Heatmap</span>
            </button>
          )}

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showGrid
                ? isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-800 text-white'
                : isDark
                ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
            title="Toggle UTM Coordinates Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Viewport Container wrapping AdvancedMap Component */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCoords(null)}
        className={`relative flex-1 rounded-2xl border ${cardBg} overflow-hidden shadow-2xl flex items-center justify-center cursor-crosshair min-h-[380px] ${
          showGrid ? gridClass : ''
        }`}
      >
        <div
          className="relative transition-transform duration-200 origin-center flex items-center justify-center w-full h-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Synthetic Satellite Layer Canvas */}
          <canvas
            ref={baseCanvasRef}
            className="w-full h-full object-cover rounded-xl shadow-inner absolute inset-0"
          />

          {/* Segmentation Mask Layer */}
          {showMaskLayer && (
            <canvas
              ref={maskCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 z-10"
            />
          )}

          {/* Change Differencing Heatmap Layer */}
          {mode === 'bi_temporal' && showChangeHeatmap && (
            <canvas
              ref={heatmapCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 z-10"
            />
          )}

          {/* Bounding Boxes Layer */}
          {showBBoxes && result && result.boundingBoxes.map((box) => {
            const [ymin, xmin, ymax, xmax] = box.bbox;
            const isSelected = selectedBBoxId === box.id;

            return (
              <div
                key={box.id}
                onClick={() => setSelectedBBoxId(box.id === selectedBBoxId ? null : box.id)}
                className={`absolute border-2 transition-all duration-200 cursor-pointer pointer-events-auto rounded z-20 ${
                  box.category === 'flood'
                    ? 'border-sky-400 bg-sky-500/15'
                    : box.category === 'water'
                    ? 'border-cyan-400 bg-cyan-500/15'
                    : box.category === 'infrastructure'
                    ? 'border-rose-400 bg-rose-500/15'
                    : 'border-emerald-400 bg-emerald-500/15'
                } ${isSelected ? 'ring-4 ring-white shadow-xl scale-[1.01]' : 'hover:scale-[1.005]'}`}
                style={{
                  top: `${ymin}%`,
                  left: `${xmin}%`,
                  width: `${xmax - xmin}%`,
                  height: `${ymax - ymin}%`,
                }}
              >
                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow flex items-center space-x-1 whitespace-nowrap ${
                  isDark ? 'bg-slate-950/90 text-sky-400 border-slate-700' : 'bg-slate-900 text-sky-300 border-slate-800'
                }`}>
                  <span>{box.label}</span>
                  <span className="text-emerald-400">({(box.score * 100).toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}

          {/* Leaflet AdvancedMap Integration Component */}
          <div className="absolute inset-0 opacity-40 hover:opacity-100 transition-opacity duration-300 z-0">
            <AdvancedMap
              center={[18.6601, 73.5012]}
              zoom={13}
              markers={mapMarkers}
              enableSearch={true}
              enableControls={true}
              enableClustering={true}
              mapLayers={{
                openstreetmap: activeBaseLayer === 'optical1',
                satellite: activeBaseLayer === 'sar1' || activeBaseLayer === 'optical2',
              }}
            />
          </div>
        </div>

        {/* Viewport Controls */}
        <div className={`absolute top-3 right-3 flex flex-col space-y-1 p-1 rounded-xl shadow-lg backdrop-blur-md z-30 border ${overlayBg}`}>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1.0)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            title="Reset Viewport"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Coordinate Readout */}
        {hoveredCoords && (
          <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg font-mono text-[11px] shadow-lg flex items-center space-x-2 backdrop-blur-md z-30 border ${overlayBg}`}>
            <MapPin className={`w-3.5 h-3.5 animate-bounce ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
            <div>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>UTM CRS GRID</span>
              <span className={`font-bold ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>{hoveredCoords.utm}</span>
            </div>
            <div className={`border-l pl-2 ${isDark ? 'border-slate-800' : 'border-slate-300'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>LAT / LON</span>
              <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{hoveredCoords.latLon}</span>
            </div>
          </div>
        )}

        {/* Legend Overlay for CORINE Land Cover */}
        {showMaskLayer && (
          <div className={`absolute top-3 left-3 p-2 rounded-xl text-[10px] space-y-1 shadow-lg backdrop-blur-md z-30 border ${overlayBg}`}>
            <span className={`font-bold uppercase tracking-wider text-[9px] block ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              CORINE Land Cover
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                <span>Water Body</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>Dense Veg</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                <span>Urban Fabric</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <span>Agriculture</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HERO FEATURE WIDGET: SAM-GRI Index */}
      <div className={`p-4 rounded-xl border ${cardBg} space-y-2 shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg border ${
              isDark ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-sky-50 border-sky-300 text-sky-700'
            }`}>
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-xs font-bold flex items-center space-x-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <span>HERO FEATURE: SAM-GRI Index</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${
                  isDark ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-sky-100 text-sky-800 border-sky-300 font-semibold'
                }`}>
                  ISRO Evaluator Widget
                </span>
              </h3>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sensor-Aware Multimodal Grounding & Dynamic Attribution Weighting
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {result ? `${result.samGri.reliabilityScore}%` : '95.4%'}
            </span>
            <span className={`text-[9px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Reliability Score</span>
          </div>
        </div>

        {/* Dynamic Interactive Attribution Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono">
            <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              SAR Backscatter (Sentinel-1): {samGriWeight}%
            </span>
            <span className={`font-semibold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
              Optical Spectral (Sentinel-2): {100 - samGriWeight}%
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={95}
            value={samGriWeight}
            onChange={(e) => onUpdateSamGriWeight(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className={`flex items-center justify-between text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>High Optical Obscuration (Cloud Canopy)</span>
            <span>Clear Sky Spectral Coherence</span>
          </div>
        </div>

        {/* Dynamic Reasoning Footnote */}
        <div className={`p-2 rounded-lg border text-[10px] flex items-start space-x-2 font-mono ${
          isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          <p>
            {result?.samGri.dynamicReasoning ||
              'Dynamic attribution automatically balances SAR microwave ground penetration with optical multi-spectral feature maps.'}
          </p>
        </div>
      </div>
    </div>
  );
};
