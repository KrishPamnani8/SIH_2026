// app/history/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { X } from "lucide-react";

// Types
interface Highlight {
  label: string;
  color: string;
}

interface HistoryRecord {
  id: string;
  analysisType: string;
  question: string;
  filename: string;
  date: string; // formatted date string
  confidence: number;
  answer: string;
  highlights: Highlight[];
  model: string;
  processingTime: string;
  image: string; // placeholder image URL
}

// Mock data (static)
const mockData: HistoryRecord[] = [
  {
    id: "1",
    analysisType: "Optical + SAR Analysis",
    question: "Identify the major land-cover features.",
    filename: "agriculture_sar_optical.tif",
    date: "August 22, 2026, 04:15 PM",
    confidence: 89,
    answer:
      "The scene contains agricultural fields, vegetation, road infrastructure, and scattered built-up regions.",
    highlights: [
      { label: "Agricultural Land", color: "#7C3AED" },
      { label: "Vegetation", color: "#10B981" },
      { label: "Road", color: "#F59E0B" },
      { label: "Built-up Area", color: "#EF4444" },
    ],
    model: "GeoChat-7B",
    processingTime: "5.1 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    analysisType: "Single Image Analysis",
    question: "What is visible in this image?",
    filename: "forest_satellite.png",
    date: "August 22, 2026, 02:45 PM",
    confidence: 92,
    answer: "Dense forest cover with a clear river flowing through the center.",
    highlights: [
      { label: "Forest", color: "#7C3AED" },
      { label: "Water Body", color: "#3B82F6" },
    ],
    model: "GeoChat-7B",
    processingTime: "3.2 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    analysisType: "Change Detection",
    question: "Detect changes between two dates.",
    filename: "urban_change.tif",
    date: "August 21, 2026, 11:10 AM",
    confidence: 85,
    answer:
      "New construction sites appear in the southern quadrant, while vegetation decreased slightly.",
    highlights: [
      { label: "Built-up Area", color: "#EF4444" },
      { label: "Vegetation", color: "#10B981" },
    ],
    model: "GeoChat-7B",
    processingTime: "4.0 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    analysisType: "Single Image Analysis",
    question: "Identify water bodies.",
    filename: "coastal_region.tif",
    date: "August 20, 2026, 09:30 AM",
    confidence: 88,
    answer: "Coastal shoreline with several scattered lagoons.",
    highlights: [{ label: "Water Body", color: "#3B82F6" }],
    model: "GeoChat-7B",
    processingTime: "2.8 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    analysisType: "Change Detection",
    question: "Show flood impact.",
    filename: "flood_map.tif",
    date: "August 20, 2026, 07:15 AM",
    confidence: 80,
    answer: "Significant flooding observed in low‑lying areas.",
    highlights: [
      { label: "Water Body", color: "#3B82F6" },
      { label: "Built-up Area", color: "#EF4444" },
    ],
    model: "GeoChat-7B",
    processingTime: "3.6 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
];

// Helper for highlight badge colors
const highlightClass = (color: string) => {
  const map: Record<string, string> = {
    "#7C3AED": "bg-purple-500",
    "#10B981": "bg-green-500",
    "#F59E0B": "bg-yellow-500",
    "#EF4444": "bg-red-500",
    "#3B82F6": "bg-blue-500",
  };
  return map[color] || "bg-gray-400";
};

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<HistoryRecord[]>(mockData);
  const [selected, setSelected] = useState<HistoryRecord | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.question.toLowerCase().includes(term) ||
        r.analysisType.toLowerCase().includes(term) ||
        r.filename.toLowerCase().includes(term) ||
        r.highlights.some((h) => h.label.toLowerCase().includes(term))
    );
  }, [searchTerm, records]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [page, filtered]);

  // Group by date (date part only)
  const grouped = useMemo(() => {
    const map = new Map<string, HistoryRecord[]>();
    paginated.forEach((rec) => {
      const datePart = rec.date.split(",")[0];
      if (!map.has(datePart)) map.set(datePart, []);
      map.get(datePart)!.push(rec);
    });
    return Array.from(map.entries());
  }, [paginated]);

  const handleDelete = (id: string) => {
    if (confirm("Delete this record?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleRerun = () => {
    alert("Analysis parameters loaded into the workspace.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8">
      {/* Hero */}
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#111827]">Analysis History</h1>
        <p className="text-[#6B7280] mt-1">Review and manage your past analyses and interactions.</p>
        <span className="inline-block mt-2 px-3 py-1 text-sm font-medium text-white bg-[#7C3AED] rounded-md">Mock History</span>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search analyses..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
      </div>

      {/* Records */}
      {grouped.length === 0 ? (
        <p className="text-gray-500">No analyses found.</p>
      ) : (
        grouped.map(([date, recs]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-semibold text-[#111827] mb-4">{date}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recs.map((rec) => (
                <div key={rec.id} className="bg-white rounded-lg shadow-md flex flex-col h-full">
                  <img src={rec.image} alt={rec.filename} className="h-40 w-full object-cover rounded-t-lg" />
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-medium text-[#111827]">{rec.analysisType}</h3>
                    <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{rec.question}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{rec.filename}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{rec.date}</p>
                    {/* Confidence */}
                    <div className="mt-2">
                      <div className="text-xs text-[#6B7280] mb-1">Confidence: {rec.confidence}%</div>
                      <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                        <div className="bg-[#7C3AED] h-2 rounded-full" style={{ width: `${rec.confidence}%` }} />
                      </div>
                    </div>
                    {/* Highlights */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {rec.highlights.map((hl) => (
                        <span key={hl.label} className={`flex items-center text-xs px-2 py-0.5 rounded-full ${highlightClass(hl.color)}`}>
                          {hl.label}
                        </span>
                      ))}
                    </div>
                    {/* Actions */}
                    <div className="mt-4 flex space-x-2">
                      <button onClick={() => setSelected(rec)} className="flex-1 text-xs bg-[#7C3AED] text-white py-1 rounded">View Details</button>
                      <button onClick={handleRerun} className="flex-1 text-xs bg-gray-200 text-[#111827] py-1 rounded">Re‑run Analysis</button>
                      <button onClick={() => handleDelete(rec.id)} className="flex-1 text-xs bg-red-500 text-white py-1 rounded">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50">&lt;</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-md ${page === i + 1 ? "bg-[#7C3AED] text-white" : "bg-gray-200"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50">&gt;</button>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <img src={selected.image} alt={selected.filename} className="w-full h-48 object-cover rounded mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{selected.analysisType}</h2>
            <p className="text-sm text-gray-600 mb-1"><strong>Question:</strong> {selected.question}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Answer:</strong> {selected.answer}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>File:</strong> {selected.filename}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Date:</strong> {selected.date}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Model:</strong> {selected.model}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Processing Time:</strong> {selected.processingTime}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Confidence:</strong> {selected.confidence}%</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selected.highlights.map((hl) => (
                <span key={hl.label} className={`text-xs text-white px-2 py-0.5 rounded ${highlightClass(hl.color)}`}>{hl.label}</span>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button onClick={handleRerun} className="px-4 py-2 bg-[#7C3AED] text-white rounded hover:opacity-90">Re‑run Analysis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
