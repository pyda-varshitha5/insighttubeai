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
  Bell,
  Play,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import HistoryIllustration from "@/components/history/HistoryIllustration";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Search", href: "/search", icon: Search },
  { label: "History", href: "/history", icon: History },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-100 bg-white flex flex-col">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
            <Play size={16} className="text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900">
            InsightTube<span className="text-violet-500">-AI</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-violet-50 text-violet-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-6 pt-2">
          <HistoryIllustration />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-4 px-8 py-5 border-b border-slate-100 bg-white">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Keep Learning Smarter, {firstName}! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Learn any topic from YouTube, the smarter way.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search any topic..."
                className="pl-9 pr-3 py-2 w-64 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <button
              type="button"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
            >
              <Bell size={16} />
            </button>

            <div className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-semibold">
              V
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}