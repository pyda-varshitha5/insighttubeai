import React, { useState } from "react";
import { Play, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500 text-white">
              <Play size={16} fill="currentColor" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              InsightTube<span className="text-violet-500">-AI</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors rounded-xl px-4 py-2 shadow-sm shadow-violet-200"
            >
              Sign up free
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
            <a
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 text-center py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors rounded-xl text-center py-2.5 shadow-sm shadow-violet-200"
            >
              Sign up free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}