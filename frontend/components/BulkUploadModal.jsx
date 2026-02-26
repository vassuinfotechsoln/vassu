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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map data to expected format
        const formattedData = data
          .map((row, index) => ({
            id: index,
            name: row.Name || row.name || row.customer_name || "",
            number: row.Number || row.number || row.phone || row.Phone || "",
            company: row.Company || row.company || row.organization || "",
          }))
          .filter((item) => item.number);

        if (formattedData.length === 0) {
          setError(
            "No valid phone numbers found in the file. Ensure columns are named 'Name', 'Number', and 'Company'.",
          );
        } else {
          setFileData(formattedData);
        }
      } catch (err) {
        setError(
          "Error parsing the Excel file. Please use a valid .xlsx or .xls file.",
        );
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const removeEntry = (id) => {
    setFileData(fileData.filter((item) => item.id !== id));
  };

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
    try {
      const response = await fetch("http://127.0.0.1:3001/api/calls/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          recipients: fileData,
        }),
      });

      if (!response.ok) throw new Error("Bulk launch failed");

      const result = await response.json();
      const agent = agents.find((a) => a.id === selectedAgentId);

      if (onCampaignLaunched) {
        onCampaignLaunched({
          name: `Bulk Upload - ${new Date().toLocaleDateString()}`,
          agent: agent,
          count: fileData.length,
          recipients: fileData,
          serverResult: result,
        });
      }

      onClose();
    } catch (err) {
      setError(`Failed to launch campaign: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[rgb(var(--color-text-primary)/0.6)] backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[rgb(var(--color-surface))] w-full max-w-4xl rounded-3xl shadow-2xl border border-[rgb(var(--color-border))] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-[rgb(var(--color-border)/0.5)] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[rgb(var(--color-text-primary))] font-display">
                Bulk <span className="gradient-text">Dialer Core</span>
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-muted))] font-medium">
                Upload .xlsx / .csv with Name, Number, and Company
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-background))] rounded-full transition-colors text-[rgb(var(--color-text-muted))]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
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

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-3">
                  2. Choose Data Sheet
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full group p-8 border-2 border-dashed border-[rgb(var(--color-border))] rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-background))] flex items-center justify-center border border-[rgb(var(--color-border))] group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                      Click to upload
                    </p>
                    <p className="text-[10px] text-[rgb(var(--color-text-muted))] font-medium uppercase tracking-tight mt-1">
                      Excel or CSV preferred
                    </p>
                  </div>
                </button>
              </div>

              {fileData.length > 0 && (
                <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <CheckCircle2 size={20} />
                    <span className="font-black text-sm uppercase tracking-widest">
                      Ready to Launch
                    </span>
                  </div>
                  <p className="text-xs font-medium text-emerald-600/80">
                    Validated {fileData.length} unique phone numbers for
                    deployment.
                  </p>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] ml-1">
                Live Data Preview
              </label>
              <div className="border border-[rgb(var(--color-border)/0.5)] rounded-3xl overflow-hidden bg-[rgb(var(--color-background))/0.3]">
                <table className="w-full text-left">
                  <thead className="bg-[rgb(var(--color-background))] border-b border-[rgb(var(--color-border)/0.5)]">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Recipient</th>
                      <th className="px-6 py-4">Organization</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--color-border)/0.5)]">
                    {fileData.length > 0 ? (
                      fileData.map((row) => (
                        <tr
                          key={row.id}
                          className="text-sm font-medium hover:bg-[rgb(var(--color-primary)/0.02)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[rgb(var(--color-text-primary))] font-bold">
                                {row.name || "N/A"}
                              </span>
                              <span className="text-[10px] text-[rgb(var(--color-text-muted))]">
                                {row.number}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[rgb(var(--color-text-secondary))]">
                            {row.company || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => removeEntry(row.id)}
                              className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-30">
                            <Users
                              size={48}
                              className="text-[rgb(var(--color-text-muted))]"
                            />
                            <p className="text-sm font-medium">
                              No data loaded yet
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

        {/* Footer */}
        <div className="p-8 border-t border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-background))/0.3] flex gap-4">
          <Button
            variant="ghost"
            className="flex-1 h-14 rounded-2xl font-bold"
            onClick={onClose}
          >
            Discard Deployment
          </Button>
          <Button
            variant="primary"
            className="flex-2 h-14 min-w-[300px] rounded-2xl font-bold gap-3 shadow-indigo-500/20"
            disabled={loading || fileData.length === 0}
            onClick={handleLaunch}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            {loading
              ? "Initializing Bulk Gateway..."
              : `Launch Neural Deployment (${fileData.length} Calls)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
