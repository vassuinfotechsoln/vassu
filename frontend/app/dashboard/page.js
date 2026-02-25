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
import Toast from "@/components/Toast";
import { useToast } from "@/lib/hooks";

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
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
    { name: "STT Engine", status: "checking...", latency: "...", key: "assemblyai" },
    { name: "LLM Pipeline", status: "checking...", latency: "...", key: "groq" },
    { name: "TTS Service", status: "checking...", latency: "...", key: "elevenlabs" },
  ]);

  useEffect(() => {
    const validateServices = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3001/api/settings/validate", {
          signal: AbortSignal.timeout(8000),
        });
        const results = await response.json();

        setSystemStatus([
          {
            name: "STT Engine",
            status: results.assemblyai ? "operational" : "degraded",
            latency: "45ms",
            online: !!results.assemblyai
          },
          {
            name: "LLM Pipeline",
            status: results.groq ? "operational" : "degraded",
            latency: "120ms",
            online: !!results.groq
          },
          {
            name: "TTS Service",
            status: results.elevenlabs ? "operational" : "degraded",
            latency: "80ms",
            online: !!results.elevenlabs
          },
          {
            name: "Vassu Gateway",
            status: "operational",
            latency: "25ms",
            online: true
          },
        ]);
      } catch (error) {
        console.warn("Status validation failed (backend offline?):", error.message);
        // Mark all services as offline if backend is unreachable
        setSystemStatus([
          { name: "STT Engine", status: "offline", latency: "—", online: false },
          { name: "LLM Pipeline", status: "offline", latency: "—", online: false },
          { name: "TTS Service", status: "offline", latency: "—", online: false },
          { name: "Vassu Gateway", status: "offline", latency: "—", online: false },
        ]);
      }
    };

    validateServices();
    const interval = setInterval(validateServices, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--color-text-primary))]">
            Dashboard <span className="gradient-text">Overview</span>
          </h1>
          <p className="mt-1 text-[rgb(var(--color-text-secondary))] flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Real-time monitoring and analytics for your AI voice agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCalls}
            disabled={loading}
            className="btn-base btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setActiveCall({ id: "demo-call" })}
            className="btn-base btn-primary"
          >
            <Play className="w-4 h-4" />
            <span>Simulate Call</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? "text-emerald-500" : "text-red-500"
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

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
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
                    <CheckCircle2 className={`w-4 h-4 ${service.online ? "text-emerald-500" : "text-amber-500"}`} />
                    <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(var(--color-text-muted))]">
                      {service.latency}
                    </span>
                    <span className={`badge ${service.online ? "badge-success" : "badge-warning"} text-[10px]`}>
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
              <button className="w-full btn-base btn-secondary text-left justify-start">
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

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
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
