"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Phone,
  Bot,
  Globe,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  ChevronDown,
  Headphones,
  Brain,
  Rocket,
  Clock,
  TrendingUp,
  MessageSquare,
  Lock,
  LayoutDashboard,
  Play,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════════
   ANIMATIONS  (pure CSS injected once)
══════════════════════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@keyframes float-slow   { 0%,100%{transform:translateY(0)   rotate(0deg)}  50%{transform:translateY(-30px) rotate(3deg)} }
@keyframes float-med    { 0%,100%{transform:translateY(0)   rotate(0deg)}  50%{transform:translateY(-20px) rotate(-2deg)} }
@keyframes meteor       { 0%{transform:translateX(0)  translateY(0)  opacity:1} 100%{transform:translateX(-600px) translateY(300px) opacity:0} }
@keyframes spin-slow    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes ping-ring    { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
@keyframes gradient-x   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes slide-reveal { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes glow-pulse   { 0%,100%{box-shadow:0 0 20px 2px rgba(99,102,241,.25)} 50%{box-shadow:0 0 45px 8px rgba(99,102,241,.5)} }
@keyframes border-spin  { from{--angle:0deg} to{--angle:360deg} }
@keyframes twinkle      { 0%,100%{opacity:.15} 50%{opacity:.8} }
@keyframes count-up     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes wave-move    { 0%{d:path("M0,160L48,149.3C96,139,192,117,288,122.7C384,128,480,160,576,154.7C672,149,768,107,864,101.3C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z")} 50%{d:path("M0,192L48,181.3C96,171,192,149,288,128C384,107,480,85,576,90.7C672,96,768,128,864,144C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z")} }

.float-slow  { animation: float-slow  8s ease-in-out infinite; }
.float-med   { animation: float-med   6s ease-in-out infinite; }
.spin-slow   { animation: spin-slow  20s linear infinite; }
.gradient-x  { background-size:200% 200%; animation:gradient-x 4s ease infinite; }
.glow-card:hover { animation: glow-pulse .8s ease-in-out infinite; }
.reveal      { opacity:0; }
.revealed    { animation: slide-reveal .7s cubic-bezier(.22,1,.36,1) forwards; }
.twinkle     { animation: twinkle 3s ease-in-out infinite; }
html { scroll-behavior: smooth !important; }
`;

function useGlobalCSS() {
  useEffect(() => {
    if (document.getElementById("vt-anim")) return;
    const s = document.createElement("style");
    s.id = "vt-anim";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }, []);
}

/* ══════════════════════════════════════════════════════════════════════════════
   CANVAS NETWORK PARTICLES
══════════════════════════════════════════════════════════════════════════════ */
function NetworkCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);

    const N = Math.min(80, Math.floor((W * H) / 14000));

    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.8 + 0.6,
      color: Math.random() > 0.5 ? "99,102,241" : "139,92,246",
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 130) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      // dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},.7)`;
        ctx.fill();
        // move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    }
    draw();

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHOOTING STARS / METEORS
══════════════════════════════════════════════════════════════════════════════ */
function Meteors({ count = 10 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 h-px w-24 rotate-[215deg]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            background:
              "linear-gradient(90deg,rgba(99,102,241,0),rgba(99,102,241,.8))",
            animation: `meteor ${Math.random() * 5 + 4}s linear ${Math.random() * 8}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TWINKLING STARS
══════════════════════════════════════════════════════════════════════════════ */
function Stars({ count = 60 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 2 + 0.5}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
══════════════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal");
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("revealed"), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════════════════════════ */
function Counter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseFloat(target.replace(/[^0-9.]/g, "")) || 0;
          const dur = 2000;
          const steps = 50;
          let i = 0;
          const iv = setInterval(() => {
            i++;
            setVal(Math.round(num * (i / steps)));
            if (i >= steps) clearInterval(iv);
          }, dur / steps);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {typeof val === "number" && target.includes(",")
        ? val.toLocaleString()
        : val}
      {suffix}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FLOATING ORB  (animated blob)
══════════════════════════════════════════════════════════════════════════════ */
function Orb({ color, size, top, left, delay = "0s", speed = "float-slow" }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${speed}`}
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
        animationDelay: delay,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   GRID PATTERN BACKGROUND
══════════════════════════════════════════════════════════════════════════════ */
function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PING RINGS  (expanding rings around a center point)
══════════════════════════════════════════════════════════════════════════════ */
function PingRings() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {[0, 0.8, 1.6].map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-indigo-500/20"
          style={{
            width: `${(i + 1) * 180}px`,
            height: `${(i + 1) * 180}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            animation: `ping-ring 3s ease-out ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 glow-card">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Vassu
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Talks
            </span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-slate-400 hover:text-white font-medium transition-colors text-sm relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-400 hover:text-white font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="#pricing"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 text-sm"
              >
                View Plans
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════════════════ */
function Hero() {
  useGlobalCSS();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050508] pt-20">
      {/* Backgrounds */}
      <GridPattern />
      <Stars count={70} />
      <Meteors count={12} />
      <Orb
        color="rgba(99,102,241,.18)"
        size="700px"
        top="-100px"
        left="30%"
        speed="float-slow"
      />
      <Orb
        color="rgba(139,92,246,.12)"
        size="500px"
        top="30%"
        left="-5%"
        speed="float-med"
        delay="2s"
      />
      <Orb
        color="rgba(168,85,247,.1)"
        size="400px"
        top="40%"
        left="70%"
        speed="float-slow"
        delay="4s"
      />

      {/* Network canvas */}
      <NetworkCanvas />

      {/* Ping rings */}
      <PingRings />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <Reveal delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
              Powered by Groq AI + Cloud CPaaS
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
            AI Voice Agents That
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent gradient-x">
              Actually Convert
            </span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Deploy intelligent voice agents on private virtual numbers. Speak
            Hindi, Gujarati, Tamil & more. Run bulk campaigns. Close leads 24×7
            — completely automated.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="#pricing"
              className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 text-lg overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              See Pricing Plans
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 text-lg"
            >
              <Phone className="w-4 h-4 text-indigo-400" />
              Book a Demo
            </Link>
          </div>
        </Reveal>

        {/* Stats with counter */}
        <Reveal delay={400}>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { num: "10000", suffix: "+", label: "Calls / day" },
              { num: "6", suffix: "", label: "Indian languages" },
              { num: "99.9", suffix: "%", label: "Uptime SLA" },
            ].map(({ num, suffix, label }) => (
              <div key={label} className="text-center group">
                <p className="text-3xl font-black text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  <Counter target={num} suffix={suffix} />
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-slate-600 text-xs font-medium tracking-widest uppercase">
          Scroll
        </span>
        <ChevronDown className="w-5 h-5 text-slate-600" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d15] to-transparent pointer-events-none" />
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════════════════════ */
function Features() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600",
      title: "AI Voice Agents",
      desc: "Custom agents with personality, language, and domain knowledge. Sound human — not robotic.",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      color: "from-violet-500 to-indigo-600",
      title: "Real Virtual Numbers",
      desc: "Real Indian virtual numbers via Cloud CPaaS. No SIM needed. Call any number in India instantly.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      title: "6 Indian Languages",
      desc: "Hindi, Gujarati, Tamil, Telugu, Marathi, English — agent auto-switches per customer.",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      color: "from-pink-500 to-rose-600",
      title: "Bulk Campaigns",
      desc: "Upload Excel/CSV with 10,000+ numbers. Set interval. Launch with one click.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      title: "Groq LLM Brain",
      desc: "Ultra-fast responses via Groq llama-3.1-8b. Real-time answers, zero lag.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      title: "Live Analytics",
      desc: "Transcripts, duration, sentiment, conversion rate — real-time in your dashboard.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      color: "from-teal-500 to-cyan-600",
      title: "Enterprise Security",
      desc: "End-to-end encrypted. Role-based access. SOC2 compliant. Data stays in India.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      title: "24×7 Operation",
      desc: "Never sleeps. Your agents handle calls round the clock, on holidays too.",
    },
  ];

  return (
    <section
      id="features"
      className="py-32 bg-[#0d0d15] relative overflow-hidden"
    >
      <Orb
        color="rgba(139,92,246,.1)"
        size="600px"
        top="0"
        left="60%"
        speed="float-slow"
      />
      <GridPattern />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300 text-xs font-bold uppercase tracking-widest">
                Everything Included
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for Indian Businesses
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to run a world-class AI calling operation from
              day one.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon, color, title, desc }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="group p-6 bg-white/3 hover:bg-white/6 border border-white/5 hover:border-indigo-500/20 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 glow-card cursor-default h-full">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Bot className="w-6 h-6" />,
      title: "Create Your Agent",
      desc: "Name, personality, language, knowledge base — ready in 2 minutes.",
    },
    {
      num: "02",
      icon: <Users className="w-6 h-6" />,
      title: "Upload Contacts",
      desc: "Drop your Excel or CSV. We auto-extract all valid 10-digit Indian numbers.",
    },
    {
      num: "03",
      icon: <Rocket className="w-6 h-6" />,
      title: "Launch Campaign",
      desc: "Set call interval, pick agent, click Launch. Calls start immediately.",
    },
    {
      num: "04",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Track & Optimize",
      desc: "Transcripts, sentiment, conversions. Improve with every run.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-32 bg-[#0a0a0f] relative overflow-hidden"
    >
      <Orb
        color="rgba(99,102,241,.08)"
        size="700px"
        top="20%"
        left="20%"
        speed="float-med"
      />
      <Meteors count={6} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
                Simple Setup
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Live in Under 10 Minutes
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              No technical knowledge needed. If you can use WhatsApp, you can
              use VassuTalks.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px">
            <div
              className="h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 w-full"
              style={{
                animation: "gradient-x 3s ease infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          {steps.map(({ num, icon, title, desc }, i) => (
            <Reveal key={num} delay={i * 100}>
              <div className="relative flex flex-col items-center text-center p-6 group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {icon}
                  </div>
                  {/* Ping effect on step icon */}
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30"
                    style={{
                      animation: `ping-ring 2s ease-out ${i * 0.4}s infinite`,
                    }}
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0a0a0f] border-2 border-indigo-500 flex items-center justify-center z-20">
                    <span className="text-[9px] font-black text-indigo-400">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[.2em] mb-2">
                  {num}
                </span>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-indigo-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PRICING
══════════════════════════════════════════════════════════════════════════════ */
function Pricing() {
  const [billing, setBilling] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      tagline: "Perfect to get started",
      price: { monthly: 999, yearly: 799 },
      color: "from-slate-600 to-slate-700",
      badge: null,
      isFree: false,
      features: [
        "500 calls / month",
        "2 AI Agents",
        "Hindi + English",
        "Basic analytics",
        "Email support",
        "Private virtual number (1)",
        "Call transcripts",
      ],
      cta: "Get Starter",
    },
    {
      name: "Professional",
      tagline: "For growing sales teams",
      price: { monthly: 2999, yearly: 2399 },
      color: "from-indigo-600 to-purple-700",
      badge: "Most Popular",
      isFree: false,
      features: [
        "5,000 calls / month",
        "10 AI Agents",
        "All 6 Indian languages",
        "Bulk campaigns",
        "Advanced analytics",
        "Private virtual numbers (3)",
        "Priority support",
        "Webhook / CRM integration",
        "Custom agent personas",
      ],
      cta: "Get Professional",
    },
    {
      name: "Enterprise",
      tagline: "For large organisations",
      price: { monthly: null, yearly: null },
      color: "from-amber-600 to-orange-700",
      badge: "Custom",
      isFree: false,
      features: [
        "Unlimited calls",
        "Unlimited AI Agents",
        "All languages + custom",
        "Dedicated virtual numbers",
        "Dedicated account manager",
        "SLA 99.9% uptime",
        "Custom AI model fine-tuning",
        "On-premise deployment",
        "24×7 phone support",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 bg-[#0d0d15] relative overflow-hidden"
    >
      <Orb
        color="rgba(139,92,246,.1)"
        size="800px"
        top="-200px"
        left="30%"
        speed="float-slow"
      />
      <Stars count={30} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Simple, No-Surprise Pricing
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
              Pick a plan. Go live in 10 minutes. Scale as you grow.
            </p>

            <div className="inline-flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
              {["monthly", "yearly"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billing === b ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                  {b === "monthly" ? "Monthly" : "Yearly"}
                  {b === "yearly" && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-black">
                      SAVE 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(
            ({ name, tagline, price, color, badge, features, cta }, pi) => {
              const amt = price[billing];
              const isPopular = badge === "Most Popular";
              const isCustom = badge === "Custom";

              return (
                <Reveal key={name} delay={pi * 120}>
                  <div
                    className={`relative flex flex-col rounded-3xl border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl h-full ${isPopular ? "border-indigo-500/50 shadow-2xl shadow-indigo-500/20 scale-[1.02]" : "border-white/8 hover:border-white/20"}`}
                  >
                    {badge && (
                      <div
                        className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${isPopular ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30" : "bg-gradient-to-r from-amber-500 to-orange-600 text-white"}`}
                      >
                        {badge}
                      </div>
                    )}

                    <div
                      className={`p-8 rounded-t-3xl bg-gradient-to-br ${color}`}
                    >
                      <h3 className="text-2xl font-black text-white mb-1">
                        {name}
                      </h3>
                      <p className="text-white/60 text-sm font-medium mb-6">
                        {tagline}
                      </p>
                      {amt ? (
                        <div>
                          <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-white">
                              ₹{amt.toLocaleString("en-IN")}
                            </span>
                            <span className="text-white/60 font-medium mb-2">
                              / month
                            </span>
                          </div>
                          {billing === "yearly" && (
                            <p className="text-emerald-300 text-xs font-bold mt-1">
                              Save ₹
                              {(
                                (price.monthly - price.yearly) *
                                12
                              ).toLocaleString("en-IN")}
                              /yr
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-4xl font-black text-white">
                            Let's Talk
                          </p>
                          <p className="text-white/60 text-sm mt-1">
                            Custom quote for your scale
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-8 bg-white/3 border-t border-white/5 space-y-4">
                      {features.map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-3 group/item"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                          <span className="text-slate-300 text-sm font-medium">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 pt-0 bg-white/3 rounded-b-3xl">
                      <Link
                        href="/login"
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] ${isPopular ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50" : isCustom ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" : "bg-white/8 hover:bg-white/12 border border-white/10 text-white"}`}
                      >
                        {cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      {amt && (
                        <p className="text-center text-slate-600 text-xs mt-3 font-medium">
                          14-day free trial • No credit card required
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            },
          )}
        </div>

        <Reveal delay={200}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: <Shield className="w-4 h-4" />, text: "SOC2 Compliant" },
              { icon: <Lock className="w-4 h-4" />, text: "E2E Encrypted" },
              { icon: <Clock className="w-4 h-4" />, text: "99.9% Uptime SLA" },
              {
                icon: <MessageSquare className="w-4 h-4" />,
                text: "24×7 Support",
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors"
              >
                <span className="text-slate-600">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════════════════════════ */
function Testimonials() {
  const reviews = [
    {
      name: "Rahul Mehta",
      role: "Sales Head, FinEdge",
      text: "We ran 3,000 calls in one morning. VassuTalks did in 4 hours what our team took 2 weeks to do.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Founder, EduReach India",
      text: "The Hindi voice quality is incredible. Parents think they're talking to a real person. Enrollment up 40%.",
      rating: 5,
    },
    {
      name: "Amit Patel",
      role: "CTO, RealEstate360",
      text: "Seamless integration. Webhook sends data straight to our CRM. Saved us hiring 6 telecallers.",
      rating: 5,
    },
  ];

  return (
    <section className="py-32 bg-[#0a0a0f] relative overflow-hidden">
      <Orb
        color="rgba(99,102,241,.07)"
        size="600px"
        top="10%"
        left="50%"
        speed="float-slow"
        delay="1s"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Businesses Love VassuTalks
            </h2>
            <p className="text-slate-400 text-lg">
              Real results from real Indian businesses.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(({ name, role, text, rating }, i) => (
            <Reveal key={name} delay={i * 100}>
              <div className="p-8 bg-white/3 border border-white/8 rounded-3xl hover:border-indigo-500/20 hover:bg-white/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/5 group h-full">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform"
                      style={{ transitionDelay: `${j * 50}ms` }}
                    />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 font-medium">
                  "{text}"
                </p>
                <div>
                  <p className="text-white font-black">{name}</p>
                  <p className="text-slate-500 text-sm">{role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CTA BANNER
══════════════════════════════════════════════════════════════════════════════ */
function CTABanner() {
  return (
    <section className="py-24 bg-[#0d0d15] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-pink-600/5" />
      <Orb
        color="rgba(99,102,241,.25)"
        size="500px"
        top="0"
        left="30%"
        speed="float-slow"
      />
      <Orb
        color="rgba(139,92,246,.15)"
        size="400px"
        top="20%"
        left="60%"
        speed="float-med"
        delay="2s"
      />
      <Meteors count={8} />
      <Stars count={40} />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">
              Plans starting at ₹999 / month
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Start Closing Leads
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent gradient-x">
              Tonight
            </span>
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-slate-400 text-xl mb-10 max-w-xl mx-auto">
            Pick a plan. Go live in 10 minutes. Your AI agents work 24×7 — even
            when your team doesn't.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#pricing"
              className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 text-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <Sparkles className="w-5 h-5" />
              View Pricing Plans
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-3 px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 text-white font-bold rounded-2xl transition-all duration-300 text-lg hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <Phone className="w-5 h-5 text-indigo-400" />
              Book a Demo
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[#070709] border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white">
            Vassu
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Talks
            </span>
          </span>
        </div>
        <p className="text-slate-600 text-sm font-medium">
          © 2026 Vassu Infotech Solutions Pvt. Ltd. · Ahmedabad, India
        </p>
        <div className="flex items-center gap-6">
          {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
            <span
              key={link}
              className="text-slate-600 hover:text-slate-400 text-sm font-medium cursor-pointer transition-colors"
            >
              {link}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useGlobalCSS();
  return (
    <div className="bg-[#050508]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
