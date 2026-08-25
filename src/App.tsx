import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LeftPanel } from './components/LeftPanel';
import { CenterViewport } from './components/CenterViewport';
import { RightPanel } from './components/RightPanel';
import { ExecutionTraceModal } from './components/ExecutionTraceModal';
import { LoginPage } from './components/LoginPage';
import type {
  AnalysisMode,
  AnalysisResult,
  DemoPreset,
  GeoTIFFMetadata,
  ThemeMode,
} from './types/satquery';
import { analyzeSatelliteQuery, DEMO_PRESETS } from './services/mockAnalysisService';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('analyst@isro.gov.in');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mode, setMode] = useState<AnalysisMode>('cross_modal');
  const [query, setQuery] = useState<string>(DEMO_PRESETS[1].question);
  const [activePresetId, setActivePresetId] = useState<string | undefined>('demo-2');
  const [metadata, setMetadata] = useState<GeoTIFFMetadata>(DEMO_PRESETS[1].metadata);
  const [samGriWeight, setSamGriWeight] = useState<number>(82);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);

  // Toggle dark/light mode class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initial load: trigger analysis for default demo preset so page is pre-filled once authenticated
  useEffect(() => {
    const initialRun = async () => {
      setIsAnalyzing(true);
      const res = await analyzeSatelliteQuery('cross_modal', DEMO_PRESETS[1].question, DEMO_PRESETS[1].metadata, 82);
      setResult(res);
      setIsAnalyzing(false);
    };
    initialRun();
  }, []);

  // Handle Login Event
  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  // Handle Logout Event
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Handle Mode Change
  const handleSelectMode = (newMode: AnalysisMode) => {
    setMode(newMode);
    setActivePresetId(undefined);

    if (newMode === 'single') {
      setQuery('Describe the major land-cover features and calculate water surface area.');
      setMetadata(DEMO_PRESETS[0].metadata);
      setSamGriWeight(10);
    } else if (newMode === 'cross_modal') {
      setQuery('Identify flooded regions obscured under cloud canopy.');
      setMetadata(DEMO_PRESETS[1].metadata);
      setSamGriWeight(82);
    } else {
      setQuery('What changed between 2024 and 2026 in the urban sector?');
      setMetadata(DEMO_PRESETS[2].metadata);
      setSamGriWeight(20);
    }
  };

  // Handle Selecting Preset Demo
  const handleSelectPreset = async (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setMode(preset.mode);
    setQuery(preset.question);
    setMetadata(preset.metadata);

    const defaultWeight = preset.mode === 'cross_modal' ? 82 : preset.mode === 'bi_temporal' ? 20 : 10;
    setSamGriWeight(defaultWeight);

    setIsAnalyzing(true);
    const res = await analyzeSatelliteQuery(preset.mode, preset.question, preset.metadata, defaultWeight);
    setResult(res);
    setIsAnalyzing(false);
  };

  // Handle Manual Analyze Trigger
  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    const res = await analyzeSatelliteQuery(mode, query, metadata, samGriWeight);
    setResult(res);
    setIsAnalyzing(false);
  };

  // Handle updating SAM-GRI Weight slider dynamically
  const handleUpdateSamGriWeight = (weight: number) => {
    setSamGriWeight(weight);
    if (result && result.mode === 'cross_modal') {
      const updatedResult: AnalysisResult = {
        ...result,
        samGri: {
          ...result.samGri,
          sarWeight: weight,
          opticalWeight: 100 - weight,
          dynamicReasoning:
            weight > 60
              ? `Cloud attenuation (${result.samGri.cloudCoveragePercent}%). Sentinel-1 C-SAR microwave backscatter prioritised at ${weight}%.`
              : `Clearer atmospheric window. Sentinel-2 Optical bands weighted at ${100 - weight}%.`,
        },
      };
      setResult(updatedResult);
    }
  };

  // If not authenticated, render Claude-inspired Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    );
  }

  // Render Main SatQuery AI Dashboard once logged in
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Navigation Header */}
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenTraceModal={() => setIsTraceModalOpen(true)}
        latencyMs={result?.executionTrace.processingLatencyMs || 418}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main 3-Column Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Ingestion & Control Panel */}
        <section className="lg:col-span-3 h-[calc(100vh-5.5rem)]">
          <LeftPanel
            mode={mode}
            onSelectMode={handleSelectMode}
            query={query}
            onChangeQuery={setQuery}
            metadata={metadata}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            theme={theme}
          />
        </section>

        {/* Center Column: Geospatial Viewport */}
        <section className="lg:col-span-6 h-[calc(100vh-5.5rem)]">
          <CenterViewport
            mode={mode}
            result={result}
            samGriWeight={samGriWeight}
            onUpdateSamGriWeight={handleUpdateSamGriWeight}
            theme={theme}
          />
        </section>

        {/* Right Column: Evidence & Insights Panel */}
        <section className="lg:col-span-3 h-[calc(100vh-5.5rem)]">
          <RightPanel
            result={result}
            isAnalyzing={isAnalyzing}
            theme={theme}
          />
        </section>
      </main>

      {/* Observable Execution Trace Audit Modal */}
      <ExecutionTraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        result={result}
        theme={theme}
      />
    </div>
  );
}
