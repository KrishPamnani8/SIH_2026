"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function ResultSection() {
  // Placeholder state – in a real app this would come from a context or props after upload.
  const hasResult = false;

  return (
    <section className="w-full max-w-4xl mx-auto">
      {hasResult ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80">
            {/* Example satellite image */}
            <Image
              src="/placeholder-sat.jpg"
              alt="Satellite view"
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200/80">
            <h2 className="text-lg font-semibold mb-2 text-slate-800">AI Answer</h2>
            <p className="text-slate-600">The region shows recent deforestation activity… (placeholder text)</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="animate-spin mr-2" />
          <span>No results yet – upload an image to begin.</span>
        </div>
      )}
    </section>
  );
}
