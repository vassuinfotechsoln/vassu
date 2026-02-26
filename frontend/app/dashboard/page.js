"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Zap,
  Globe,
  Sparkles,
  BarChart3,
  Users,
  Mic,
  Volume2,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import CallLogTable from "@/components/CallLogTable";
import LiveTranscript from "@/components/LiveTranscript";
import CallMonitor from "@/components/CallMonitor";
import NewCallModal from "@/components/NewCallModal";
import BulkUploadModal from "@/components/BulkUploadModal";
import Toast from "@/components/Toast";
import { useToast } from "@/lib/hooks";

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 3,
    successRate: 98,
    avgDuration: 0,
  });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchCalls();
    fetchAgents();
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeCalls: Math.floor(Math.random() * 10) + 1,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:3001/api/calls", {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const callsArray = Array.isArray(data) ? data : [];
      setCalls(callsArray);
      setStats((prev) => ({
        ...prev,
        totalCalls: callsArray.length,
        avgDuration:
          callsArray.length > 0
            ? callsArray.reduce((acc, call) => acc + (call.duration || 0), 0) /
              callsArray.length
            : 0,
      }));
    } catch (error) {
      console.error("Failed to fetch calls:", error);
      setCalls([]);
      addToast(
        "Unable to connect to backend. Please ensure the server is running.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/api/agents", {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
  };

  const onCallInitiated = (callData) => {
    addToast(`Call initiated to ${callData.formattedNumber}`, "success");
    fetchCalls();
    setActiveCall({
      id: callData.callId,
      agent: callData.agent,
      phoneNumber: callData.formattedNumber,
    });
  };

  const onCampaignLaunched = (campaignData) => {
    addToast(
      `Bulk deployment launched: ${campaignData.count} recipients targetted with ${campaignData.agent.name}`,
      "success",
    );
    fetchCalls();
  };

  const statsConfig = [
    {
      label: "Total Calls",
      value: stats.totalCalls.toLocaleString(),
      icon: Phone,
      trend: "+12%",
      trendUp: true,
      color: "indigo",
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      label: "Active Now",
      value: stats.activeCalls,
      icon: Activity,
      trend: "Live",
      isLive: true,
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: Zap,
      trend: "+2.4%",
      trendUp: true,
      color: "amber",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Avg Duration",
      value: `${Math.round(stats.avgDuration)}s`,
      icon: Clock,
      trend: "-5s",
      trendUp: true,
      color: "purple",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
  ];

  const [systemStatus, setSystemStatus] = useState([
    {
      name: "STT Engine",
      status: "checking...",
      latency: "...",
      key: "assemblyai",
    },
    {
      name: "LLM Pipeline",
      status: "checking...",
      latency: "...",
      key: "groq",
    },
    {
      name: "TTS Service",
      status: "checking...",
      latency: "...",
      key: "elevenlabs",
    },
  ]);

  useEffect(() => {
    const validateServices = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:3001/api/settings/validate",
          {
            signal: AbortSignal.timeout(8000),
          },
        );
        const results = await response.json();

        setSystemStatus([
          {
            name: "STT Engine",
            status: results.assemblyai ? "operational" : "degraded",
            latency: "45ms",
            online: !!results.assemblyai,
          },
          {
            name: "LLM Pipeline",
            status: results.groq ? "operational" : "degraded",
            latency: "120ms",
            online: !!results.groq,
          },
          {
            name: "TTS Service",
            status: results.elevenlabs ? "operational" : "degraded",
            latency: "80ms",
            online: !!results.elevenlabs,
          },
          {
            name: "Vassu Gateway",
            status: "operational",
            latency: "25ms",
            online: true,
          },
        ]);
      } catch (error) {
        console.warn(
          "Status validation failed (backend offline?):",
          error.message,
        );
        // Mark all services as offline if backend is unreachable
        setSystemStatus([
          {
            name: "STT Engine",
            status: "offline",
            latency: "—",
            online: false,
          },
          {
            name: "LLM Pipeline",
            status: "offline",
            latency: "—",
            online: false,
          },
          {
            name: "TTS Service",
            status: "offline",
            latency: "—",
            online: false,
          },
          {
            name: "Vassu Gateway",
            status: "offline",
            latency: "—",
            online: false,
          },
        ]);
      }
    };

    validateServices();
    const interval = setInterval(validateServices, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const isLiveTelephony =
    systemStatus.find((s) => s.name === "Vassu Gateway")?.online || false;

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[rgb(var(--color-text-primary))]">
            Dashboard <span className="gradient-text">Overview</span>
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))] flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="hidden sm:inline">
              Real-time monitoring and analytics for your AI voice agents
            </span>
            <span className="sm:hidden">Real-time AI voice analytics</span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs ${isLiveTelephony ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" : "bg-amber-500/5 border-amber-500/20 text-amber-600"}`}
          >
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${isLiveTelephony ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
            />
            <span className="font-black uppercase tracking-widest whitespace-nowrap">
              {isLiveTelephony ? "Live" : "Sim Mode"}
            </span>
          </div>
          <button
            onClick={fetchCalls}
            disabled={loading}
            className="btn-base btn-secondary !px-3"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-base btn-primary !px-3 sm:!px-4"
          >
            <Play className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Bulk</span>
            <span className="hidden sm:inline"> Deploy</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsConfig.map((stat, i) => (
          <div
            key={i}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={`stat-icon ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              {stat.isLive ? (
                <span className="badge badge-success">
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  Live
                </span>
              ) : stat.trend ? (
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    stat.trendUp ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
              ) : null}
            </div>
            <div className="mt-3">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Industry Analytics Section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-slide-up"
        style={{ animationDelay: "200ms" }}
      >
        <div className="card-elevated p-4 sm:p-6 bg-gradient-to-br from-[rgb(var(--color-surface))] to-indigo-500/5">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Performance Distribution
            </h3>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase">
              Real-time
            </span>
          </div>
          <div className="flex items-end gap-1 sm:gap-3 h-36 sm:h-48 px-1 sm:px-2">
            {[45, 78, 56, 92, 65, 88, 70, 85, 95, 80].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-700 hover:brightness-110"
                  style={{ height: `${h}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-black uppercase text-[rgb(var(--color-text-muted))]">
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="card p-6 border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-1">
              Total Savings
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[rgb(var(--color-text-primary))]">
                $12,450
              </span>
              <span className="text-xs font-bold text-emerald-500 mb-1">
                +14%
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-2 font-medium">
              Versus manual operator costs
            </p>
          </div>
          <div className="card p-6 border-l-4 border-l-indigo-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-1">
              AI Efficiency
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[rgb(var(--color-text-primary))]">
                98.4%
              </span>
              <span className="text-xs font-bold text-indigo-500 mb-1">
                Optimal
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-2 font-medium">
              Latency & STT accuracy
            </p>
          </div>
          <div className="card p-6 border-l-4 border-l-purple-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-1">
              Human Handoffs
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[rgb(var(--color-text-primary))]">
                12
              </span>
              <span className="text-xs font-bold text-rose-500 mb-1">-2</span>
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-2 font-medium">
              Escalations required today
            </p>
          </div>
          <div className="card p-6 border-l-4 border-l-amber-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] mb-1">
              Total GPU Time
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[rgb(var(--color-text-primary))]">
                4.2h
              </span>
              <span className="text-xs font-bold text-amber-500 mb-1">
                LPU Inc.
              </span>
            </div>
            <p className="text-xs text-[rgb(var(--color-text-muted))] mt-2 font-medium">
              Compute resource utilization
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Call Logs */}
        <section className="xl:col-span-8 flex flex-col gap-4">
          <div className="card-elevated overflow-hidden">
            <div className="p-5 border-b border-[rgb(var(--color-border))] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                    Recent Calls
                  </h2>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">
                    Latest call activity and transcripts
                  </p>
                </div>
              </div>
              <button className="btn-base btn-ghost text-sm">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <CallLogTable calls={calls} onRefresh={fetchCalls} />
          </div>
        </section>

        {/* Right Panel */}
        <aside className="xl:col-span-4 flex flex-col gap-6">
          {/* Active Call Monitor */}
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
              <Activity className="w-4 h-4 text-emerald-500" />
              Active Call Monitor
            </h3>
            <CallMonitor activeCall={activeCall} />
          </div>

          {/* Live Transcript */}
          {activeCall && (
            <div className="space-y-3 animate-slide-in-right">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
                <Mic className="w-4 h-4 text-indigo-500" />
                Live Transcript
              </h3>
              <LiveTranscript callId={activeCall.id} />
            </div>
          )}

          {/* System Status */}
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">
              <Zap className="w-4 h-4 text-amber-500" />
              System Status
            </h3>
            <div className="card p-4 flex flex-col gap-3">
              {systemStatus.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border)/0.5)]"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-4 h-4 ${service.online ? "text-emerald-500" : "text-amber-500"}`}
                    />
                    <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--color-text-muted))]">
                      {service.latency}
                    </span>
                    <span
                      className={`badge ${service.online ? "badge-success" : "badge-warning"} text-[10px]`}
                    >
                      {service.online ? "Online" : "Check Key"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsCallModalOpen(true)}
                className="w-full btn-base btn-secondary text-left justify-start"
              >
                <PhoneOutgoing className="w-4 h-4 text-indigo-500" />
                <span>Make Outbound Call</span>
              </button>
              <button className="w-full btn-base btn-secondary text-left justify-start">
                <Users className="w-4 h-4 text-purple-500" />
                <span>Manage Agents</span>
              </button>
              <button className="w-full btn-base btn-secondary text-left justify-start">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* New Call Modal */}
      <NewCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        agents={agents}
        onCallInitiated={onCallInitiated}
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        agents={agents}
        onCampaignLaunched={onCampaignLaunched}
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 space-y-3 w-[calc(100vw-2rem)] sm:w-auto max-w-sm">
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
