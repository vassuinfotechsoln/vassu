const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");

const router = express.Router();
const prisma = new PrismaClient();

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq =
  groqApiKey.trim() !== ""
    ? new Groq({ apiKey: groqApiKey })
    : null;

function logStructured(message, extra = {}) {
  console.log(
    JSON.stringify(
      {
        source: "vi_webhook",
        message,
        ...extra,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

async function handleCallStarted(payload) {
  const {
    call_id: callId,
    from,
    to,
    timestamp,
    metadata = {},
  } = payload;

  await prisma.callSession.upsert({
    where: { callId },
    update: {
      callerNumber: from,
      receiverNumber: to,
      status: "started",
      startedAt: timestamp ? new Date(timestamp) : new Date(),
      updatedAt: new Date(),
    },
    create: {
      callId,
      callerNumber: from,
      receiverNumber: to,
      status: "started",
      startedAt: timestamp ? new Date(timestamp) : new Date(),
      transcript: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  logStructured("Call session started", {
    event: "call.started",
    callId,
    from,
    to,
    metadata,
  });
}

async function forwardAudioToAI(payload) {
  const { call_id: callId, audio, metadata = {} } = payload;

  logStructured("Forwarding audio to AI service", {
    event: "call.audio",
    callId,
    hasAudio: !!audio,
    metadata,
  });

  // TODO: Integrate with your real-time audio processing pipeline (e.g., WebSocket to RealtimeService)
}

async function handleTranscription(payload) {
  const {
    call_id: callId,
    transcription,
    timestamp,
    metadata = {},
  } = payload;

  let aiResponse = null;

  if (groq && transcription) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are VassuTalks, a concise AI voice agent. Respond in under 25 words, suitable for a phone call.",
          },
          { role: "user", content: transcription },
        ],
        temperature: 0.7,
        max_tokens: 80,
      });

      aiResponse = completion.choices[0].message.content.trim();
    } catch (err) {
      console.error("[VI Webhook] Groq error:", err.message);
    }
  }

  const existing = await prisma.callSession.findUnique({
    where: { callId },
    select: { transcript: true },
  });

  const parts = [];
  if (existing?.transcript) parts.push(existing.transcript);
  if (transcription) parts.push(`User: ${transcription}`);
  if (aiResponse) parts.push(`AI: ${aiResponse}`);

  await prisma.callSession.update({
    where: { callId },
    data: {
      transcript: parts.join("\n"),
      updatedAt: new Date(),
    },
  });

  logStructured("Processed transcription", {
    event: "call.transcription",
    callId,
    hasTranscription: !!transcription,
    hasAiResponse: !!aiResponse,
    timestamp,
    metadata,
  });
}

async function handleCallAnswered(payload) {
  const { call_id: callId, timestamp, metadata = {} } = payload;

  await prisma.callSession.updateMany({
    where: { callId },
    data: {
      status: "answered",
      updatedAt: new Date(),
      ...(timestamp && { startedAt: new Date(timestamp) }),
    },
  });

  logStructured("Call answered", {
    event: "call.answered",
    callId,
    timestamp,
    metadata,
  });
}

async function handleCallEnded(payload) {
  const { call_id: callId, timestamp, metadata = {} } = payload;

  await prisma.callSession.updateMany({
    where: { callId },
    data: {
      status: "ended",
      endedAt: timestamp ? new Date(timestamp) : new Date(),
      updatedAt: new Date(),
    },
  });

  logStructured("Call ended", {
    event: "call.ended",
    callId,
    timestamp,
    metadata,
  });
}

async function handleCallFailed(payload) {
  const { call_id: callId, timestamp, metadata = {} } = payload;

  await prisma.callSession.updateMany({
    where: { callId },
    data: {
      status: "failed",
      endedAt: timestamp ? new Date(timestamp) : new Date(),
      updatedAt: new Date(),
    },
  });

  logStructured("Call failed", {
    event: "call.failed",
    callId,
    timestamp,
    metadata,
  });
}

async function processEventAsync(payload) {
  const { event } = payload;

  switch (event) {
    case "call.started":
      await handleCallStarted(payload);
      break;
    case "call.answered":
      await handleCallAnswered(payload);
      break;
    case "call.audio":
      await forwardAudioToAI(payload);
      break;
    case "call.transcription":
      await handleTranscription(payload);
      break;
    case "call.ended":
      await handleCallEnded(payload);
      break;
    case "call.failed":
      await handleCallFailed(payload);
      break;
    default:
      logStructured("Unhandled VI event type", { event });
  }
}

router.post("/", (req, res) => {
  const payload = req.body || {};

  logStructured("Incoming VI webhook", {
    headers: {
      "x-vi-signature": req.header("x-vi-signature") || null,
      "user-agent": req.header("user-agent") || null,
    },
    body: payload,
  });

  const { event, call_id: callId, timestamp } = payload;

  if (!event || !callId || !timestamp) {
    logStructured("Validation failed", {
      event,
      callId,
      timestamp,
    });
    return res.status(400).json({
      error: "Missing required fields: event, call_id, timestamp",
    });
  }

  // Respond fast, process heavy work asynchronously
  setImmediate(() => {
    processEventAsync(payload).catch((err) => {
      console.error("[VI Webhook] Async processing error:", err);
    });
  });

  return res.status(200).json({ status: "received" });
});

module.exports = router;

