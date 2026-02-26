"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Users,
  Phone,
  Building2,
  Trash2,
  Play,
  Bot,
  CheckCircle2,
  AlertCircle,
  Timer,
  Zap,
  PhoneCall,
  PhoneOff,
  Clock,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";

export default function BulkUploadModal({
  isOpen,
  onClose,
  agents,
  onCampaignLaunched,
}) {
  const [fileData, setFileData] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  // Live progress state
  const [progress, setProgress] = useState(null); // null = not started
  // progress = { current, total, results: [{number, status}] }

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ── Phone extraction helpers ──────────────────────────────────────────
  const PHONE_REGEX =
    /(?:\+?91[-.\s]?)?[6-9]\d{9}|\+?1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?[1-9]\d{9,14}/g;

  const extractNumbers = (raw) => {
    const str = String(raw ?? "");
    const matches = str.match(PHONE_REGEX) || [];
    // Keep only those that reduce to 10 digits (Indian) or are international
    return matches.filter((m) => {
      const digits = m.replace(/\D/g, "");
      return (
        digits.length === 10 || digits.length === 12 || digits.length >= 11
      );
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Get raw text of all cells to find numbers anywhere in the sheet
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

        // Also parse as objects for name / company
        const objRows = XLSX.utils.sheet_to_json(ws, { raw: false });

        // Build a map: phone → row data
        const seen = new Set();
        const formatted = [];
        let idx = 0;

        // Strategy 1: use named columns
        objRows.forEach((row) => {
          const nameVal =
            row.Name || row.name || row.customer_name || row.Customer || "";
          const companyVal =
            row.Company || row.company || row.organization || row.Org || "";

          // Try every cell value for a phone number
          Object.values(row).forEach((cellVal) => {
            const nums = extractNumbers(cellVal);
            nums.forEach((num) => {
              const digits = num.replace(/\D/g, "");
              const key = digits.slice(-10); // last 10 digits as dedup key
              if (!seen.has(key)) {
                seen.add(key);
                formatted.push({
                  id: idx++,
                  name: String(nameVal).trim() || "—",
                  number: num.trim(),
                  company: String(companyVal).trim() || "—",
                  valid: digits.length === 10 || digits.length >= 11,
                });
              }
            });
          });
        });

        // Strategy 2: scan raw cell text for any missed numbers
        if (formatted.length === 0) {
          rawRows.flat().forEach((cell) => {
            const nums = extractNumbers(cell);
            nums.forEach((num) => {
              const digits = num.replace(/\D/g, "");
              const key = digits.slice(-10);
              if (!seen.has(key)) {
                seen.add(key);
                formatted.push({
                  id: idx++,
                  name: "—",
                  number: num.trim(),
                  company: "—",
                  valid: digits.length === 10 || digits.length >= 11,
                });
              }
            });
          });
        }

        if (formatted.length === 0) {
          setError(
            "No 10-digit phone numbers found. Make sure the file has a 'Number' or 'Phone' column, or any column containing 10-digit numbers.",
          );
        } else {
          setFileData(formatted);
        }
      } catch (err) {
        setError(
          "Error parsing file. Please use a valid .xlsx, .xls or .csv file.",
        );
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const removeEntry = (id) => setFileData(fileData.filter((i) => i.id !== id));

  const handleLaunch = async () => {
    if (!selectedAgentId) {
      setError("Please select an agent for this deployment.");
      return;
    }
    if (fileData.length === 0) {
      setError("Please upload a valid file first.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress({ current: 0, total: fileData.length, results: [] });

    try {
      const response = await fetch("http://127.0.0.1:3001/api/calls/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          recipients: fileData,
          intervalSeconds,
        }),
      });

      if (!response.ok) throw new Error("Bulk launch failed");
      const result = await response.json();

      // Simulate live progress from results (backend dispatches sequentially)
      const allResults = result.results || [];
      for (let i = 0; i < allResults.length; i++) {
        await new Promise((r) => setTimeout(r, 300)); // UI tick
        setProgress((p) => ({
          ...p,
          current: i + 1,
          results: [...p.results, allResults[i]],
        }));
      }

      const agent = agents.find((a) => a.id === selectedAgentId);
      if (onCampaignLaunched) {
        onCampaignLaunched({
          name: `Bulk Campaign – ${new Date().toLocaleDateString()}`,
          agent,
          count: fileData.length,
          recipients: fileData,
          serverResult: result,
        });
      }
    } catch (err) {
      setError(`Failed to launch campaign: ${err.message}`);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // prevent close while running
    setFileData([]);
    setFileName("");
    setSelectedAgentId("");
    setIntervalSeconds(5);
    setError("");
    setProgress(null);
    onClose();
  };

  const intervalLabel =
    intervalSeconds <= 2
      ? "Rapid Fire (2s)"
      : intervalSeconds <= 5
        ? "Standard (5s)"
        : intervalSeconds <= 15
          ? "Moderate (15s)"
          : `${intervalSeconds}s Delay`;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[rgb(var(--color-surface))] w-full max-w-5xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[rgb(var(--color-border))] overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[92vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* ── Header ── */}
        <div className="p-4 sm:p-8 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-indigo-600/10 to-purple-600/10 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Upload className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-[rgb(var(--color-text-primary))]">
                Bulk <span className="gradient-text">Dialer Core</span>
              </h2>
              <p className="text-xs sm:text-sm text-[rgb(var(--color-text-muted))] font-medium hidden sm:block">
                Auto-extracts 10-digit numbers · Customizable call interval
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-[rgb(var(--color-background))] rounded-full transition-colors text-[rgb(var(--color-text-muted))] disabled:opacity-40"
          >
            <X size={24} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── Live progress overlay ── */}
          {progress && (
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span className="font-black text-sm uppercase tracking-widest text-indigo-400">
                    Campaign Live
                  </span>
                </div>
                <span className="text-sm font-bold text-[rgb(var(--color-text-muted))]">
                  {progress.current} / {progress.total} dispatched
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              {/* Mini log */}
              <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-[11px]">
                {progress.results.slice(-6).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-[rgb(var(--color-text-muted))]"
                  >
                    {r.sid?.startsWith("mock") ? (
                      <PhoneOff size={10} className="text-amber-400 shrink-0" />
                    ) : (
                      <PhoneCall
                        size={10}
                        className="text-emerald-400 shrink-0"
                      />
                    )}
                    <span className="text-emerald-400">{r.number}</span>
                    <span className="text-[rgb(var(--color-text-muted))]">
                      →
                    </span>
                    <span
                      className={
                        r.sid?.startsWith("mock")
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {r.sid?.startsWith("mock") ? "simulation" : "initiated"}
                    </span>
                  </div>
                ))}
              </div>
              {progress.current === progress.total && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm pt-2">
                  <CheckCircle2 size={16} />
                  All {progress.total} calls dispatched successfully!
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left Controls ── */}
            <div className="lg:col-span-1 space-y-6">
              {/* 1. Agent */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-3">
                  1. Select AI Agent
                </label>
                <div className="relative">
                  <Bot className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
                  <select
                    className="w-full pl-11 pr-4 py-4 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-[rgb(var(--color-text-primary))] font-bold appearance-none transition-all"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select an agent...</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Upload */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-3">
                  2. Choose Data Sheet
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={loading}
                  className="w-full group p-6 border-2 border-dashed border-[rgb(var(--color-border))] rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all disabled:opacity-40"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--color-background))] flex items-center justify-center border border-[rgb(var(--color-border))] group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-indigo-500" />
                  </div>
                  <div className="text-center">
                    {fileName ? (
                      <>
                        <p className="text-sm font-bold text-emerald-400 truncate max-w-[180px]">
                          {fileName}
                        </p>
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-1">
                          Click to replace
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                          Click to upload
                        </p>
                        <p className="text-[10px] text-[rgb(var(--color-text-muted))] font-medium uppercase tracking-tight mt-1">
                          Excel or CSV • auto-extracts numbers
                        </p>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* 3. Interval */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-3">
                  3. Call Interval
                </label>
                <div className="p-5 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-black text-[rgb(var(--color-text-muted))] uppercase tracking-wider">
                        Delay between calls
                      </span>
                    </div>
                    <span className="text-sm font-black text-indigo-400">
                      {intervalSeconds}s
                    </span>
                  </div>
                  <div className="relative py-1">
                    <input
                      type="range"
                      min={1}
                      max={60}
                      step={1}
                      value={intervalSeconds}
                      onChange={(e) =>
                        setIntervalSeconds(Number(e.target.value))
                      }
                      disabled={loading}
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((intervalSeconds - 1) / 59) * 100}%, #334155 ${((intervalSeconds - 1) / 59) * 100}%, #334155 100%)`,
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-indigo-500/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-400 [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[rgb(var(--color-text-muted))] uppercase">
                    <span>1s (fast)</span>
                    <span className="text-indigo-400">{intervalLabel}</span>
                    <span>60s (slow)</span>
                  </div>
                </div>
              </div>

              {/* Ready badge */}
              {fileData.length > 0 && (
                <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <div className="flex items-center gap-3 text-emerald-500 mb-1">
                    <CheckCircle2 size={18} />
                    <span className="font-black text-sm uppercase tracking-widest">
                      Ready to Launch
                    </span>
                  </div>
                  <p className="text-xs font-medium text-emerald-500/70">
                    {fileData.length} valid numbers extracted ·{" "}
                    {intervalSeconds}s interval
                  </p>
                  <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-1">
                    Est. duration: ~
                    {Math.ceil((fileData.length * intervalSeconds) / 60)} min
                  </p>
                </div>
              )}
            </div>

            {/* ── Preview Table ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                  Live Data Preview
                </label>
                {fileData.length > 0 && (
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {fileData.length} numbers auto-extracted
                  </span>
                )}
              </div>
              <div className="border border-[rgb(var(--color-border))] rounded-3xl overflow-hidden bg-[rgb(var(--color-background))]">
                <table className="w-full text-left">
                  <thead className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Recipient</th>
                      <th className="px-5 py-4">Number</th>
                      <th className="px-5 py-4">Organization</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--color-border))]">
                    {fileData.length > 0 ? (
                      fileData.map((row) => {
                        const dispatched = progress?.results.find((r) =>
                          r.number?.includes(
                            row.number?.replace(/\D/g, "").slice(-10),
                          ),
                        );
                        return (
                          <tr
                            key={row.id}
                            className="text-sm font-medium transition-colors hover:bg-indigo-500/5"
                          >
                            <td className="px-5 py-4">
                              {dispatched ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              ) : loading ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-bold text-[rgb(var(--color-text-primary))]">
                                {row.name}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs text-indigo-400 font-bold">
                                {row.number}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-[rgb(var(--color-text-muted))]">
                              {row.company}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => removeEntry(row.id)}
                                disabled={loading}
                                className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-all disabled:opacity-30"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-30">
                            <Users
                              size={48}
                              className="text-[rgb(var(--color-text-muted))]"
                            />
                            <p className="text-sm font-medium text-[rgb(var(--color-text-muted))]">
                              Upload a file — numbers are extracted
                              automatically
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-8 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]/30 flex gap-4">
          <Button
            variant="ghost"
            className="flex-none h-14 px-8 rounded-2xl font-bold"
            onClick={handleClose}
            disabled={loading}
          >
            {progress?.current === progress?.total && progress?.total > 0
              ? "Close"
              : "Discard Deployment"}
          </Button>
          <Button
            variant="primary"
            className="flex-1 h-14 rounded-2xl font-bold gap-3 shadow-lg shadow-indigo-500/20"
            disabled={loading || fileData.length === 0 || !selectedAgentId}
            onClick={handleLaunch}
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Dialing {progress?.current ?? 0} of {fileData.length}…
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Launch Neural Deployment ({fileData.length} Calls ·{" "}
                {intervalSeconds}s interval)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
