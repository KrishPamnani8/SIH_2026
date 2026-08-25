"use client";

import { useState } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Mock data (must stay constant)
const MOCK_FILENAME = "farmland_satellite.tif";
const MOCK_DATE = "August 23, 2026, 02:30 PM";
const MOCK_QUESTION = "What is visible in this image?";
const MOCK_ANSWER = "The image shows agricultural fields with areas of dense vegetation, connecting roads, and scattered built-up structures.";
const MOCK_CONFIDENCE = 87; // percent
const MOCK_HIGHLIGHTS = [
  { label: "Agricultural Land", color: "#A855F7" },
  { label: "Vegetation", color: "#16A34A" },
  { label: "Road", color: "#F59E0B" },
  { label: "Built-up Area", color: "#DC2626" },
];
const MOCK_MODEL = "GeoChat-7B";
const MOCK_PROC_TIME = "3.8 seconds";
const MOCK_STATUS = "Mock Analysis Complete";

// Example question chips
const EXAMPLE_QUESTIONS = [
  "What is visible in this image?",
  "Where are the agricultural areas?",
  "What land-cover types are present?",
];

export default function SingleImageAnalysisPage() {
  // ----- State -----
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisDone, setAnalysisDone] = useState<boolean>(false);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);

  // Derived UI flags
  const imageReady = !!file;
  const questionAdded = question.trim().length > 0;

  // ----- Handlers -----
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysisDone(false);
    setQuestion("");
  };

  const startAnalysis = () => {
    if (!imageReady) {
      alert("Please upload an image first.");
      return;
    }
    if (!questionAdded) {
      alert("Please enter a question.");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
    }, 1500);
  };

  const downloadReport = async () => {
    if (!analysisDone) {
      alert("Generate the analysis before downloading a report.");
      return;
    }
    setGeneratingReport(true);
    const reportElement = document.getElementById("report-section");
    if (!reportElement) {
      setGeneratingReport(false);
      return;
    }
    try {
      const canvas = await html2canvas(reportElement);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("single_image_analysis_report.pdf");
    } catch (error) {
      console.error("Report generation error:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // ----- UI Components -----
  const HeroSection = () => (
    <section className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB] flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">SINGLE IMAGE ANALYSIS</h1>
        <p className="mt-2 text-[#4B5563]">
          Upload a satellite image, ask a natural-language question, and get an AI-powered interpretation of the scene.
        </p>
        <span className="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
          Mock AI Analysis
        </span>
      </div>
      {/* Small visual element – placeholder thumbnail */}
      <div className="w-32 h-24 relative flex-shrink-0">
        <Image
          src="/placeholder_image_1787653653330.jpg"
          alt="Satellite thumbnail"
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
    </section>
  );

  const StatusStrip = () => (
    <section className="max-w-5xl mx-auto bg-[#FAF5FF] rounded-md px-4 py-2 flex flex-wrap gap-4 text-sm text-[#111827]">
      <div className="flex items-center gap-2">
        <span>Image</span>
        <span className="font-medium text-green-600">✓ Ready</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Question</span>
        <span className="font-medium text-green-600">✓ Added</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Model</span>
        <span className="font-medium text-[#111827]">{MOCK_MODEL}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Mode</span>
        <span className="font-medium text-[#111827]">Single Image VQA</span>
      </div>
    </section>
  );

  const UploadArea = () => (
    <div className="space-y-4 bg-white rounded-xl shadow p-6 border border-[#E5E7EB]">
      <h2 className="text-lg font-semibold text-[#111827]">1. Input Image</h2>
      {imageReady ? (
        <div className="space-y-3">
          <div className="relative w-full h-64">
            <Image src={previewUrl!} alt="Uploaded" layout="fill" objectFit="contain" className="rounded-md" />
          </div>
          <div className="text-sm text-[#4B5563] space-y-1">
            <p>Filename: {MOCK_FILENAME}</p>
            <p>Satellite Optical</p>
            <p>10m/px – RGB</p>
            <p>Status: <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">Ready</span></p>
          </div>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-gray-200 rounded" title="Zoom In">+</button>
            <button className="px-2 py-1 bg-gray-200 rounded" title="Zoom Out">-</button>
            <button className="px-2 py-1 bg-gray-200 rounded" title="Reset">Reset</button>
            <button onClick={removeImage} className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#A78BFA] rounded-md p-8 bg-[#FAF5FF]">
          <svg className="w-12 h-12 text-[#A78BFA] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Choose Image
          </label>
          <p className="mt-2 text-sm text-[#4B5563]">Supported: JPG, PNG, TIFF – Max 50 MB</p>
        </div>
      )}
    </div>
  );

  const QuestionArea = () => (
    <div className="space-y-4 bg-white rounded-xl shadow p-6 border border-[#E5E7EB]">
      <h2 className="text-lg font-semibold text-[#111827]">2. Ask About Image</h2>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        maxLength={300}
        placeholder="Ask a question about this satellite image..."
        className="w-full h-32 p-2 border border-[#E5E7EB] rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
      />
      <div className="text-sm text-[#6B7280] text-right">{question.length} / 300</div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => setQuestion(q)}
            className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
          >
            {q}
          </button>
        ))}
      </div>
      <button
        onClick={startAnalysis}
        disabled={analyzing}
        className={`w-full py-2 text-white rounded font-medium transition ${analyzing ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
      >
        {analyzing ? "Analyzing Image..." : "⚡ Analyze Image"}
      </button>
    </div>
  );

  const AnalysisPreview = () => (
    <section className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB] space-y-4">
      <h2 className="text-lg font-semibold text-[#111827]">ANALYSIS PREVIEW</h2>
      <p className="text-[#4B5563]">Upload an image and run analysis to generate an AI interpretation.</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-[#4B5563]">
        <div>Confidence —</div>
        <div>Detected Features —</div>
        <div>Processing Time —</div>
        <div>Model —</div>
      </div>
    </section>
  );

  const ResultSection = () => (
    <section id="report-section" className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 border border-[#E5E7EB] space-y-6">
      <h2 className="text-lg font-semibold text-[#111827]">3. AI Analysis Result</h2>
      <div className="flex items-center space-x-2 text-green-600">
        <span className="font-medium">✓ Analysis Complete</span>
      </div>
      <div className="space-y-2">
        <p className="text-[#111827]"><strong>Question:</strong> {MOCK_QUESTION}</p>
        <p className="text-[#111827]"><strong>Answer:</strong> {MOCK_ANSWER}</p>
      </div>
      {/* Confidence */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#111827]">Confidence Score: {MOCK_CONFIDENCE}%</p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${MOCK_CONFIDENCE}%` }} />
        </div>
      </div>
      {/* Detected Highlights */}
      <div>
        <p className="font-medium text-[#111827] mb-2">Detected Highlights</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_HIGHLIGHTS.map(h => (
            <span key={h.label} className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: h.color }}>
              {h.label}
            </span>
          ))}
        </div>
      </div>
      {/* Scene Insights */}
      <div>
        <p className="font-medium text-[#111827] mb-2">Scene Insights</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2 p-3 border rounded bg-[#FAF5FF]">
            <span className="text-2xl">🌾</span>
            <div>
              <p className="font-semibold text-[#111827]">Agricultural Land</p>
              <p className="text-sm text-[#4B5563]">Dominant land-cover pattern</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 border rounded bg-[#FAF5FF]">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="font-semibold text-[#111827]">Vegetation</p>
              <p className="text-sm text-[#4B5563]">Dense vegetation zones detected</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 border rounded bg-[#FAF5FF]">
            <span className="text-2xl">🛣</span>
            <div>
              <p className="font-semibold text-[#111827]">Road Network</p>
              <p className="text-sm text-[#4B5563]">Connecting road structures visible</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 border rounded bg-[#FAF5FF]">
            <span className="text-2xl">🏘</span>
            <div>
              <p className="font-semibold text-[#111827]">Built-up Area</p>
              <p className="text-sm text-[#4B5563]">Scattered infrastructure detected</p>
            </div>
          </div>
        </div>
      </div>
      {/* Execution Summary */}
      <div className="border-t pt-4">
        <p className="font-medium text-[#111827] mb-2">Execution Summary</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#4B5563]">
          <div>Model: {MOCK_MODEL}</div>
          <div>Processing Time: {MOCK_PROC_TIME}</div>
          <div>Date: {MOCK_DATE}</div>
          <div>Filename: {MOCK_FILENAME}</div>
          <div>Confidence: {MOCK_CONFIDENCE}%</div>
          <div>Status: {MOCK_STATUS}</div>
        </div>
        <button
          onClick={downloadReport}
          disabled={generatingReport}
          className={`mt-4 px-4 py-2 rounded text-white flex items-center ${generatingReport ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {generatingReport && (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.415, 31.415" strokeDashoffset="0" />
            </svg>
          )}
          {generatingReport ? "Generating Report..." : "Download Report"}
        </button>
      </div>
    </section>
  );

  return (
    <main className="flex flex-col gap-8 py-8 w-full bg-[#F8F9FD] min-h-screen">
      <HeroSection />
      <StatusStrip />
      <section className="max-w-5xl mx-auto grid md:grid-cols-[1.4fr_1fr] gap-8">
        <UploadArea />
        <QuestionArea />
      </section>
      {analysisDone ? <ResultSection /> : <AnalysisPreview />}
    </main>
  );
}
