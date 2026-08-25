"use client";

import Link from "next/link";
import { Sparkles, Home, Image, GitCompare, Orbit, Clock, BookOpen } from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Single Image Analysis", href: "/single", icon: Image },
  { name: "Change Detection", href: "/change", icon: GitCompare },
  { name: "Optical + SAR Analysis", href: "/optical-sar", icon: Orbit },
  { name: "My History", href: "/history", icon: Clock },
  { name: "Saved Results", href: "/saved", icon: BookOpen },
];

export default function Sidebar() {
  // For demo purposes, highlight Home as active
  const activeHref = "/";
  return (
    <nav className="relative flex flex-col w-64 bg-[#F4F9FF] border-r border-slate-200/80 p-4 rounded-2xl shadow-sm h-screen overflow-y-auto">
      {/* Cloud decorations */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/30 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 left-8 w-32 h-32 bg-white/25 rounded-full filter blur-2xl"></div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 px-2 relative z-10">
        <Sparkles className="text-purple-600 h-6 w-6" />
        <h1 className="text-2xl font-bold">
          <span className="text-slate-800 dark:text-white">SatQuery</span>
          <span className="text-purple-600">AI</span>
        </h1>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-2 relative z-10">
        {navigation.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isActive ? "bg-purple-100 text-purple-600" : "text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom branding card with scenic image */}
      <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200 text-sm text-purple-800 relative z-10">
        <p className="font-medium">Empowering insights from space to support a sustainable Earth.</p>
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80"
          alt="Scenic landscape"
          className="mt-2 w-full h-24 object-cover rounded-md"
        />
      </div>
    </nav>
  );
}
