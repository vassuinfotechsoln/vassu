"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Users,
  Play,
  Pause,
  Plus,
  FileUp,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Toast from "@/components/Toast";
import { useToast } from "@/lib/hooks";

export default function CampaignsPage() {
  const [agents, setAgents] = useState([]);
  const [campaigns, setCampaigns] = useState([
    {
      id: "bulk-demo-1",
      name: "Q1 Customer Loyalty Survey",
      agentName: "Support Rachel",
      status: "COMPLETED",
      total: 120,
      success: 112,
      failed: 8,
      date: "2024-02-20",
    },
    {
      id: "bulk-demo-2",
      name: "Lead Qualification Batch B",
      agentName: "Sales Advisor",
      status: "RUNNING",
      total: 50,
      success: 15,
      failed: 2,
      date: "2024-02-25",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    agentId: "",
    phoneNumbers: "",
  });

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data || []);
        if (data.length > 0) {
          setNewCampaign((prev) => ({ ...prev, agentId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch agents", error);
    }
  };

  const handleLaunchCampaign = async () => {
    if (!newCampaign.name || !newCampaign.phoneNumbers) {
      addToast("Please fill in all fields", "error");
      return;
    }

    const numberList = newCampaign.phoneNumbers
      .split("\n")
      .filter((n) => n.trim().length > 0);

    if (numberList.length === 0) {
      addToast("No valid phone numbers found", "error");
      return;
    }

    addToast(
      `Launching campaign for ${numberList.length} recipients...`,
      "success",
    );

    try {
      const response = await fetch("/api/calls/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: newCampaign.agentId,
          recipients: numberList.map((n) => ({ number: n.trim() })),
        }),
      });

      if (!response.ok) throw new Error("Bulk launch failed");

      const campaignId = `camp-${Date.now()}`;
      const agent = agents.find((a) => a.id === newCampaign.agentId);

      const newEntry = {
        id: campaignId,
        name: newCampaign.name,
        agentName: agent?.name || "Unknown Agent",
        status: "COMPLETED", // Assuming immediate dispatch for demo
        total: numberList.length,
        success: numberList.length,
        failed: 0,
        date: new Date().toISOString().split("T")[0],
      };

      setCampaigns([newEntry, ...campaigns]);
      setIsModalOpen(false);
      setNewCampaign({
        name: "",
        agentId: agents[0]?.id || "",
        phoneNumbers: "",
      });
    } catch (error) {
      addToast(`Campaign launch failed: ${error.message}`, "error");
    }
  };

  return (
    <div className="p-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Rocket size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Bulk Dialing System
            </span>
          </div>
          <h1 className="text-5xl font-black text-[rgb(var(--color-text-primary))] font-display">
            Call <span className="gradient-text">Campaigns</span>
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))] font-medium mt-2 max-w-xl">
            Scale your voice operations. Deploy thousands of AI agents
            simultaneously for outreach, surveys, or lead qualification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-base btn-primary h-14 px-8 rounded-2xl shadow-indigo-500/20"
        >
          <Plus size={20} className="mr-2" />
          Create New Campaign
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
              Total Reach
            </p>
            <p className="text-3xl font-black text-[rgb(var(--color-text-primary))]">
              2,450
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
              Successful Connections
            </p>
            <p className="text-3xl font-black text-emerald-500">94.2%</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
              Active Campaigns
            </p>
            <p className="text-3xl font-black text-amber-500">
              {campaigns.filter((c) => c.status === "RUNNING").length}
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-[rgb(var(--color-border)/0.5)] bg-[rgb(var(--color-surface-elevated)/0.3)]">
          <h2 className="text-lg font-bold">Recent Deployments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[rgb(var(--color-background))] text-[10px] uppercase font-black tracking-widest text-[rgb(var(--color-text-muted))]">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Agent Used</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Engagement</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border)/0.5)]">
              {campaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-[rgb(var(--color-primary)/0.02)] transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          camp.status === "COMPLETED"
                            ? "bg-emerald-500/10"
                            : camp.status === "RUNNING"
                              ? "bg-indigo-500/10"
                              : "bg-amber-500/10"
                        }`}
                      >
                        <PhoneCall
                          size={18}
                          className={
                            camp.status === "COMPLETED"
                              ? "text-emerald-500"
                              : camp.status === "RUNNING"
                                ? "text-indigo-500"
                                : "text-amber-500"
                          }
                        />
                      </div>
                      <p className="font-bold text-[rgb(var(--color-text-primary))]">
                        {camp.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-[rgb(var(--color-text-secondary))]">
                    {camp.agentName}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`badge ${camp.status === "COMPLETED" ? "badge-success text-[10px]" : "badge-warning animate-pulse text-[10px]"}`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-full max-w-[120px] space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>
                          {Math.round((camp.success / camp.total) * 100)}%
                        </span>
                        <span className="text-[rgb(var(--color-text-muted))]">
                          {camp.success}/{camp.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[rgb(var(--color-border)/0.5)] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${camp.status === "COMPLETED" ? "from-emerald-500 to-teal-500" : "from-indigo-500 to-purple-500"}`}
                          style={{
                            width: `${(camp.success / camp.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[rgb(var(--color-text-muted))] font-medium">
                    {camp.date}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-[rgb(var(--color-text-muted))] transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgb(var(--color-text-primary)/0.6)] backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-[rgb(var(--color-surface))] w-full max-w-2xl rounded-3xl shadow-2xl border border-[rgb(var(--color-border))] overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="p-8 border-b border-[rgb(var(--color-border)/0.5)] bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
              <h2 className="text-2xl font-black font-display">
                Create Bulk Campaign
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Dispatch AI agents to a list of recipients.
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-2 ml-1">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Real Estate Follow-up Batch 1"
                    className="input-field py-4"
                    value={newCampaign.name}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-2 ml-1">
                    Assigned AI Intelligence
                  </label>
                  <select
                    className="input-field py-4 appearance-none"
                    value={newCampaign.agentId}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        agentId: e.target.value,
                      })
                    }
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-2 ml-1 flex items-center justify-between">
                    <span>Target Phone Numbers</span>
                    <span className="text-[10px] text-indigo-500 lowercase font-bold tracking-normal italic flex items-center gap-1">
                      <FileUp size={12} />
                      One number per line
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="+919876543210&#10;+919988776655&#10;+12025550172"
                    className="input-field font-mono text-sm leading-relaxed"
                    value={newCampaign.phoneNumbers}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        phoneNumbers: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-base btn-secondary h-14 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchCampaign}
                  className="flex-1 btn-base btn-primary h-14 rounded-2xl"
                >
                  <Play size={20} className="mr-2 fill-current" />
                  Launch Deployment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-8 right-8 z-[110] space-y-4">
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
