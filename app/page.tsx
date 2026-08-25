"use client";

import HeroBanner from "@/components/HeroBanner";
import WorkspaceGrid from "@/components/WorkspaceGrid";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 py-8 w-full">
      <HeroBanner />
      <WorkspaceGrid />
    </main>
  );
}
