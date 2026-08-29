"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const activeHref = pathname || "/";

  return (
    <nav className="relative flex flex-col w-64 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm h-screen overflow-y-auto transition-colors">
      {/* Glow decorations */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 dark:bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 px-2 relative z-10">
        <Sparkles className="text-purple-600 dark:text-purple-400 h-6 w-6" />
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-slate-900 dark:text-white">SatQuery</span>
          <span className="text-purple-600 dark:text-purple-400">AI</span>
        </h1>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-1.5 relative z-10">
        {navigation.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <li key={item.name}>
              <a
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-semibold shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.name}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Bottom branding card */}
      <div className="mt-4 p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200/80 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200 relative z-10">
        <p className="font-semibold leading-relaxed">Empowering insights from space to support a sustainable Earth.</p>
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80"
          alt="Scenic landscape"
          className="mt-2.5 w-full h-20 object-cover rounded-lg border border-purple-200/50 dark:border-purple-800/50"
        />
      </div>
    </nav>
  );
}

