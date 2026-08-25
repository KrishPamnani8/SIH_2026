"use client";

import * as React from "react";
import { Switch } from "@radix-ui/react-switch";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const checked = theme === "dark";

  return (
    <label className="flex items-center gap-2 cursor-pointer rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">
      <Sun size={16} className="text-yellow-500" />
      <Switch
        checked={checked}
        onCheckedChange={c => setTheme(c ? "dark" : "light")}
        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-slate-300"
      >
        <span className="sr-only">Toggle theme</span>
        <span className="pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
      </Switch>
      <Moon size={16} className="text-gray-600" />
    </label>
  );
}
