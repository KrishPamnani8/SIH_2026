// app/history/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Trash2 } from "lucide-react";

// ---------- Mock Data ----------
interface HistoryRecord {
  id: number;
  type: string;
  question: string;
  filename: string;
  date: string; // ISO string
  confidence: number;
  answer: string;
  highlights: string[];
  model: string;
  processingTime: string;
  image: string; // URL or placeholder
}

const mockRecords: HistoryRecord[] = [
  {
    id: 1,
    type: "Single Image Analysis",
    question: "What is present in this image?",
    filename: "urban_area_01.tif",
    date: "2026-08-24T15:42:00",
    confidence: 87,
    answer:
      "The image shows a mixed urban and semi‑urban landscape with dense built‑up areas, road networks, vegetation, and a small water body.",
    highlights: ["Water Body", "Vegetation", "Road", "Built-up Area"],
    model: "GeoChat-7B",
    processingTime: "2.8 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    type: "Change Detection",
    question: "How has this area changed between the two dates?",
    filename: "city_change_detection.tif",
    date: "2026-08-23T11:20:00",
    confidence: 91,
    answer:
      "Significant expansion of built‑up regions is visible along the eastern section, with corresponding changes in vegetation coverage.",
    highlights: ["Built-up Area", "Vegetation", "Road"],
    model: "GeoChat-7B",
    processingTime: "4.6 seconds",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    type: "Optical + SAR Analysis",
    question: "Identify the major land‑cover features.",
    filename: "agriculture_sar_optical.tif",
    date: "2026-08-22T16:15:00",
    confidence: 89,
    answer:
      "The scene contains agricultural fields, vegetation, road infrastructure, and scattered built‑up regions.",
    highlights: ["Agricultural Land", "Vegetation", "Road", "Built-up Area"],
    model: "GeoChat-7B",
    processingTime: "5.1 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    type: "Single Image Analysis",
    question: "Is there any visible water body?",
    filename: "river_region_04.tif",
    date: "2026-08-20T13:35:00",
    confidence: 94,
    answer: "A prominent water body is visible across the central portion of the image.",
    highlights: ["Water Body", "Vegetation"],
    model: "GeoChat-7B",
    processingTime: "2.4 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    type: "Single Image Analysis",
    question: "Describe the land use in this scene.",
    filename: "rural_landscape_05.tif",
    date: "2026-08-18T10:10:00",
    confidence: 86,
    answer:
      "The scene is primarily agricultural, with cultivated fields, vegetation patches, connecting roads, and small settlements.",
    highlights: ["Agricultural Land", "Vegetation", "Road", "Built-up Area"],
    model: "GeoChat-7B",
    processingTime: "3.2 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    type: "Change Detection",
    question: "Where are the major changes concentrated?",
    filename: "development_zone_06.tif",
    date: "2026-08-15T17:45:00",
    confidence: 82,
    answer:
      "Major changes are concentrated around the northern development corridor, where built‑up expansion is visible.",
    highlights: ["Built-up Area", "Road", "Vegetation"],
    model: "GeoChat-7B",
    processingTime: "4.1 seconds",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  },
];

// ---------- Helper ----------
const highlightColors: Record<string, string> = {
  "Water Body": "bg-blue-500",
  Vegetation: "bg-green-500",
  Road: "bg-yellow-500",
  "Built-up Area": "bg-red-500",
  "Agricultural Land": "bg-purple-500",
};

// ---------- Component ----------
export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>(mockRecords);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null);

  const filtered = useMemo(() => {
    if (!search) return records;
    const lower = search.toLowerCase();
    return records.filter((r) =>
      r.question.toLowerCase().includes(lower) ||
      r.filename.toLowerCase().includes(lower) ||
      r.type.toLowerCase().includes(lower) ||
      r.highlights.some((h) => h.toLowerCase().includes(lower))
    );
  }, [records, search]);

  const pageSize = 3;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleDelete = (id: number) => {
    if (confirm("Delete this history record?")) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const resetPageIfOutOfBounds = () => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  };

  // ensure page stays valid when filtered changes
  React.useEffect(() => {
    resetPageIfOutOfBounds();
  }, [filtered, totalPages]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-800">Analysis History</h1>
      <p className="mt-1 text-gray-600 mb-6">
        Review and manage your past analyses and interactions.
      </p>

      {/* Search */}
      <div className="relative mb-6 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search analyses..."
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Records Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No analyses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col h-full"
            >
              {/* Image */}
              <img
                src={rec.image}
                alt={rec.filename}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              {/* Type */}
              <p className="text-sm font-medium text-purple-600 mb-1">{rec.type}</p>
              {/* Question */}
              <p className="text-sm font-medium text-gray-800 flex-1 mb-2 line-clamp-2">
                {rec.question}
              </p>
              {/* Date & Confidence */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{new Date(rec.date).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}</span>
                <span>Confidence: {rec.confidence}%</span>
              </div>
              {/* Highlights */}
              <div className="flex flex-wrap gap-1 mb-3">
                {rec.highlights.map((h) => (
                  <span
                    key={h}
                    className={`text-xs text-white px-2 py-0.5 rounded ${highlightColors[h] || "bg-gray-400"}`}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {/* Actions */}
              <div className="mt-auto flex justify-between items-center">
                <button
                  onClick={() => setDetailRecord(rec)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${page === 1 ? "text-gray-400" : "text-purple-600 hover:bg-purple-50"}`}
          >
            &lt; Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 rounded ${num === page ? "bg-purple-600 text-white" : "text-purple-600 hover:bg-purple-50"}`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${page === totalPages ? "text-gray-400" : "text-purple-600 hover:bg-purple-50"}`}
          >
            Next &gt;
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setDetailRecord(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <img
              src={detailRecord.image}
              alt={detailRecord.filename}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {detailRecord.type}
            </h2>
            <p className="text-sm text-gray-600 mb-2"><strong>Question:</strong> {detailRecord.question}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Answer:</strong> {detailRecord.answer}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>File:</strong> {detailRecord.filename}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Date:</strong> {new Date(detailRecord.date).toLocaleString()}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Model:</strong> {detailRecord.model}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Processing Time:</strong> {detailRecord.processingTime}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Confidence:</strong> {detailRecord.confidence}%</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {detailRecord.highlights.map((h) => (
                <span
                  key={h}
                  className={`text-xs text-white px-2 py-0.5 rounded ${highlightColors[h] || "bg-gray-400"}`}
                >
                  {h}
                </span>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => alert("Re‑run functionality will be connected to the analysis workspace when backend integration is added.")}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:opacity-90"
              >
                Re‑run Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
