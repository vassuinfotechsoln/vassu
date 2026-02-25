"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Headphones } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden sticky top-0 z-50 glass border-b border-[rgb(var(--color-border))]">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              Vassu<span className="gradient-text">Talks</span>
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))]"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 animate-slide-in-right">
            <Sidebar onNavigate={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
