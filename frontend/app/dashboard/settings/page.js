"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Key,
  Phone,
  Brain,
  Globe,
  Mic,
  Shield,
  Zap,
  CheckCircle,
  Code,
  Webhook,
  Signal,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Telephony Integration
    viApiKey: "",
    viApiSecret: "",
    viVirtualNumber: "",
    // AI
    groqApiKey: "",
    elevenlabsApiKey: "",
    assemblyaiApiKey: "",
    // System
    baseUrl: "",
    defaultLanguage: "en",
    defaultVoice: "alloy",
    webhookUrl: "",
    vassuApiKey: "vt_live_" + Math.random().toString(36).substring(2, 12),
  });

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viStatus, setViStatus] = useState("unchecked"); // unchecked | checking | ok | missing

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3001/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
          setViStatus(
            data.viApiKey && data.viApiSecret && data.viVirtualNumber
              ? "ok"
              : "missing",
          );
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3001/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setViStatus(
          settings.viApiKey && settings.viApiSecret && settings.viVirtualNumber
            ? "ok"
            : "missing",
        );
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  const handleChange = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings.vassuApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── shared input class ───────────────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 font-medium transition-all duration-300";

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* ── Header ── */}
      <div className="mb-10">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black gradient-text mb-2">
              Configuration
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Secure API keys and Telephony settings
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── Telephony Integration ── */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Signal className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    Telephony Integration
                  </h2>
                  <p className="text-violet-200 font-medium">
                    Enterprise virtual number • voice calling
                  </p>
                </div>
              </div>
              {/* Status badge */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  viStatus === "ok"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${viStatus === "ok" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
                />
                {viStatus === "ok" ? "Connected" : "Credentials Needed"}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Info banner */}
            <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-300 text-sm leading-relaxed">
              <p className="font-bold mb-1">
                How to get Telephony credentials:
              </p>
              <ol className="list-decimal ml-4 space-y-1 text-violet-300/80 text-xs font-medium">
                <li>
                  Visit{" "}
                  <a
                    href="https://developer.videveloper.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-violet-300 inline-flex items-center gap-1"
                  >
                    developer.videveloper.in <ExternalLink size={10} />
                  </a>{" "}
                  and create an account
                </li>
                <li>Create a new application to get your API Key and Secret</li>
                <li>Purchase / activate a virtual number on the portal</li>
                <li>
                  Set your public server URL in <strong>Base URL</strong> below
                </li>
                <li>
                  Register webhook:{" "}
                  <code className="bg-white/10 px-1 rounded text-[11px]">
                    YOUR_BASE_URL/api/calls/voice/inbound
                  </code>{" "}
                  for inbound calls
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Key className="h-4 w-4 text-violet-400" />
                  <span>API Key</span>
                </label>
                <input
                  type="text"
                  value={settings.viApiKey}
                  onChange={(e) => handleChange("viApiKey", e.target.value)}
                  placeholder="your_vi_api_key"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Shield className="h-4 w-4 text-violet-400" />
                  <span>API Secret</span>
                </label>
                <input
                  type="password"
                  value={settings.viApiSecret}
                  onChange={(e) => handleChange("viApiSecret", e.target.value)}
                  placeholder="your_vi_api_secret"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Phone className="h-4 w-4 text-violet-400" />
                  <span>Virtual Number</span>
                </label>
                <input
                  type="text"
                  value={settings.viVirtualNumber}
                  onChange={(e) =>
                    handleChange("viVirtualNumber", e.target.value)
                  }
                  placeholder="+919XXXXXXXXX"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Globe className="h-4 w-4 text-violet-400" />
                  <span>
                    Public Base URL{" "}
                    <span className="text-[10px] text-slate-500 font-normal">
                      (ngrok / VPS IP)
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={(e) => handleChange("baseUrl", e.target.value)}
                  placeholder="https://your-vps.com or https://abc.ngrok.io"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Webhook endpoints reference */}
            {settings.baseUrl && (
              <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-2xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                  Register these in the Developer Portal
                </p>
                {[
                  {
                    label: "Inbound calls",
                    path: "/api/calls/voice/inbound",
                    method: "POST",
                  },
                  {
                    label: "Answer webhook",
                    path: "/api/calls/voice/answer/{callId}",
                    method: "GET",
                  },
                  {
                    label: "Status webhook",
                    path: "/api/calls/voice/status/{callId}",
                    method: "POST",
                  },
                  {
                    label: "Speech input",
                    path: "/api/calls/voice/input/{callId}",
                    method: "POST",
                  },
                ].map(({ label, path, method }) => (
                  <div key={path} className="flex items-center gap-3 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[10px] ${method === "GET" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"}`}
                    >
                      {method}
                    </span>
                    <span className="text-slate-400 font-medium">{label}</span>
                    <code className="text-violet-300 font-mono text-[11px] ml-auto">
                      {settings.baseUrl}
                      {path}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Groq ── */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Groq Integration
                </h2>
                <p className="text-emerald-100 font-medium">
                  Ultra-fast AI language processing
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
              <Key className="h-4 w-4 text-teal-400" />
              <span>Groq API Key</span>
            </label>
            <input
              type="password"
              value={settings.groqApiKey}
              onChange={(e) => handleChange("groqApiKey", e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── ElevenLabs ── */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  ElevenLabs Integration
                </h2>
                <p className="text-purple-100 font-medium">
                  Premium Text-to-Speech
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
              <Key className="h-4 w-4 text-purple-400" />
              <span>ElevenLabs API Key</span>
            </label>
            <input
              type="password"
              value={settings.elevenlabsApiKey}
              onChange={(e) => handleChange("elevenlabsApiKey", e.target.value)}
              placeholder="your_elevenlabs_api_key"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── AssemblyAI ── */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  AssemblyAI Integration
                </h2>
                <p className="text-blue-100 font-medium">
                  Advanced Speech-to-Text
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
              <Key className="h-4 w-4 text-blue-400" />
              <span>AssemblyAI API Key</span>
            </label>
            <input
              type="password"
              value={settings.assemblyaiApiKey}
              onChange={(e) => handleChange("assemblyaiApiKey", e.target.value)}
              placeholder="your_assemblyai_api_key"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Default Preferences ── */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Default Preferences
                </h2>
                <p className="text-slate-400 font-medium">
                  System-wide default configurations
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Globe className="h-4 w-4 text-teal-400" />
                  <span>Default Language</span>
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    handleChange("defaultLanguage", e.target.value)
                  }
                  className={`${inputCls} appearance-none`}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-300 mb-3">
                  <Mic className="h-4 w-4 text-teal-400" />
                  <span>Default Voice</span>
                </label>
                <select
                  value={settings.defaultVoice}
                  onChange={(e) => handleChange("defaultVoice", e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="alloy">Alloy → Amy (Neutral)</option>
                  <option value="echo">Echo → Brian (Male)</option>
                  <option value="fable">Fable → Brian (British)</option>
                  <option value="onyx">Onyx → Raveena (Deep)</option>
                  <option value="nova">Nova → Aditi (Indian Female)</option>
                  <option value="shimmer">Shimmer → Aditi (Soft)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Developer & CRM ── */}
        <div className="glass-card rounded-3xl overflow-hidden border-2 border-indigo-500/10">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Code className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Developer & CRM Integration
                </h2>
                <p className="text-slate-400 font-medium">
                  Connect VassuTalks to your tech stack
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-8">
            {/* API Key */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-[rgb(var(--color-text-primary))] mb-3">
                <Key className="h-4 w-4 text-indigo-500" />
                <span>Your VassuTalks API Key</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.vassuApiKey}
                  className="flex-1 px-4 py-4 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl font-mono text-sm text-[rgb(var(--color-text-primary))]"
                />
                <button
                  onClick={copyApiKey}
                  className="px-6 bg-[rgb(var(--color-surface-elevated))] border border-[rgb(var(--color-border))] rounded-2xl font-bold hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-center gap-2"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-[rgb(var(--color-text-primary))] mb-3">
                <Webhook className="h-4 w-4 text-emerald-500" />
                <span>Global Webhook Endpoint</span>
              </label>
              <input
                type="text"
                value={settings.webhookUrl}
                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                placeholder="https://your-crm.com/api/vassu-webhook"
                className="w-full px-4 py-4 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[rgb(var(--color-text-primary))] font-medium"
              />
              <p className="mt-2 text-xs text-[rgb(var(--color-text-muted))]">
                We will POST to this URL on every call completion with the full
                transcript and metadata.
              </p>
            </div>

            {/* Webhook events */}
            <div className="pt-2 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))]">
                Enabled Webhook Events
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Call Started",
                  "Call Answered",
                  "Call Completed",
                  "Transcript Generated",
                  "Sentiment Analyzed",
                ].map((event) => (
                  <div
                    key={event}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))]"
                  >
                    <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                      {event}
                    </span>
                    <div className="w-10 h-6 bg-indigo-500 rounded-full relative">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div className="flex justify-center pt-8 pb-16">
          <button
            onClick={handleSave}
            className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105 ${
              saved
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40"
            }`}
          >
            <div className="relative flex items-center gap-3">
              {saved ? (
                <>
                  <CheckCircle className="h-6 w-6" /> Settings Saved!
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" /> Save Configuration
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
