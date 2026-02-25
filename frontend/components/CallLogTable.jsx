"use client";

import { useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  User,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Play,
  FileText,
  Trash2,
} from "lucide-react";
import { formatDuration, formatPhoneNumber } from "@/lib/utils";

export default function CallLogTable({ calls = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCall, setSelectedCall] = useState(null);

  const filteredCalls = calls.filter(
    (call) =>
      call.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      INITIATED: { label: "Initiated", className: "badge-warning" },
      RINGING: { label: "Ringing", className: "badge-info" },
      ANSWERED: { label: "In Progress", className: "badge-success" },
      COMPLETED: { label: "Completed", className: "badge-neutral" },
      FAILED: { label: "Failed", className: "badge-error" },
    };
    const config = statusConfig[status] || statusConfig.INITIATED;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (calls.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgb(var(--color-background))] flex items-center justify-center">
          <PhoneIncoming className="w-8 h-8 text-[rgb(var(--color-text-muted))]" />
        </div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          No calls yet
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-muted))] max-w-sm mx-auto">
          Your call history will appear here once you start making or receiving
          calls.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-[rgb(var(--color-border)/0.5)] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2.5"
          />
        </div>
        <button className="btn-base btn-secondary">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Contact</th>
              <th className="hidden md:table-cell">Agent</th>
              <th className="hidden sm:table-cell">Duration</th>
              <th>Status</th>
              <th className="hidden lg:table-cell">Time</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.slice(0, 10).map((call) => (
              <tr
                key={call.id}
                className="cursor-pointer"
                onClick={() => setSelectedCall(call)}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        call.direction === "INBOUND"
                          ? "bg-emerald-500/10"
                          : "bg-indigo-500/10"
                      }`}
                    >
                      {call.direction === "INBOUND" ? (
                        <PhoneIncoming className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <PhoneOutgoing className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(var(--color-text-primary))]">
                        {formatPhoneNumber(call.phoneNumber) || "Unknown"}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-muted))] capitalize">
                        {call.direction?.toLowerCase() || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-purple-500" />
                    </div>
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {call.agent?.name || "Default Agent"}
                    </span>
                  </div>
                </td>
                <td className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[rgb(var(--color-text-muted))]" />
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {formatDuration(call.duration) || "0:00"}
                    </span>
                  </div>
                </td>
                <td>{getStatusBadge(call.status)}</td>
                <td className="hidden lg:table-cell">
                  <span className="text-sm text-[rgb(var(--color-text-muted))]">
                    {formatDate(call.startedAt)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 rounded-lg hover:bg-[rgb(var(--color-border)/0.5)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredCalls.length > 10 && (
        <div className="p-4 border-t border-[rgb(var(--color-border)/0.5)] flex items-center justify-between">
          <p className="text-sm text-[rgb(var(--color-text-muted))]">
            Showing 10 of {filteredCalls.length} calls
          </p>
          <button className="btn-base btn-ghost text-sm">
            Load More
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
