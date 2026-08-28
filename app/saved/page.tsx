"use client";

import React, { useEffect, useState } from "react";

import { BookOpen, Star, Trash2, Search, ExternalLink, ShieldCheck, Download, Calendar } from "lucide-react";

interface SavedResult {
  id: number;
  type: string;
  question: string;
  filename: string;
  date: string;
  confidence: number;
  answer: string;
  evidence: string[];
  model: string;
  image: string;
}

export default function SavedResultsPage() {
  const [savedItems, setSavedItems] = useState<SavedResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const items = JSON.parse(localStorage.getItem("satquery_saved_results") || "[]");
      setSavedItems(items);
    } catch (e) {
      console.warn("Could not load satquery_saved_results:", e);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
      </div>
    );
  }


  const handleRemove = (id: number) => {
    const updated = savedItems.filter((item) => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem("satquery_saved_results", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all saved results?")) {
      setSavedItems([]);
      localStorage.removeItem("satquery_saved_results");
    }
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "single" && item.type.includes("Single")) ||
      (selectedFilter === "change" && item.type.includes("Change")) ||
      (selectedFilter === "optical-sar" && item.type.includes("Optical"));
    return matchesSearch && matchesFilter;
  });

  const downloadPDF = async (item: SavedResult) => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("SatQuery AI - Saved Report", 14, 20);
    pdf.setFontSize(11);
    pdf.text(`Date: ${new Date(item.date).toLocaleString()}`, 14, 30);
    pdf.text(`Type: ${item.type}`, 14, 38);
    pdf.text(`Query: ${item.question}`, 14, 46);
    pdf.text(`Model: ${item.model} (${item.confidence}% Confidence)`, 14, 54);
    
    pdf.setFontSize(13);
    pdf.text("Analysis Answer:", 14, 68);
    pdf.setFontSize(10);
    const splitAnswer = pdf.splitTextToSize(item.answer, 180);
    pdf.text(splitAnswer, 14, 76);

    pdf.save(`satquery_saved_report_${item.id}.pdf`);
  };


  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" /> Saved Results & Favorites
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 font-medium text-sm">
            Access your bookmarked Earth Observation analysis reports, confidence metrics, and evidence logs.
          </p>
        </div>

        {savedItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-bold hover:bg-red-100 transition shadow-2xs cursor-pointer self-start md:self-auto"
          >
            Clear All Saved ({savedItems.length})
          </button>
        )}
      </div>

      {/* Search and Filter Controls */}
      {savedItems.length > 0 && (
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by query, answer keyword, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {["all", "single", "change", "optical-sar"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                  selectedFilter === filter
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {filter === "all" ? "All Saved" : filter.replace("-", " + ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Saved Cards */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-950">
                  <img src={item.image} alt="saved preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                    {item.type}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={12} /> {item.confidence}% Conf.
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Calendar size={13} /> {new Date(item.date).toLocaleString()}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2" title={item.question}>
                    &quot;{item.question}&quot;
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 font-medium">
                    {item.answer}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => downloadPDF(item)}
                  className="flex-1 py-2 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> PDF Report
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition cursor-pointer"
                  title="Remove from favorites"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 backdrop-blur-md transition-colors">
          <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 w-16 h-16 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Saved Reports Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed font-medium">
            Analyze any satellite image on the Single, Change, or Optical+SAR dashboards and click <span className="text-purple-600 dark:text-purple-400 font-bold">&quot;Save Result&quot;</span> to access them here.
          </p>
        </div>
      )}
    </div>
  );
}

