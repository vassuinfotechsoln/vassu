"use client";

import { useState } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  User,
  Clock,
  Activity,
  Headphones,
} from "lucide-react";

export default function CallMonitor({ activeCall }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  if (!activeCall) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgb(var(--color-background))] flex items-center justify-center">
            <Headphones className="w-8 h-8 text-[rgb(var(--color-text-muted))]" />
          </div>
          <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            No Active Call
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-muted))]">
            Start a call to see the live monitor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="live-dot" style={{ background: "white" }} />
            <span className="text-sm font-semibold">Live Call</span>
          </div>
          <span className="text-sm opacity-80">00:45</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">+91 98765 43210</p>
            <p className="text-sm opacity-80">Demo Call</p>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="p-4 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
        <div className="flex items-center justify-center gap-1 h-12">
          <div className="waveform">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  opacity: isPaused ? 0.3 : 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Agent Info */}
      <div className="p-4 border-b border-[rgb(var(--color-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              Sales Agent
            </p>
            <p className="text-xs text-[rgb(var(--color-text-muted))]">
              Handling call
            </p>
          </div>
          <span className="badge badge-success">Active</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isMuted
                ? "bg-red-500/10 text-red-500"
                : "bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isPaused
                ? "bg-amber-500/10 text-amber-500"
                : "bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]"
            }`}
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !isSpeakerOn
                ? "bg-red-500/10 text-red-500"
                : "bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-border))]"
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          <button className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
