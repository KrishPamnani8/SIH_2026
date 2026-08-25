"use client";

import { Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F5F0FF] via-[#EDE9FE] to-[#FFE5B4] p-8 text-gray-800 shadow-md w-full">
      {/* Earth + satellite illustration on the far right */}
      <img
        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80"
        alt="Earth from space with satellite"
        className="absolute top-1/2 right-8 w-64 h-64 object-cover translate-y-[-50%]"
      />

      {/* Text content occupies left side */}
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-3xl font-bold mb-2">Welcome to SatQuery AI</h2>
        <p className="text-lg mb-4">Your interactive assistant for satellite image understanding.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm">
            <Sparkles size={14} /> Ask in Natural Language
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm">
            🛰️ Multi‑Modal Support
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm">
            🛡️ Evidence‑Based Answers
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm">
            📥 Download & Share Results
          </span>
        </div>
      </div>
    </section>
  );
}
