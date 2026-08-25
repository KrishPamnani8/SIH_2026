"use client";
import React, { useState, useRef } from "react";
import UploadCard from "@/components/UploadCard";
import Image from "next/image";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Simple Question Card component
function QuestionCard({ onAnalyze }: { onAnalyze: () => void }) {
  const [question, setQuestion] = useState("");
  return (
    <section className="bg-white rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">2. Ask Your Question</h2>
      <textarea
        className="w-full h-24 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Example: What is visible in this image?"
        maxLength={300}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{question.length} / 300</span>
      </div>
      <button
        onClick={onAnalyze}
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90"
      >
        ✨ Analyze Image
      </button>
    </section>
  );
}

// Analysis Result component (mock data)
function AnalysisResult({ file, onDownload, generating }: { file: File | null; onDownload: () => void; generating: boolean }) {
  const imageUrl = file ? URL.createObjectURL(file) : "/placeholder-sat.jpg";
  return (
    <section className="bg-white rounded-xl shadow p-4 space-y-6">
      <h2 className="text-lg font-semibold">3. Analysis Result</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Input Image */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700">Input Image</h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image src={imageUrl} alt="Input" width={400} height={300} className="object-cover" />
          </div>
        </div>
        {/* Answer */}
        <div className="space-y-2">
          <h3 className="flex items-center font-medium text-gray-700"><span className="text-green-600 mr-2">✓</span>Answer</h3>
          <p className="text-gray-800">The image shows a mixed landscape with the following key features:</p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>A water body is visible towards the left side.</li>
            <li>Dense vegetation surrounds the water body.</li>
            <li>Built-up residential areas are present on the right side.</li>
            <li>Roads connect the different regions.</li>
            <li>Agricultural or open land can be seen in the bottom-left.</li>
          </ul>
          {/* Confidence */}
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">Confidence Score</p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: "87%" }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">87%</p>
          </div>
        </div>
      </div>

      {/* Detected Highlights */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Detected Highlights</h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>Water Body</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>Vegetation</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>Built‑up Area</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>Road</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-1"></span>Agricultural Land</span>
        </div>
        <div className="mt-2">
          <Image src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80" alt="Segmentation" width={600} height={300} className="object-cover w-full rounded-lg" />
        </div>
      </div>

      {/* Execution Summary */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Execution Summary</h3>
        <ul className="list-disc list-inside text-gray-800 space-y-1">
          <li>Task: Single Image VQA</li>
          <li>Model Used: GeoChat-7B</li>
          <li>Processing Time: 4.2 sec</li>
          <li>Date & Time: 21 May 2024, 11:45 AM</li>
        </ul>
        <button onClick={onDownload} disabled={generating} className="flex items-center gap-2 mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
    {generating ? (
      <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2v4M5.93 5.93l2.83 2.83M2 12h4M5.93 18.07l2.83-2.83M12 16v4M18.07 18.07l-2.83-2.83M20 12h-4M18.07 5.93l-2.83 2.83"/></svg>
    ) : (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-18L5.33 9h3.34v6h4.66V9h3.34L12 2z"/></svg>
    )}
    {generating ? 'Generating Report...' : 'Download Report'}
  </button>
      </div>
    </section>
  );
}

export default function WorkspaceGrid() {
  const [file, setFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleUpload = (files: FileList) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleAnalyze = () => {
    setShowResult(true);
  };

  const handleDownload = async () => {
    if (!file) {
      alert('Please analyze an image first before downloading the report.');
      return;
    }
    if (!reportRef.current) {
      console.error('Report reference not found');
      return;
    }
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('satquery_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-slate-50/60">
      {/* Left column – Upload & Question */}
      <div className="col-span-5 space-y-6">
        <UploadCard onUpload={handleUpload} />
        <QuestionCard onAnalyze={handleAnalyze} />
      </div>

      {/* Right column – Results */}
      <div className="col-span-7 space-y-6">
        {showResult && (
          <div ref={reportRef}>
            <AnalysisResult file={file} onDownload={handleDownload} generating={generating} />
          </div>
        )}
      </div>
    </div>
  );
}
