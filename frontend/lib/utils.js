import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds) {
  if (!seconds) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  // Remove non-digits
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Format international numbers
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, -10)} (${cleaned.slice(
      -10,
      -7
    )}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }

  return phoneNumber;
}

export function getLanguageName(code) {
  const languages = {
    en: "English",
    hi: "Hindi",
    gu: "Gujarati",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
  };

  return languages[code] || code;
}

export function getVoiceName(voice) {
  const voices = {
    alloy: "Alloy (Neutral)",
    echo: "Echo (Male)",
    fable: "Fable (British Male)",
    onyx: "Onyx (Deep Male)",
    nova: "Nova (Female)",
    shimmer: "Shimmer (Female)",
  };

  return voices[voice] || voice;
}

export function getCallStatusColor(status) {
  const colors = {
    INITIATED: "bg-yellow-100 text-yellow-800",
    RINGING: "bg-blue-100 text-blue-800",
    ANSWERED: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
}

export class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit("message", data);

          if (data.type) {
            this.emit(data.type, data.payload);
          }
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.emit("disconnected");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, message not sent:", data);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("WebSocket event callback error:", error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}
