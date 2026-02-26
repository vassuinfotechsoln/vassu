"use client";

import { useState, useRef } from "react";
import {
  Save,
  Bot,
  Mic,
  Globe,
  Zap,
  Sparkles,
  ArrowLeft,
  Volume2,
  User,
  Sliders,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  ZapIcon,
  Database,
  Link2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VOICE_OPTIONS = [
  {
    value: "alloy",
    label: "Alloy",
    gender: "Neutral",
    description: "Clear & professional",
  },
  {
    value: "echo",
    label: "Echo",
    gender: "Male",
    description: "Warm & conversational",
  },
  {
    value: "fable",
    label: "Fable",
    gender: "Male",
    description: "British accent",
  },
  {
    value: "onyx",
    label: "Onyx",
    gender: "Male",
    description: "Deep & authoritative",
  },
  {
    value: "nova",
    label: "Nova",
    gender: "Female",
    description: "Friendly & bright",
  },
  {
    value: "shimmer",
    label: "Shimmer",
    gender: "Female",
    description: "Soft & elegant",
  },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English", flag: "🇺🇸", nativeName: "English" },
  { value: "hi", label: "Hindi", flag: "🇮🇳", nativeName: "हिंदी" },
  { value: "gu", label: "Gujarati", flag: "🇮🇳", nativeName: "ગુજરાતી" },
  { value: "ta", label: "Tamil", flag: "🇮🇳", nativeName: "தமிழ்" },
  { value: "te", label: "Telugu", flag: "🇮🇳", nativeName: "తెలుగు" },
  { value: "mr", label: "Marathi", flag: "🇮🇳", nativeName: "मराठी" },
];

const PROMPT_TEMPLATES = [
  {
    label: "Sales Agent",
    icon: "💼",
    prompt: `You are a professional sales agent for VassuTalks. Your goal is to understand the customer's needs, present our AI voice platform features confidently, handle objections gracefully, and guide them toward a purchase decision. Always be polite, enthusiastic, and concise. Ask qualifying questions to understand their business.`,
  },
  {
    label: "Customer Support",
    icon: "🎧",
    prompt: `You are a helpful customer support agent. Listen carefully to the customer's issue, empathize with their frustration, ask clarifying questions if needed, and provide clear step-by-step solutions. If you cannot resolve the issue, escalate politely and ensure the customer feels heard and valued.`,
  },
  {
    label: "Appointment Booking",
    icon: "📅",
    prompt: `You are an appointment scheduling assistant. Your job is to collect the customer's name, preferred date and time, contact number, and reason for the appointment. Confirm all details before booking. Be friendly, efficient, and professional. Available slots are weekdays 9 AM to 6 PM.`,
  },
  {
    label: "Survey Bot",
    icon: "📊",
    prompt: `You are a survey assistant conducting a customer satisfaction survey. Ask one question at a time in a friendly, conversational tone. Collect ratings on a scale of 1-10 and brief feedback on our service. Thank the customer for their time and assure them their feedback will be used to improve the product.`,
  },
];

export default function AgentEditor({ agent, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    prompt: agent?.prompt || "",
    voice: agent?.voice || "alloy",
    language: agent?.language || "en",
    temperature: agent?.temperature ?? 0.7,
    knowledgeUrl: agent?.knowledgeUrl || "",
    knowledgeText: agent?.knowledgeText || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("identity");

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Agent name is required";
    if (!formData.prompt.trim()) e.prompt = "System prompt is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error("Failed to save agent:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const applyTemplate = (t) => {
    setFormData((prev) => ({ ...prev, prompt: t.prompt }));
    if (errors.prompt) setErrors((prev) => ({ ...prev, prompt: "" }));
  };

  const tempLabel =
    formData.temperature <= 0.3
      ? "Focused (Precise answers)"
      : formData.temperature <= 0.6
        ? "Balanced"
        : formData.temperature <= 0.8
          ? "Creative"
          : "Very Creative (Experimental)";

  // ── UI Styles ─────────────────────────────────────────────────────────────
  const inputClass = `w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all duration-300 outline-none
    bg-[rgb(var(--color-background))] border-[rgb(var(--color-border))]
    text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-muted))]
    focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-sm`;

  const labelClass = `block text-sm font-bold mb-3 text-[rgb(var(--color-text-secondary))] tracking-tight`;

  return (
    <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
      {/* ── Premium Header ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {agent ? "Neural Core Tuning" : "Agent Genesis"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="text-white/80 text-sm font-medium">
                  Professional AI Output Configuration
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
            <Phone className="w-5 h-5 text-emerald-400" />
            <span className="text-white text-sm font-bold">
              Encrypted Twilio Integration
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex p-2 gap-2 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))/0.5]">
        {[
          {
            id: "identity",
            icon: <User className="w-4 h-4" />,
            label: "Identity & Logic",
          },
          {
            id: "voice",
            icon: <Volume2 className="w-4 h-4" />,
            label: "Voice & Language",
          },
          {
            id: "behavior",
            icon: <Sliders className="w-4 h-4" />,
            label: "Behavior",
          },
          {
            id: "knowledge",
            icon: <Database className="w-4 h-4" />,
            label: "Knowledge Base",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
              activeSection === tab.id
                ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-[rgb(var(--color-border))]"
                : "text-[rgb(var(--color-text-muted))] hover:text-indigo-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10">
        {/* ── IDENTITY SECTION ── */}
        {activeSection === "identity" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <label className={labelClass}>Call Sign (Agent Name)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={cn(
                  inputClass,
                  errors.name && "border-rose-500 ring-rose-500/10",
                )}
                placeholder="e.g. Premium Support Bot, Global Sales Lead"
              />
              {errors.name && (
                <p className="text-rose-500 text-xs font-bold mt-2 ml-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Linguistic Blueprints (Prompt Templates)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PROMPT_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
                  >
                    <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">
                      {t.icon}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-[rgb(var(--color-text-muted))] group-hover:text-indigo-600">
                      {t.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass}>
                  Neural Instructions (System Prompt)
                </label>
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">
                    Tokens: {Math.ceil(formData.prompt.length / 4)}
                  </span>
                </div>
              </div>
              <textarea
                value={formData.prompt}
                onChange={(e) => handleChange("prompt", e.target.value)}
                rows={8}
                className={cn(
                  inputClass,
                  "resize-none font-mono text-xs leading-relaxed",
                  errors.prompt && "border-rose-500 ring-rose-500/10",
                )}
                placeholder="Enter the operating system instructions for this agent..."
              />
              {errors.prompt && (
                <p className="text-rose-500 text-xs font-bold mt-2 ml-1">
                  {errors.prompt}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── VOICE SECTION ── */}
        {activeSection === "voice" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <label className={labelClass}>
                Vocal Resonance (Acoustic Output)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOICE_OPTIONS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => handleChange("voice", v.value)}
                    className={cn(
                      "p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300",
                      formData.voice === v.value
                        ? "border-indigo-500 bg-indigo-50/50 shadow-md"
                        : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] hover:border-indigo-300",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          formData.voice === v.value
                            ? "bg-indigo-600"
                            : "bg-slate-200 dark:bg-slate-700",
                        )}
                      >
                        <Mic
                          className={cn(
                            "w-5 h-5",
                            formData.voice === v.value
                              ? "text-white"
                              : "text-slate-400",
                          )}
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-slate-900 dark:text-white">
                          {v.label}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">
                          {v.gender} · {v.description}
                        </div>
                      </div>
                    </div>
                    {formData.voice === v.value && (
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Cultural Dialect (Interaction Language)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => handleChange("language", l.value)}
                    className={cn(
                      "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300",
                      formData.language === l.value
                        ? "border-indigo-500 bg-indigo-50/50 shadow-md"
                        : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] hover:border-indigo-300",
                    )}
                  >
                    <span className="text-3xl">{l.flag}</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tighter">
                      {l.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BEHAVIOR SECTION ── */}
        {activeSection === "behavior" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <ZapIcon className="w-6 h-6 text-indigo-200" />
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Cognitive Entropy
                  </h3>
                </div>
                <div className="flex items-center justify-between mb-10">
                  <p className="text-indigo-100 text-sm font-medium italic">
                    Adjust the variance of AI's neural connections
                  </p>
                  <div className="text-4xl font-black">
                    {formData.temperature.toFixed(1)}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    handleChange("temperature", parseFloat(e.target.value))
                  }
                  className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-[10px] font-black uppercase mt-4 text-indigo-200">
                  <span>Deterministic</span>
                  <span>Generative</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-[rgb(var(--color-background))]">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Ready for Deployment
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Response Speed
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">
                    TURBO INFRASTRUCTURE (READY)
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Privacy Protocols
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">
                    ENCRYPTED AT REST
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Neural Sync
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ── KNOWLEDGE SECTION ── */}
        {activeSection === "knowledge" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Enterprise Knowledge Injection
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Augment your agent's intelligence with industry-specific data.
                Upload proprietary manuals, FAQs, or connect a real-time data
                source.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    <Link2 className="w-4 h-4" />
                    Knowledge Source URL (XML/JSON/Doc)
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-industry-api.com/v1/context"
                    value={formData.knowledgeUrl}
                    onChange={(e) =>
                      handleChange("knowledgeUrl", e.target.value)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    <FileText className="w-4 h-4" />
                    Direct Context Upload (Raw Data)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste your business FAQs, legal disclaimers, or specific product details here..."
                    value={formData.knowledgeText}
                    onChange={(e) =>
                      handleChange("knowledgeText", e.target.value)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all resize-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-[rgb(var(--color-text-primary))]">
                Integrate Vector Database (Coming Soon)
              </h4>
              <p className="text-xs text-[rgb(var(--color-text-muted))] max-w-xs mt-1">
                Connect Pinecone or Weaviate for multi-gigabyte industrial
                context retrieval.
              </p>
            </div>
          </div>
        )}

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex items-center justify-between pt-10 border-t border-[rgb(var(--color-border))]">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={onCancel}
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Button>

          <div className="flex items-center gap-4">
            {activeSection !== "behavior" && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setActiveSection(
                    activeSection === "identity" ? "voice" : "behavior",
                  )
                }
              >
                Continue Tuning
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="gap-2 min-w-[180px]"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving
                ? "Synchronizing..."
                : agent
                  ? "Update Neural Core"
                  : "Initialize Agent"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
