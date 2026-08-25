"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function AboutDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-700 hover:bg-purple-200">
          About SatQuery <ChevronDown size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="rounded-lg bg-white shadow-md p-4"
        sideOffset={5}
      >
        <p className="max-w-xs text-sm text-slate-700">
          SatQuery AI lets you ask natural‑language questions about satellite imagery and receive evidence‑based answers.
        </p>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
