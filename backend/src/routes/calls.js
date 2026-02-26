/**
 * calls.js — Telephony CPaaS powered call routes
 *
 * Webhook paths registered with provider portal:
 *   Answer URL : GET  /api/calls/voice/answer/:callId
 *   Event URL  : POST /api/calls/voice/status/:callId
 *   Input URL  : POST /api/calls/voice/input/:callId
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const getConfig = require("../utils/config");
const provider = require("../services/TelephonyService");

const router = express.Router();
const prisma = new PrismaClient();

// ── Phone number formatter ─────────────────────────────────────────────────
function formatPhoneNumber(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (String(raw).startsWith("+")) return String(raw);
  return digits.length >= 10 ? `+${digits}` : `+91${digits}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/calls — list all calls
// ═══════════════════════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const calls = await prisma.call.findMany({
      include: { agent: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
    });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/calls/:id — single call with transcripts
// ═══════════════════════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      include: { agent: true, transcripts: { orderBy: { timestamp: "asc" } } },
    });
    if (!call) return res.status(404).json({ error: "Call not found" });
    res.json(call);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/calls/outbound — initiate a single outbound call
// ═══════════════════════════════════════════════════════════════════════════
router.post("/outbound", async (req, res) => {
  try {
    const { agentId, phoneNumber } = req.body;

    if (!phoneNumber)
      return res.status(400).json({ error: "Phone number is required" });
    if (!agentId)
      return res.status(400).json({ error: "Agent ID is required" });

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(400).json({ error: "Invalid agent ID" });

    const config = getConfig();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;

    if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
      console.warn(
        "⚠️  BASE_URL is localhost — Webhooks won't reach your server. Use a public IP or ngrok.",
      );
    }

    const formatted = formatPhoneNumber(phoneNumber);

    // 1. Create DB record
    const call = await prisma.call.create({
      data: {
        agentId,
        phoneNumber: formatted,
        direction: "OUTBOUND",
        status: "INITIATED",
      },
      include: { agent: true },
    });

    // 2. Dispatch via Provider
    const outboundRes = await provider.makeOutboundCall({
      to: formatted,
      callId: call.id,
      baseUrl,
    });

    // 3. Update DB
    await prisma.call.update({
      where: { id: call.id },
      data: {
        status: outboundRes.status === "simulated" ? "INITIATED" : "RINGING",
      },
    });

    res.json({
      callId: call.id,
      providerUuid: outboundRes.uuid,
      status: outboundRes.status,
      simulated: outboundRes.status === "simulated",
      toNumber: formatted,
      answerUrl: `${baseUrl}/api/calls/voice/answer/${call.id}`,
      agent,
    });
  } catch (err) {
    console.error("Outbound call error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/calls/bulk — bulk outbound calls with interval
// ═══════════════════════════════════════════════════════════════════════════
router.post("/bulk", async (req, res) => {
  try {
    const { agentId, recipients, intervalSeconds = 5 } = req.body;

    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: "Recipients array is required" });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(400).json({ error: "Invalid agent ID" });

    const config = getConfig();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;
    const delayMs = Math.min(
      Math.max(Number(intervalSeconds) * 1000, 1000),
      60000,
    );
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const results = [];

    for (let i = 0; i < recipients.length; i++) {
      const person = recipients[i];
      try {
        const formatted = formatPhoneNumber(
          person.number || person.Phone || person.phone || "",
        );

        const call = await prisma.call.create({
          data: {
            agentId,
            phoneNumber: formatted,
            direction: "OUTBOUND",
            status: "INITIATED",
          },
        });

        const outboundRes = await provider.makeOutboundCall({
          to: formatted,
          callId: call.id,
          baseUrl,
        });

        console.log(
          `[Bulk] ${i + 1}/${recipients.length} → ${formatted} (${outboundRes.uuid})`,
        );

        results.push({
          id: call.id,
          uuid: outboundRes.uuid,
          number: formatted,
          name: person.name || "",
        });
      } catch (err) {
        console.error(`[Bulk] Failed ${person.number}:`, err.message);
        results.push({ number: person.number || "", error: err.message });
      }

      if (i < recipients.length - 1) await sleep(delayMs);
    }

    res.json({
      message: `Dispatched ${results.filter((r) => !r.error).length} of ${recipients.length} calls`,
      intervalSeconds: delayMs / 1000,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/calls/voice/answer/:callId — Provider calls this when call is answered
// Returns Call Control JSON to control the call
// ═══════════════════════════════════════════════════════════════════════════
router.get("/voice/answer/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { agent: true },
    });

    await prisma.call.update({
      where: { id: callId },
      data: { status: "ANSWERED" },
    });

    // Generate greeting via Groq
    let greetingText = `Hello! I am ${call?.agent?.name || "your AI assistant"}. How can I help you today?`;

    if (call?.agent?.prompt) {
      try {
        const Groq = require("groq-sdk");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const langMap = {
          en: "English",
          hi: "Hindi",
          gu: "Gujarati",
          ta: "Tamil",
          te: "Telugu",
          mr: "Marathi",
        };
        const lang = langMap[call.agent.language] || "English";
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `${call.agent.prompt}\n\nGenerate a short friendly opening greeting (max 20 words) in ${lang}. Return only the greeting text.`,
            },
            { role: "user", content: "Start the call." },
          ],
          temperature: call.agent.temperature || 0.7,
          max_tokens: 50,
        });
        greetingText = completion.choices[0].message.content.trim();
      } catch (e) {
        console.warn("Groq greeting error, using default:", e.message);
      }
    }

    const config = getConfig();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;
    const voiceName = provider.getVoiceName(call?.agent?.voice || "alloy");
    const language = provider.getLanguage(call?.agent?.language || "en");
    const inputUrl = `${baseUrl}/api/calls/voice/input/${callId}`;

    const ncco = provider.buildVoiceResponse({
      text: greetingText,
      language,
      voiceName,
      inputUrl,
    });

    res.json(ncco);
  } catch (err) {
    console.error("Answer webhook error:", err);
    res.json([{ action: "talk", text: "Sorry, there was an error. Goodbye!" }]);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/calls/voice/input/:callId — Provider sends speech input here
// ═══════════════════════════════════════════════════════════════════════════
router.post("/voice/input/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    // Recognized speech in req.body.speech.results[0].text
    const speechResult =
      req.body?.speech?.results?.[0]?.text ||
      req.body?.dtmf?.digits ||
      req.body?.SpeechResult || // fallback
      "";

    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        agent: true,
        transcripts: { orderBy: { timestamp: "asc" }, take: 10 },
      },
    });

    if (!call || !speechResult) {
      // No speech — re-prompt
      res.json([
        { action: "talk", text: "I didn't catch that. Could you repeat?" },
      ]);
      return;
    }

    // Save user speech
    await prisma.transcript.create({
      data: { callId, speaker: "user", text: speechResult },
    });

    // Build conversation history
    const history = call.transcripts.map((t) => ({
      role: t.speaker === "user" ? "user" : "assistant",
      content: t.text,
    }));

    // Get AI response via Groq
    let aiResponse = "I understand. How can I help you further?";
    try {
      const Groq = require("groq-sdk");
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const languageMap = {
        en: "English",
        hi: "Hindi",
        gu: "Gujarati",
        ta: "Tamil",
        te: "Telugu",
        mr: "Marathi",
      };
      const lang = languageMap[call.agent.language] || "English";

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `${call.agent.prompt}. Keep responses under 25 words. Phone call. Language: ${lang}. Be natural.`,
          },
          ...history,
          { role: "user", content: speechResult },
        ],
        temperature: call.agent.temperature || 0.7,
        max_tokens: 80,
      });
      aiResponse = completion.choices[0].message.content.trim();
    } catch (e) {
      console.error("Groq error:", e.message);
    }

    // Save AI response
    await prisma.transcript.create({
      data: { callId, speaker: "assistant", text: aiResponse },
    });

    const config = getConfig();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;
    const voiceName = provider.getVoiceName(call.agent.voice || "alloy");
    const language = provider.getLanguage(call.agent.language || "en");
    const inputUrl = `${baseUrl}/api/calls/voice/input/${callId}`;

    const ncco = provider.buildVoiceResponse({
      text: aiResponse,
      language,
      voiceName,
      inputUrl,
    });
    res.json(ncco);
  } catch (err) {
    console.error("Input webhook error:", err);
    res.json([
      { action: "talk", text: "Thank you for your time. Have a great day!" },
    ]);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/calls/voice/status/:callId — Call status events
// ═══════════════════════════════════════════════════════════════════════════
router.post("/voice/status/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    // Status: "answered" | "ringing" | "completed" | "failed"
    const callStatus = (req.body.status || "").toUpperCase();
    const duration = parseInt(req.body.duration) || 0;

    if (callStatus) {
      const validStatuses = [
        "INITIATED",
        "RINGING",
        "ANSWERED",
        "COMPLETED",
        "FAILED",
      ];
      const finalStatus = validStatuses.includes(callStatus)
        ? callStatus
        : "COMPLETED";

      await prisma.call.update({
        where: { id: callId },
        data: {
          status: finalStatus,
          ...(finalStatus === "COMPLETED" && { endedAt: new Date(), duration }),
        },
      });

      console.log(`[Status] callId=${callId} → ${finalStatus} (${duration}s)`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Status webhook error:", err);
    res.status(200).json({ ok: true }); // always 200 so provider doesn't retry infinitely
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/calls/voice/inbound — incoming calls
// Register this URL in the portal as your inbound webhook
// ═══════════════════════════════════════════════════════════════════════════
router.post("/voice/inbound", async (req, res) => {
  try {
    const from = req.body.from || "Unknown";

    const agent = await prisma.agent.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!agent) {
      console.error("No agents found for inbound call");
      return res.json([
        { action: "talk", text: "No agents available. Goodbye!" },
      ]);
    }

    const call = await prisma.call.create({
      data: {
        agentId: agent.id,
        phoneNumber: from,
        direction: "INBOUND",
        status: "ANSWERED",
      },
    });

    const config = getConfig();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;
    const voiceName = provider.getVoiceName(agent.voice || "alloy");
    const language = provider.getLanguage(agent.language || "en");
    const inputUrl = `${baseUrl}/api/calls/voice/input/${call.id}`;

    const greeting = `Hello! I am ${agent.name}. How can I help you today?`;

    res.json(
      provider.buildVoiceResponse({
        text: greeting,
        language,
        voiceName,
        inputUrl,
      }),
    );
  } catch (err) {
    console.error("Inbound webhook error:", err);
    res.json([{ action: "talk", text: "Sorry, an error occurred. Goodbye!" }]);
  }
});

module.exports = router;
