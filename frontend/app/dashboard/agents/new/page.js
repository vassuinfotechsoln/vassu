"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Brain } from "lucide-react";
import AgentEditor from "@/components/AgentEditor";

export default function NewAgentPage() {
  const router = useRouter();

  const handleSave = async (agentData) => {
    try {
      console.log("Creating agent with data:", agentData);
      const response = await fetch("/api/agents", {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log("Agent created successfully:", result);
      router.push("/dashboard/agents");
    } catch (error) {
      console.error("Error creating agent:", error);
      alert(`Failed to create agent: ${error.message}`);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/agents");
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-6 mb-8">
          <button
            onClick={handleCancel}
            className="glass-card rounded-2xl p-4 hover:scale-105 transition-all duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
          </button>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text mb-2">
                Create AI Agent
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                Design your intelligent voice assistant
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Editor */}
      <div className="max-w-4xl mx-auto">
        <AgentEditor onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
