"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

// ── Google Icon SVG ──────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Animated background particles
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
    })),
  );

  const handleChange = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setError("");
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        name: form.name,
        mode,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === "login"
            ? "Invalid email or password. Please try again."
            : "Could not create account. Email may already be in use.",
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn("google", { callbackUrl });
  };

  const features = [
    { icon: <Zap className="w-4 h-4" />, text: "AI-powered voice agents" },
    { icon: <Phone className="w-4 h-4" />, text: "Virtual number calling" },
    { icon: <Shield className="w-4 h-4" />, text: "Enterprise-grade security" },
    { icon: <Sparkles className="w-4 h-4" />, text: "6 Indian languages" },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a0f]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-indigo-400/30 animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              VassuTalks
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              AI Voice Agents
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                That Actually Work
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Deploy intelligent voice agents across virtual numbers. Speak
              Hindi, Gujarati, Tamil and more — all powered by Groq AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
              >
                <div className="text-indigo-400">{f.icon}</div>
                <span className="text-sm font-medium text-slate-300">
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-xs text-slate-600 font-medium">
            &copy; 2026 Vassu Infotech Solutions · Enterprise AI Platform
          </p>
        </div>
      </div>

      {/* ── Right panel — Auth form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-[#0d0d15]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">VassuTalks</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === "login"
                ? "Sign in to access your AI voice platform"
                : "Get started with VassuTalks for free"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Google button — disabled until Google OAuth credentials are configured */}
          <div className="relative mb-6">
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white/5 border border-white/10 text-slate-500 font-bold rounded-2xl cursor-not-allowed opacity-60"
            >
              <GoogleIcon />
              Continue with Google
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Soon
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#0d0d15] text-xs font-bold text-slate-600 uppercase tracking-widest">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            {/* Name — only on signup */}
            {mode === "signup" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={
                    mode === "signup" ? "Min 6 characters" : "Your password"
                  }
                  className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-slate-500 text-sm mt-8 font-medium">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {/* Terms */}
          <p className="text-center text-slate-700 text-xs mt-6">
            By continuing, you agree to our{" "}
            <span className="text-slate-500 cursor-pointer hover:text-slate-400">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-slate-500 cursor-pointer hover:text-slate-400">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
