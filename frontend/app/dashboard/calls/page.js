"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  History,
  Filter,
  Download,
  Search,
  Calendar,
} from "lucide-react";
import CallLogTable from "@/components/CallLogTable";

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch("/api/calls", { signal: AbortSignal.timeout(5000) });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const callsArray = Array.isArray(data) ? data : [];
      setCalls(callsArray);
    } catch (error) {
      console.error("Failed to fetch calls:", error);
      setCalls([]); // Set empty array as fallback
    }
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.phoneNumber?.includes(searchTerm) ||
      call.agentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || call.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <History className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-2">
                Call Archive
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Complete history of all voice interactions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group">
              <Download className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
            </button>
            <button className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group">
              <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-3xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search calls, numbers, agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-muted))] font-medium transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-[rgb(var(--color-text-primary))] font-medium transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="ANSWERED">In Progress</option>
                <option value="INITIATED">Initiated</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                  {filteredCalls.length}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Total
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {filteredCalls.filter((c) => c.status === "completed").length}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Success
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Log Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <CallLogTable calls={filteredCalls} onRefresh={fetchCalls} />
      </div>
    </div>
  );
}
