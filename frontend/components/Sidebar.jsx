"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Bot,
  FileText,
  Settings,
  BarChart3,
  PhoneCall,
  Moon,
  Sun,
  Plus,
  Activity,
  Sparkles,
  Headphones,
  Mic,
  Zap,
  Rocket,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Overview & analytics",
  },
  {
    name: "Live Calls",
    href: "/dashboard/calls",
    icon: PhoneCall,
    badge: "Live",
    description: "Active call monitoring",
  },
  {
    name: "AI Agents",
    href: "/dashboard/agents",
    icon: Bot,
    description: "Manage voice agents",
  },
  {
    name: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Rocket,
    badge: "Bulk",
    description: "Mass outreach systems",
  },
  {
    name: "Transcripts",
    href: "/dashboard/transcripts",
    icon: FileText,
    description: "Call history & logs",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configuration",
  },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-72 h-screen flex flex-col glass border-r border-[rgb(var(--color-border))]">
      {/* Logo Section */}
      <div className="p-6 border-b border-[rgb(var(--color-border)/0.5)]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-indigo-500/25 transition-all duration-300">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[rgb(var(--color-surface))] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
              Vassu<span className="gradient-text">Talks</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
              AI Voice Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-b border-[rgb(var(--color-border)/0.5)]">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border)/0.5)]">
            <div className="flex items-center gap-2 mb-1">
              <div className="live-dot" />
              <span className="text-[10px] font-semibold uppercase text-[rgb(var(--color-text-muted))]">
                Active
              </span>
            </div>
            <p className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
              12
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border)/0.5)]">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-semibold uppercase text-[rgb(var(--color-text-muted))]">
                Health
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-500">99%</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
          Navigation
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.name}</p>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[rgb(var(--color-border)/0.5)] space-y-3">
        {/* Create Agent Button */}
        <Link
          href="/dashboard/agents/new"
          className="btn-base btn-primary w-full"
        >
          <Plus className="w-4 h-4" />
          <span>New Agent</span>
        </Link>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border)/0.5)]">
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              {theme === "dark" ? "Dark" : "Light"} Mode
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="relative w-11 h-6 rounded-full bg-[rgb(var(--color-border))] transition-colors hover:bg-[rgb(var(--color-text-muted)/0.3)]"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Version */}
        <p className="text-center text-[10px] font-semibold text-[rgb(var(--color-text-muted))]">
          Version 2.0.0 • Enterprise
        </p>
      </div>
    </aside>
  );
}
