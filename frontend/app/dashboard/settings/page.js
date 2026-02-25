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
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    groqApiKey: "",
    elevenlabsApiKey: "",
    assemblyaiApiKey: "",
    defaultLanguage: "en",
    defaultVoice: "Rachel",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3001/api/settings");
        if (res.ok) {
          const data = await res.json();
          // Merge with defaults to ensure all fields exist
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3001/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        console.log("Settings saved");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-500/25">
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
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Secure API keys and system preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Twilio Configuration */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Twilio Integration
                </h2>
                <p className="text-blue-100 font-medium">
                  Voice communication platform settings
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <Key className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Account SID</span>
                </label>
                <input
                  type="text"
                  value={settings.twilioAccountSid}
                  onChange={(e) =>
                    handleChange("twilioAccountSid", e.target.value)
                  }
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Auth Token</span>
                </label>
                <input
                  type="password"
                  value={settings.twilioAuthToken}
                  onChange={(e) =>
                    handleChange("twilioAuthToken", e.target.value)
                  }
                  placeholder="Your Twilio Auth Token"
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={settings.twilioPhoneNumber}
                onChange={(e) =>
                  handleChange("twilioPhoneNumber", e.target.value)
                }
                placeholder="+1234567890"
                className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Groq Configuration */}
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
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <Key className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Groq API Key</span>
              </label>
              <input
                type="password"
                value={settings.groqApiKey}
                onChange={(e) => handleChange("groqApiKey", e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* ElevenLabs Configuration (TTS) */}
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
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <Key className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>ElevenLabs API Key</span>
              </label>
              <input
                type="password"
                value={settings.elevenlabsApiKey}
                onChange={(e) =>
                  handleChange("elevenlabsApiKey", e.target.value)
                }
                placeholder="your_elevenlabs_api_key"
                className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* AssemblyAI Configuration (STT) */}
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
            <div>
              <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <Key className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>AssemblyAI API Key</span>
              </label>
              <input
                type="password"
                value={settings.assemblyaiApiKey}
                onChange={(e) =>
                  handleChange("assemblyaiApiKey", e.target.value)
                }
                placeholder="your_assemblyai_api_key"
                className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Default Preferences
                </h2>
                <p className="text-purple-100 font-medium">
                  System-wide default configurations
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Default Language</span>
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    handleChange("defaultLanguage", e.target.value)
                  }
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white font-medium backdrop-blur-sm transition-all duration-300 appearance-none"
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
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Default Voice</span>
                </label>
                <select
                  value={settings.defaultVoice}
                  onChange={(e) => handleChange("defaultVoice", e.target.value)}
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white font-medium backdrop-blur-sm transition-all duration-300 appearance-none"
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British Male)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Female)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleSave}
            className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105 ${saved
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25"
                : "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-teal-500/25 hover:shadow-teal-500/40"
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              {saved ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Settings Saved!
                </>
              ) : (
                <>
                  <Save className="h-6 w-6 mr-3" />
                  Save Configuration
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
