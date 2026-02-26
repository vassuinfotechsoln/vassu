"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Headphones } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-50 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-black text-[rgb(var(--color-text-primary))]">
              Vassu<span className="gradient-text">Talks</span>
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border)/0.5)] transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "min(288px, 85vw)" }}
      >
        <Sidebar onNavigate={() => setIsOpen(false)} />
      </div>
    </>
  );
}
