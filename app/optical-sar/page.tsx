"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

export default function OpticalSARPage() {
  // UI state
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [model, setModel] = useState("CROMA + Mini-InternVL2-DA-RS");
  const [sync, setSync] = useState(false);

  // Mock run handler
  const handleRun = () => {
    if (running) return;
    setRunning(true);
    setCompleted(false);
    // simulate short delay
    setTimeout(() => {
      setRunning(false);
      setCompleted(true);
    }, 1500);
  };

  return (
    <main className="flex flex-col gap-8 py-8 w-full max-w-7xl mx-auto">
      {/* Hero */}
      <section className="bg-purple-100 rounded-xl p-6 border border-purple-200 shadow">
        <h1 className="text-2xl font-bold text-purple-800 mb-2">
          OPTICAL + SAR FUSION ANALYSIS
        </h1>
        <p className="text-gray-700 mb-2">
          Cross-modal representation fusion via CROMA with reasoning and grounding powered by Mini-InternVL2-DA-RS.
        </p>
        <span className="inline-block bg-purple-600 text-white text-xs font-medium px-2 py-0.5 rounded">
          Mock Fusion Workspace
        </span>
      </section>

      {/* Configuration Card */}
      <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Fusion Analysis Configuration</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Optical Source */}
          <div className="border border-gray-100 rounded p-3">
            <h3 className="font-medium text-gray-800 mb-1">OPTICAL SOURCE</h3>
            <p className="text-sm text-gray-600">Sentinel-2 (Optical RGB/NIR) - 2024-03-15</p>
            <p className="text-xs text-green-600 mt-1">Status: Ready</p>
          </div>
          {/* SAR Source */}
          <div className="border border-gray-100 rounded p-3">
            <h3 className="font-medium text-gray-800 mb-1">SAR SOURCE</h3>
            <p className="text-sm text-gray-600">Sentinel-1 (SAR GRD Amplitude) - 2024-03-16</p>
            <p className="text-xs text-green-600 mt-1">Status: Ready</p>
          </div>
          {/* Parameters */}
          <div className="border border-gray-100 rounded p-3">
            <h3 className="font-medium text-gray-800 mb-1">PARAMETERS</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                "NDVI",
                "Cross-Modal Mask",
                "Cloud Penetration",
                "Land-Cover Classification",
              ].map((p) => (
                <span
                  key={p}
                  className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Fusion Analysis...
            </>
          ) : completed ? (
            "Fusion Analysis Complete"
          ) : (
            "⚡ Run Fusion Analysis"
          )}
        </button>
      </section>

      {/* Main Workspace */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Left – Multi‑Sensor Data View */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">1. Multi‑Sensor Data View</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Optical Image */}
            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80"
              alt="Optical Sentinel-2"
              className="w-full h-40 object-cover rounded"
            />
            {/* SAR Image */}
            <img
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80"
              alt="SAR Sentinel-1"
              className="w-full h-40 object-cover rounded filter grayscale contrast-125"
            />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setSync(!sync)}
              className={`px-2 py-0.5 rounded ${sync ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              [{sync ? "ON" : "OFF"}] Synchronize Views &amp; Pan‑Zoom
            </button>
          </div>
          <p className="text-xs text-gray-500">
            10m/px • Aligned via CROMA Preprocessing
          </p>
        </div>

        {/* Right – Agentic Model & Reasoning Engine */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">2. Agentic Model &amp; Reasoning Engine</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Active Backbone
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-gray-300 rounded p-1"
          >
            <option>CROMA + Mini-InternVL2-DA-RS</option>
            <option>CROMA Fusion</option>
            <option>Mini-InternVL2-DA-RS</option>
          </select>
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-1">Simulated Execution Pipeline</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Input Sensors</li>
              <li>CROMA Fusion</li>
              <li>Mini-InternVL2-DA‑RS</li>
              <li>LangGraph Agentic Controller</li>
              <li>Evidence‑Grounded Result</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Result Panels – only show after completed */}
      {completed && (
        <div className="space-y-6">
          {/* Evidence‑Backed Answer */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" /> LangGraph Agentic Synthesis
            </h4>
            <p className="text-sm text-gray-800 mb-2">
              Model: CROMA + Mini‑InternVL2‑DA‑RS
            </p>
            <p className="text-gray-800 mb-3">
              "The scene contains agricultural fields, vegetation, road infrastructure, and scattered built‑up regions."
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Agricultural fields are the dominant land‑cover pattern.</li>
              <li>Optical vegetation information combined with SAR backscatter helps distinguish cultivated areas.</li>
              <li>Road structures connect agricultural and built‑up regions.</li>
              <li>Scattered built‑up areas are visible around the road network.</li>
            </ul>
          </section>

          {/* Confidence */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Confidence Score</h4>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
              <div className="bg-purple-600 h-4 rounded-full" style={{ width: "89%" }}></div>
            </div>
            <p className="text-sm text-gray-600">89%</p>
          </section>

          {/* Fused Segmentation Map */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h4 className="flex items-center gap-2 text-lg font-semibold mb-2">
              <span role="img" aria-label="chart">📊</span> Fused Segmentation Map
            </h4>
            <p className="text-sm text-gray-600 mb-2">Mock cross‑modal land‑cover segmentation</p>
            {/* Simple color blocks to simulate segmentation */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="h-32 bg-purple-500 flex items-center justify-center text-white">
                Agricultural Land
              </div>
              <div className="h-32 bg-green-600 flex items-center justify-center text-white">
                Vegetation
              </div>
              <div className="h-32 bg-yellow-500 flex items-center justify-center text-white">
                Road
              </div>
              <div className="h-32 bg-red-600 flex items-center justify-center text-white">
                Built‑up Area
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="flex items-center"><span className="w-3 h-3 bg-purple-500 inline-block mr-1"></span> Agricultural Land</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-green-600 inline-block mr-1"></span> Vegetation</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-yellow-500 inline-block mr-1"></span> Road</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-red-600 inline-block mr-1"></span> Built‑up Area</span>
            </div>
          </section>

          {/* Execution Summary */}
          <section className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Execution Summary</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Task: Optical + SAR Analysis</li>
              <li>Optical: Sentinel-2 (Optical RGB/NIR)</li>
              <li>SAR: Sentinel-1 (SAR GRD Amplitude)</li>
              <li>Fusion: CROMA</li>
              <li>VQA / Grounding: Mini‑InternVL2‑DA‑RS</li>
              <li>Agent Controller: LangGraph</li>
              <li>Confidence: 89%</li>
              <li>Processing Time: 5.1 seconds</li>
              <li>Date: August 22, 2026, 04:15 PM</li>
              <li>Filename: agriculture_sar_optical.tif</li>
              <li>Status: Mock Analysis Complete</li>
            </ul>
          </section>

          {/* Follow‑up Button */}
          <div className="text-center">
            <button
              onClick={() => alert("Follow‑up interaction will be connected to the agentic backend later.")}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Continue Chat / Ask Follow‑up
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
