"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Search,
  History,
  Bookmark,
  BarChart2,
  Settings,
  Play,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Search", href: "/search", icon: Search },
  { label: "History", href: "/history", icon: History },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-100 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500">
            <Play
              size={18}
              className="fill-white text-white"
            />
          </div>

          <span className="text-lg font-bold text-slate-900">
            Insight<span className="text-violet-500">Tube-AI</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-violet-50 text-violet-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}