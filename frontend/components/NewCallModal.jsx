"use client";

import { useState, useEffect } from "react";
import { Phone, X, Bot, Loader2, Sparkles, PhoneOutgoing } from "lucide-react";
import { Button } from "./ui/button";

export default function NewCallModal({
  isOpen,
  onClose,
  agents,
  onCallInitiated,
  initialAgentId,
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialAgentId) {
      setSelectedAgentId(initialAgentId);
    } else if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, initialAgentId, isOpen]);

  if (!isOpen) return null;

  const handleStartCall = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a phone number");
      return;
    }
    if (!selectedAgentId) {
      setError("Please select an agent");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:3001/api/calls/outbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      if (onCallInitiated) {
        onCallInitiated(data);
      }

      setPhoneNumber("");
      onClose();
    } catch (err) {
      console.error("Call initiation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[rgb(var(--color-text-primary)/0.6)] backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[rgb(var(--color-surface))] w-full max-w-md rounded-3xl shadow-2xl border border-[rgb(var(--color-border))] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-[rgb(var(--color-border)/0.5)] flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <PhoneOutgoing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                Start New Call
              </h2>
              <p className="text-xs text-[rgb(var(--color-text-muted))] font-medium uppercase tracking-wider">
                Voice Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-background))] rounded-full transition-colors text-[rgb(var(--color-text-muted))]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleStartCall} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-2 px-1">
                Select Intelligence
              </label>
              <div className="relative">
                <Bot className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-[rgb(var(--color-text-primary))] font-semibold transition-all appearance-none cursor-pointer"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.language.toUpperCase()})
                    </option>
                  ))}
                  {agents.length === 0 && (
                    <option disabled>No agents available</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-2 px-1">
                Destination Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="+91 00000 00000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-[rgb(var(--color-text-primary))] font-bold placeholder:text-[rgb(var(--color-text-muted))] transition-all"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-[10px] text-[rgb(var(--color-text-muted))] flex items-center gap-1.5 px-1 font-medium">
                <Sparkles size={12} className="text-amber-500" />
                Supports international format (e.g., +91, +1)
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || agents.length === 0}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Initiating Connection...
                </>
              ) : (
                <>
                  <PhoneOutgoing className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Launch Voice Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
