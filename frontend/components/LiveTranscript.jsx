"use client";

import { useState, useEffect, useRef } from "react";
import { User, Bot, Mic, Volume2 } from "lucide-react";

export default function LiveTranscript({ callId }) {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let interval;

    const fetchTranscripts = async () => {
      if (!callId || callId === "demo-call") {
        // Fallback for demo mode
        const demoMessages = [
          {
            id: 1,
            speaker: "user",
            text: "Hello, I'm testing the industry deployment.",
            timestamp: new Date(),
          },
          {
            id: 2,
            speaker: "assistant",
            text: "Verified. Neural connections are stable and optimized for low latency.",
            timestamp: new Date(),
          },
        ];
        setMessages(demoMessages);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:3001/api/calls/${callId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.transcripts) {
            setMessages(
              data.transcripts.map((t) => ({
                id: t.id,
                speaker: t.speaker,
                text: t.text,
                timestamp: new Date(t.timestamp),
              })),
            );

            // If call is completed, stop polling
            if (data.status === "COMPLETED" || data.status === "FAILED") {
              setIsListening(false);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch transcripts:", error);
      }
    };

    fetchTranscripts();

    // Poll every 2 seconds for live feeling
    if (callId !== "demo-call") {
      interval = setInterval(fetchTranscripts, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[rgb(var(--color-border))] flex items-center justify-between bg-[rgb(var(--color-background))]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isListening && (
              <>
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </>
            )}
          </div>
          <span className="text-xs font-semibold text-[rgb(var(--color-text-muted))]">
            {isListening ? "Listening..." : "Paused"}
          </span>
        </div>
        <span className="text-[10px] font-medium text-[rgb(var(--color-text-muted))]">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-slide-up ${
              message.speaker === "user" ? "flex-row-reverse" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                message.speaker === "user"
                  ? "bg-indigo-500/10"
                  : "bg-purple-500/10"
              }`}
            >
              {message.speaker === "user" ? (
                <User className="w-4 h-4 text-indigo-500" />
              ) : (
                <Bot className="w-4 h-4 text-purple-500" />
              )}
            </div>
            <div
              className={`flex-1 max-w-[80%] ${
                message.speaker === "user" ? "text-right" : ""
              }`}
            >
              <div
                className={`inline-block p-3 rounded-2xl text-sm ${
                  message.speaker === "user"
                    ? "bg-indigo-500 text-white rounded-tr-md"
                    : "bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-primary))] rounded-tl-md border border-[rgb(var(--color-border))]"
                }`}
              >
                {message.text}
              </div>
              <p className="mt-1 text-[10px] text-[rgb(var(--color-text-muted))]">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isListening && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-500" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-md bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))]">
              <div className="flex gap-1">
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] flex items-center gap-3">
        <button className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Mic className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1 rounded-full bg-[rgb(var(--color-border))] overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </div>
        <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
