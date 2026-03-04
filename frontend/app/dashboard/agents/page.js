"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Zap,
  Brain,
  Mic,
  Globe,
  Activity,
  ArrowRight,
  PhoneOutgoing,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import NewCallModal from "@/components/NewCallModal";
import Toast from "@/components/Toast";
import { useToast } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agents", {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAgents(data || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      setAgents([]);
      addToast(
        "Backend server not running. Please start the backend server on port 3001.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      await fetch(`/api/agents/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(5000),
      });
      addToast("Agent deleted successfully", "success");
      fetchAgents();
    } catch (error) {
      console.error("Failed to delete agent:", error);
      addToast("Failed to delete agent", "error");
    }
  };
  const openCallModal = (agentId) => {
    setSelectedAgentId(agentId);
    setIsCallModalOpen(true);
  };

  const onCallInitiated = (callData) => {
    addToast(`Call initiated to ${callData.formattedNumber}`, "success");
  };

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
              <Brain size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Neural Assets
            </span>
          </div>
          <h1 className="text-5xl font-black text-[rgb(var(--color-text-primary))] font-display">
            AI <span className="gradient-text">Agent Fleet</span>
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] font-medium max-w-xl">
            Configure and manage your intelligent voice assistants. Each agent
            can be tailored with unique roles, voices, and creative parameters.
          </p>
        </div>

        <Link href="/dashboard/agents/new">
          <Button
            variant="primary"
            size="lg"
            className="rounded-2xl gap-2 h-14 px-8 shadow-indigo-500/20"
          >
            <Plus size={20} />
            Create Neural Agent
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {agents && agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="glass-card p-8 group relative flex flex-col h-full"
              >
                {/* Status Glow */}
                <div className="absolute top-8 left-8 -z-10 w-16 h-16 bg-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start justify-between mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[rgb(var(--color-surface))] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCallModal(agent.id)}
                      className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shadow-sm transition-all text-indigo-600 dark:text-indigo-400 group/call"
                      title="Start Call"
                    >
                      <PhoneOutgoing
                        size={16}
                        className="group-hover/call:scale-110 transition-transform"
                      />
                    </button>
                    <Link
                      href={`/dashboard/agents/${agent.id}/edit`}
                      className="p-3 bg-[rgb(var(--color-background))] rounded-xl hover:bg-[rgb(var(--color-surface-elevated))] shadow-sm transition-all text-[rgb(var(--color-text-muted))] hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="p-3 bg-[rgb(var(--color-background))] rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 shadow-sm transition-all text-[rgb(var(--color-text-muted))] hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-black font-display text-[rgb(var(--color-text-primary))] mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed line-clamp-2">
                      {agent.prompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="bg-[rgb(var(--color-background))] p-3 rounded-2xl border border-[rgb(var(--color-border)/0.5)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] block mb-1">
                        Voice Profile
                      </span>
                      <div className="flex items-center text-xs font-bold text-[rgb(var(--color-text-primary))]">
                        <Mic size={14} className="mr-2 text-indigo-500" />
                        {agent.voice}
                      </div>
                    </div>
                    <div className="bg-[rgb(var(--color-background))] p-3 rounded-2xl border border-[rgb(var(--color-border)/0.5)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] block mb-1">
                        Linguistic
                      </span>
                      <div className="flex items-center text-xs font-bold text-[rgb(var(--color-text-primary))]">
                        <Globe size={14} className="mr-2 text-indigo-500" />
                        {agent.language.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[rgb(var(--color-border)/0.5)] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                      Total Utilization
                    </span>
                  </div>
                  <span className="text-sm font-black text-[rgb(var(--color-text-primary))] font-display">
                    {agent._count?.calls || 0}{" "}
                    <span className="text-[10px] text-[rgb(var(--color-text-muted))] font-medium">
                      calls
                    </span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center text-center space-y-6">
              <div className="w-32 h-32 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border)/0.5)] rounded-full flex items-center justify-center relative">
                <Bot
                  size={48}
                  className="text-[rgb(var(--color-text-muted)/0.3)]"
                />
                <Sparkles
                  size={24}
                  className="absolute top-0 right-0 text-indigo-500 animate-pulse"
                />
              </div>
              <div className="max-w-sm">
                <h3 className="text-2xl font-black font-display text-[rgb(var(--color-text-primary))] mb-2">
                  No active agents found
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  Provision your first agent to start handling intelligent voice
                  interactions.
                </p>
              </div>
              <Link href="/dashboard/agents/new">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-2xl gap-2 h-14 px-10 shadow-indigo-500/20"
                >
                  <Plus size={20} />
                  Provision Your First Agent
                  <ArrowRight size={20} className="ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Call Modal */}
      <NewCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        agents={agents}
        onCallInitiated={onCallInitiated}
        initialAgentId={selectedAgentId}
      />

      {/* Toast Notifications */}
      <div className="fixed top-8 right-8 z-[100] space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
