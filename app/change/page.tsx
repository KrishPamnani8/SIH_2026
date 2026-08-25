"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ---------- Mock assets (fallback when no image is selected) ----------
const MOCK_BEFORE_IMG = "/placeholder_image_1787653653330.jpg"; // placeholder before image
const MOCK_AFTER_IMG = "/placeholder_image_1787653653330.jpg"; // placeholder after image (same geo‑area)

// ---------- Mock analysis data (static) ----------
const MOCK_BEFORE_DATE = "March 15, 2024";
const MOCK_AFTER_DATE = "August 22, 2026";
const MOCK_MODEL = "GeoChat-7B";
const MOCK_CHANGE_PERCENT = 18.6; // % of scene changed
const MOCK_CONFIDENCE = 91; // percent
const MOCK_PROC_TIME = "4.6 seconds";
const MOCK_STATUS = "Mock Analysis Complete";

// Detected change items (static)
const DETECTED_CHANGES = [
  { label: "Vegetation Loss", percent: 7.4, description: "Reduced vegetation coverage detected across the northern agricultural zone.", color: "#EF4444" },
  { label: "New Built‑up Area", percent: 4.2, description: "New structures detected along the expanding road corridor.", color: "#F59E0B" },
  { label: "Agricultural Land Change", percent: 5.8, description: "Several agricultural parcels show significant land‑cover transition.", color: "#A855F7" },
  { label: "Road Expansion", percent: 1.2, description: "Linear expansion detected along the existing transportation network.", color: "#2563EB" },
];

export default function ChangeDetectionPage() {
  // ---------- State ----------
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>(MOCK_BEFORE_IMG);
  const [afterPreview, setAfterPreview] = useState<string>(MOCK_AFTER_IMG);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // ---------- Helpers ----------
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Update preview URLs when files change
  useEffect(() => {
    if (beforeFile) {
      const url = URL.createObjectURL(beforeFile);
      setBeforePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBeforePreview(MOCK_BEFORE_IMG);
    }
  }, [beforeFile]);

  useEffect(() => {
    if (afterFile) {
      const url = URL.createObjectURL(afterFile);
      setAfterPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAfterPreview(MOCK_AFTER_IMG);
    }
  }, [afterFile]);

  // ---------- Handlers ----------
  const handleBeforeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) setBeforeFile(files[0]);
  };

  const handleAfterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) setAfterFile(files[0]);
  };

  const removeBefore = () => {
    setBeforeFile(null);
    setAnalysisDone(false);
  };

  const removeAfter = () => {
    setAfterFile(null);
    setAnalysisDone(false);
  };

  const startAnalysis = () => {
    if (!beforeFile) { alert("Please upload the Before image first."); return; }
    if (!afterFile) { alert("Please upload the After image first."); return; }
    setAnalysisRunning(true);
    setTimeout(() => {
      setAnalysisRunning(false);
      setAnalysisDone(true);
    }, 1500);
  };

  const downloadReport = async () => {
    if (!analysisDone) { alert("Run the analysis before downloading a report."); return; }
    setGeneratingReport(true);
    const el = document.getElementById("report-section");
    if (!el) { setGeneratingReport(false); return; }
    try {
      const canvas = await html2canvas(el);
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(img);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("change_detection_report.pdf");
    } catch (e) {
      console.error(e);
    }
    setGeneratingReport(false);
  };

  // ---------- UI Components ----------
  const HeroSection = () => (
    <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-8 border border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">CHANGE DETECTION</h1>
        <p className="mt-2 text-[#4B5563] max-w-xl">
          Compare satellite imagery from two different dates to identify and understand changes across the landscape.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">Mock AI Analysis</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">Temporal Comparison</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">Land‑Cover Change</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full">AI‑Assisted Analysis</span>
        </div>
      </div>
      <div className="w-48 h-32 relative flex-shrink-0">
        <Image src={MOCK_BEFORE_IMG} alt="Change detection hero" layout="fill" objectFit="cover" className="rounded-md" />
      </div>
    </section>
  );

  const ConfigSection = () => (
    <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB]">
      <h2 className="text-xl font-semibold text-[#111827] mb-4">Change Detection Configuration</h2>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2"><span className="font-medium">Analysis Type:</span><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full">Bi‑Temporal Satellite Comparison</span></div>
        <div className="flex items-center gap-2"><span className="font-medium">Model:</span><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full">{MOCK_MODEL}</span></div>
        <div className="flex items-center gap-2"><span className="font-medium">Detection Mode:</span><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full">Land‑Cover Change Detection</span></div>
        <div className="flex items-center gap-2"><span className="font-medium">Comparison:</span><span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full">2024 → 2026</span></div>
      </div>
    </section>
  );

  const UploadCard = ({ title, date, subtitle, file, preview, onSelect, onRemove, inputId }: { title: string; date: string; subtitle: string; file: File | null; preview: string; onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void; inputId: string; }) => (
    <section className="bg-white rounded-xl shadow p-6 border border-[#E5E7EB]">
      <h3 className="text-lg font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-[#4B5563] mb-1">{subtitle}</p>
      <p className="text-sm text-[#6B7280] mb-3">{date}</p>
      {preview ? (
        <div className="relative w-full h-80 border rounded-md overflow-hidden mb-3">
          <Image src={preview} alt={title} layout="fill" objectFit="contain" className="bg-gray-100" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#A78BFA] rounded-md p-8 bg-[#FAF5FF] mb-3">
          <svg className="w-12 h-12 text-[#A78BFA] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
          <p className="text-sm text-[#4B5563] mb-2">Drag &amp; drop or choose an image</p>
          <label htmlFor={inputId} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer">Choose Image</label>
          <input id={inputId} type="file" accept="image/*" onChange={onSelect} className="hidden" />
        </div>
      )}
      {file && (
        <div className="flex items-center justify-between text-sm text-[#4B5563] mt-2">
          <span>{file.name} ({formatFileSize(file.size)})</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Ready</span>
          <button onClick={onRemove} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
        </div>
      )}
    </section>
  );

  const TemporalComparison = () => (
    <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB]">
      <h2 className="text-lg font-semibold text-[#111827] mb-4">3. Temporal Comparison</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative border rounded-md overflow-hidden">
          <div className="absolute left-2 top-2 bg-white/70 px-2 py-1 rounded text-sm font-medium">BEFORE</div>
          <Image src={beforePreview} alt="Before" layout="fill" objectFit="contain" className="bg-gray-50" />
          <div className="absolute bottom-2 left-2 bg-white/70 px-2 py-1 rounded text-xs">{MOCK_BEFORE_DATE}</div>
        </div>
        <div className="relative border rounded-md overflow-hidden">
          <div className="absolute left-2 top-2 bg-white/70 px-2 py-1 rounded text-sm font-medium">AFTER</div>
          <Image src={afterPreview} alt="After" layout="fill" objectFit="contain" className="bg-gray-50" />
          <div className="absolute bottom-2 left-2 bg-white/70 px-2 py-1 rounded text-xs">{MOCK_AFTER_DATE}</div>
        </div>
      </div>
    </section>
  );

  const RunButton = () => (
    <div className="flex justify-center mt-4">
      <button onClick={startAnalysis} disabled={analysisRunning} className={`px-6 py-3 text-white rounded font-medium text-lg transition ${analysisRunning ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}>
        {analysisRunning ? "Analyzing Changes..." : "⚡ Run Change Detection"}
      </button>
    </div>
  );

  const MetricsCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <div className="bg-[#FAF5FF] p-4 rounded text-center">
      <p className="font-medium text-[#111827]">{title}</p>
      <p className="text-3xl font-bold text-[#111827] mt-1">{value}</p>
      {subtitle && <p className="text-sm text-[#4B5563]">{subtitle}</p>}
    </div>
  );

  const ResultsSection = () => (
    <section id="report-section" className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB] space-y-6">
      <h2 className="text-xl font-semibold text-[#111827]">4. Change Detection Results</h2>
      <div className="flex items-center text-green-600 mb-4"><span className="font-medium">✓ Analysis Complete</span></div>
      <div className="grid md:grid-cols-3 gap-4 mb-4"><MetricsCard title="Changed Area" value={`${MOCK_CHANGE_PERCENT}%`} subtitle="of the scene changed" /><MetricsCard title="Confidence" value={`${MOCK_CONFIDENCE}%`} /><MetricsCard title="Processing Time" value={MOCK_PROC_TIME} /></div>
      <section className="mt-4">
        <h3 className="text-md font-semibold text-[#111827] mb-2">Detected Change Map</h3>
        <p className="text-sm text-[#4B5563] mb-2">Mock temporal change visualization</p>
        <div className="relative w-full h-96 border rounded-md overflow-hidden"><Image src={MOCK_AFTER_IMG} alt="Change map base" layout="fill" objectFit="cover" className="opacity-70" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(45deg, rgba(239,68,68,0.3) 25%, rgba(220,38,38,0.3) 50%, rgba(168,85,247,0.3) 75%)` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#4B5563]">{DETECTED_CHANGES.map(c => (<span key={c.label} className="flex items-center"><span className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: c.color }}></span>{c.label}</span>))}</div>
      </section>
      <section className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-[#111827]">Detected Changes</h3>
          {DETECTED_CHANGES.map(c => (<div key={c.label} className="border-l-4 pl-3 bg-[#FAF5FF] p-2 rounded" style={{ borderColor: c.color }}><p className="font-medium text-[#111827]">{c.label} — {c.percent}% of scene</p><p className="text-sm text-[#4B5563]">{c.description}</p></div>))}
        </div>
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-[#111827]">AI Change Interpretation</h3>
          <div className="flex items-center text-green-600 mb-2"><span className="font-medium">✓ {MOCK_MODEL} Analysis</span></div>
          <p className="text-[#4B5563] mb-2">The comparison indicates noticeable land‑cover changes between the two observation dates. Vegetation loss and agricultural land conversion are the dominant changes, while new built‑up structures and road expansion are visible along the developed corridor.</p>
          <ul className="list-disc list-inside text-[#4B5563] space-y-1"><li>Vegetation coverage decreased in the northern portion of the scene.</li><li>Agricultural parcels show visible land‑cover transitions.</li><li>New built‑up structures appear near the road network.</li><li>Road expansion contributes to the observed spatial changes.</li></ul>
        </div>
      </section>
      <section className="mt-6">
        <h3 className="text-md font-semibold text-[#111827]">Execution Summary</h3>
        <table className="w-full text-sm text-[#4B5563] border-collapse"><tbody>
          <tr className="border-b"><td className="py-1 font-medium">Task</td><td className="py-1">Change Detection</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">Model</td><td className="py-1">{MOCK_MODEL}</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">Before</td><td className="py-1">{MOCK_BEFORE_DATE}</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">After</td><td className="py-1">{MOCK_AFTER_DATE}</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">Changed Area</td><td className="py-1">{MOCK_CHANGE_PERCENT}%</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">Confidence</td><td className="py-1">{MOCK_CONFIDENCE}%</td></tr>
          <tr className="border-b"><td className="py-1 font-medium">Processing Time</td><td className="py-1">{MOCK_PROC_TIME}</td></tr>
          <tr><td className="py-1 font-medium">Status</td><td className="py-1">{MOCK_STATUS}</td></tr>
        </tbody></table>
        <div className="flex justify-end mt-4"><button onClick={downloadReport} disabled={generatingReport} className={`px-4 py-2 rounded text-white flex items-center ${generatingReport ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}>
          {generatingReport && (<svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.415,31.415" /></svg>)}
          {generatingReport ? "Generating Report..." : "↓ Download Report"}
        </button></div>
      </section>
    </section>
  );

  return (
    <main className="flex flex-col gap-8 py-8 w-full bg-[#F8F9FD] min-h-screen">
      <HeroSection />
      <ConfigSection />
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        <UploadCard title="1. Before Image" subtitle="Earlier satellite observation" date={MOCK_BEFORE_DATE} file={beforeFile} preview={beforePreview} onSelect={handleBeforeSelect} onRemove={removeBefore} inputId="before-input" />
        <UploadCard title="2. After Image" subtitle="Recent satellite observation" date={MOCK_AFTER_DATE} file={afterFile} preview={afterPreview} onSelect={handleAfterSelect} onRemove={removeAfter} inputId="after-input" />
      </section>
      <TemporalComparison />
      <RunButton />
      {analysisDone && <ResultsSection />}
    </main>
  );
}
