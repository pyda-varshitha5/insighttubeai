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
  User,
  Settings,
  Play,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-100 bg-white flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Play size={16} className="text-white fill-white" />
        </div>
        <span className="font-bold text-slate-900">
          InsightTube<span className="text-violet-500">-AI</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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