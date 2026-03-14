require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { execSync } = require("child_process");
const WebSocket = require("ws");

const callRoutes = require("./src/routes/calls");
const agentRoutes = require("./src/routes/agents");
const transcriptRoutes = require("./src/routes/transcripts");
const settingsRoutes = require("./src/routes/settings");
const authRoutes = require("./src/routes/auth");
const RealtimeService = require("./src/services/RealtimeService");

const PORT = process.env.PORT || 5050;

// ─── Optional: Auto-kill processes on the port (Windows only) ───────────────
function freePort(port) {
  // On macOS/Linux we rely on the normal EADDRINUSE error instead of trying
  // to shell out to OS-specific tools.
  if (process.platform !== "win32") {
    return;
  }

  try {
    const result = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
    });
    const lines = result.trim().split("\n");
    const killed = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      // Only kill LISTENING processes on our port, not random connections
      if (
        pid &&
        /^\d+$/.test(pid) &&
        !killed.has(pid) &&
        line.includes("LISTENING")
      ) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`🔪 Killed old process PID ${pid} on port ${port}`);
          killed.add(pid);
        } catch (_) {}
      }
    }
  } catch (_) {
    // netstat found nothing — port is already free (or command unavailable)
  }
}

freePort(PORT);
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for dev — restrict in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
 app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // Keep raw body for signature verification on webhook routes
      req.rawBody = buf.toString("utf8");
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
const verifyWebhook = require("./src/middleware/verifyWebhook");
const viWebhookRoutes = require("./src/routes/webhook");

app.use("/api/auth", authRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/webhooks/vi", verifyWebhook, viWebhookRoutes);

// WebSocket
const realtimeService = new RealtimeService();

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      await realtimeService.handleMessage(ws, data);
    } catch (error) {
      console.error("WebSocket message error:", error);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    realtimeService.cleanup(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket client error:", err.message);
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Server error handler (last resort)
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} still busy after auto-kill. Please close your terminal and try again.`,
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

// Start
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ WebSocket server ready`);
  console.log(`📡 Health: http://127.0.0.1:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down...");
  server.close(() => process.exit(0));
});
