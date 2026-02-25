"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 5000,
}) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-emerald-500",
      iconBg: "bg-emerald-600",
    },
    error: {
      icon: XCircle,
      bg: "bg-red-500",
      iconBg: "bg-red-600",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-amber-500",
      iconBg: "bg-amber-600",
    },
    info: {
      icon: Info,
      bg: "bg-indigo-500",
      iconBg: "bg-indigo-600",
    },
  };

  const { icon: Icon, bg, iconBg } = config[type] || config.info;

  return (
    <div
      className={`${bg} text-white rounded-xl shadow-lg overflow-hidden animate-slide-in-right`}
      style={{ minWidth: 320, maxWidth: 400 }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`${iconBg} p-1.5 rounded-lg flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-white/20">
        <div
          className="h-full bg-white/40 rounded-r-full"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
