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

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return dateStr;
  }
}

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
      setRecords((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        try {
          const liveOnly = updated.filter((r) => !mockRecords.some((m) => m.id === r.id));
          localStorage.setItem("satquery_history", JSON.stringify(liveOnly));
        } catch (e) {}
        return updated;
      });
    }
  };


  const resetPageIfOutOfBounds = () => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  };

  // ensure page stays valid when filtered changes & load live localStorage history
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("satquery_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords([...parsed, ...mockRecords]);
        }
      }
    } catch (e) {
      console.warn("Error loading history from localStorage:", e);
    }
    resetPageIfOutOfBounds();
  }, [filtered, totalPages]);


  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analysis History</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400 mb-6 font-medium text-sm">
        Review and manage your past analyses and interactions.
      </p>

      {/* Search */}
      <div className="relative mb-6 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search analyses..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
          <p className="text-slate-500 dark:text-slate-400">No analyses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((rec) => (
            <div
              key={rec.id}
              className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between h-[430px] backdrop-blur-md hover:shadow-md hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-200 overflow-hidden"
            >
              {/* Top content wrapper */}
              <div className="space-y-2.5">
                {/* Image */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-slate-950">
                  <img
                    src={rec.image}
                    alt={rec.filename}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/80 backdrop-blur-xs">
                    {rec.confidence}% Confidence
                  </span>
                </div>

                {/* Type Badge */}
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {rec.type}
                </p>

                {/* Question Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  {rec.question}
                </h3>

                {/* Date */}
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium" suppressHydrationWarning>
                  {formatDate(rec.date)}
                </p>

                {/* Highlights / Evidence Badges */}
                <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden pt-1">
                  {rec.highlights.slice(0, 3).map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/60 px-2.5 py-0.5 rounded-lg truncate max-w-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800/80 pt-3 mt-2">
                <button
                  onClick={() => setDetailRecord(rec)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Details &rarr;
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                  title="Delete record"
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
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl transition-colors">
            <button
              onClick={() => setDetailRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X size={20} />
            </button>
            <img
              src={detailRecord.image}
              alt={detailRecord.filename}
              className="w-full h-48 object-cover rounded-xl mb-4 border border-slate-200/50 dark:border-slate-800/50"
            />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {detailRecord.type}
            </h2>
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-white">Question:</strong> {detailRecord.question}</p>
              <p><strong className="text-slate-900 dark:text-white">Answer:</strong> {detailRecord.answer}</p>
              <p><strong className="text-slate-900 dark:text-white">File:</strong> {detailRecord.filename}</p>
              <p><strong className="text-slate-900 dark:text-white">Date:</strong> <span suppressHydrationWarning>{formatDate(detailRecord.date)}</span></p>
              <p><strong className="text-slate-900 dark:text-white">Model Engine:</strong> {detailRecord.model}</p>
              <p><strong className="text-slate-900 dark:text-white">Processing Time:</strong> {detailRecord.processingTime}</p>
              <p><strong className="text-slate-900 dark:text-white">Confidence:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{detailRecord.confidence}%</span></p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {detailRecord.highlights.map((h) => (
                <span
                  key={h}
                  className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-md ${highlightColors[h] || "bg-purple-600"}`}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
