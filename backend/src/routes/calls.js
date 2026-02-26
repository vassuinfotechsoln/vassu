const express = require("express");
const { PrismaClient } = require("@prisma/client");
const getConfig = require("../utils/config");

const router = express.Router();
const prisma = new PrismaClient();

// Mock Twilio functionality for development
const mockTwilio = {
  calls: {
    create: async (options) => ({
      sid: "mock_call_" + Date.now(),
      to: options.to,
      from: options.from,
      status: "initiated",
    }),
  },
  twiml: {
    VoiceResponse: class {
      constructor() {
        this.body = "";
      }
      say(options, text) {
        this.body += `<Say>${text}</Say>`;
        return this;
      }
      start() {
        return { stream: () => this };
      }
      toString() {
        return `<?xml version="1.0" encoding="UTF-8"?><Response>${this.body}</Response>`;
      }
    },
  },
};

// Helper to get Twilio client dynamically
const getTwilioClient = () => {
  const config = getConfig();
  if (
    config.twilioAccountSid &&
    config.twilioAuthToken &&
    config.twilioAccountSid.startsWith("AC")
  ) {
    try {
      const realTwilio = require("twilio");
      console.log("Using real Twilio client");
      return {
        client: realTwilio(config.twilioAccountSid, config.twilioAuthToken),
        twilio: realTwilio,
      };
    } catch (error) {
      console.error("Failed to initialize real Twilio client:", error.message);
    }
  }
  console.log("Using mock Twilio client");
  return { client: mockTwilio, twilio: mockTwilio };
};

// Map our voice names to Twilio TTS voices
function getTwilioVoice(voiceName) {
  const map = {
    alloy: "Polly.Joanna", // Neutral female
    echo: "Polly.Matthew", // Male
    fable: "Polly.Brian", // British Male
    onyx: "Polly.Joey", // Deep Male
    nova: "Polly.Salli", // Friendly Female
    shimmer: "Polly.Kendra", // Soft Female
  };
  return map[voiceName] || "alice"; // fallback to alice
}

// Map our language codes to Twilio language codes
function getTwilioLanguage(lang) {
  const map = {
    en: "en-US",
    hi: "hi-IN",
    gu: "gu-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
  };
  return map[lang] || "en-US";
}

// Get all calls
router.get("/", async (req, res) => {
  try {
    const calls = await prisma.call.findMany({
      include: {
        agent: {
          select: { name: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get call by ID
router.get("/:id", async (req, res) => {
  try {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      include: {
        agent: true,
        transcripts: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.json(call);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Phone number formatting helper
function formatPhoneNumber(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10 && digits.match(/^[6-9]/)) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  return digits.length >= 10 ? `+${digits}` : `+1${digits}`;
}

// Initiate outbound call
router.post("/outbound", async (req, res) => {
  try {
    const { agentId, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }

    // Find the selected agent
    const selectedAgent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!selectedAgent) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    const config = getConfig();
    const { client: twilioClient } = getTwilioClient();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;

    // Warn if BASE_URL is localhost (webhooks won't work with VI/Twilio in this case)
    if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
      console.warn(
        "⚠️  BASE_URL is localhost — Twilio/VI webhooks won't work. Use VPS IP or ngrok URL.",
      );
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Create database record
    const call = await prisma.call.create({
      data: {
        agentId,
        phoneNumber: formattedNumber,
        direction: "OUTBOUND",
        status: "INITIATED",
      },
      include: {
        agent: true,
      },
    });

    const webhookUrl = `${baseUrl}/api/calls/webhook/outbound/${call.id}`;

    const twilioCall = await twilioClient.calls.create({
      to: formattedNumber,
      from: config.twilioPhoneNumber || "+1234567890",
      url: webhookUrl,
      method: "POST",
      statusCallback: `${baseUrl}/api/calls/webhook/status/${call.id}`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    res.json({
      callId: call.id,
      twilioSid: twilioCall.sid,
      formattedNumber,
      webhookUrl,
      agent: selectedAgent,
    });
  } catch (error) {
    console.error("Outbound call error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk outbound calls
router.post("/bulk", async (req, res) => {
  try {
    const { agentId, recipients } = req.body; // recipients is array of { number, name, company }

    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: "Recipients array is required" });
    }

    const selectedAgent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!selectedAgent) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    const config = getConfig();
    const { client: twilioClient } = getTwilioClient();
    const baseUrl =
      config.baseUrl || `http://127.0.0.1:${process.env.PORT || 3001}`;

    const results = [];

    // Rapid dispatch (in real world use a queue like BullMQ)
    for (const person of recipients) {
      try {
        const formattedNumber = formatPhoneNumber(
          person.number || person.Phone || person.phone,
        );

        const call = await prisma.call.create({
          data: {
            agentId,
            phoneNumber: formattedNumber,
            direction: "OUTBOUND",
            status: "INITIATED",
          },
        });

        const webhookUrl = `${baseUrl}/api/calls/webhook/outbound/${call.id}`;

        const twilioCall = await twilioClient.calls.create({
          to: formattedNumber,
          from: config.twilioPhoneNumber || "+1234567890",
          url: webhookUrl,
          method: "POST",
          statusCallback: `${baseUrl}/api/calls/webhook/status/${call.id}`,
          statusCallbackEvent: [
            "initiated",
            "ringing",
            "answered",
            "completed",
          ],
        });

        results.push({
          id: call.id,
          sid: twilioCall.sid,
          number: formattedNumber,
        });
      } catch (err) {
        console.error(`Failed to call ${person.number}:`, err.message);
      }
    }

    res.json({
      message: `Successfully queued ${results.length} calls`,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Twilio/VI webhook for inbound calls
router.post("/webhook/inbound", async (req, res) => {
  console.log("Received Inbound Webhook:", {
    from: req.body.From,
    to: req.body.To,
    sid: req.body.CallSid,
    method: req.method,
  });

  try {
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    const config = getConfig();

    // Find first agent as fallback (or handle specific assignment)
    const agent = await prisma.agent.findFirst({
      orderBy: { createdAt: "desc" }, // Get most recently created/updated
    });

    if (!agent) {
      console.error("No agents found in database to handle inbound call");
      twiml.say("System error: No agents available.");
      return res.type("text/xml").send(twiml.toString());
    }

    const call = await prisma.call.create({
      data: {
        agentId: agent.id,
        phoneNumber: req.body.From || "Unknown",
        direction: "INBOUND",
        status: "ANSWERED",
      },
    });

    console.log(`Created call record: ${call.id} for agent: ${agent.name}`);

    const gather = twiml.gather({
      input: "speech",
      timeout: 5,
      speechTimeout: "auto",
      action: `${config.baseUrl}/api/calls/webhook/response/${call.id}`,
      method: "POST",
    });

    gather.say(
      { voice: "alice" },
      "Hello! I am your AI assistant. How can I help you today?",
    );

    twiml.say({ voice: "alice" }, "Thank you for calling. Goodbye!");
    twiml.hangup();

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Inbound webhook error:", error);
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({}, "Sorry, there was an error processing your call.");
    res.type("text/xml").send(twiml.toString());
  }
});

// Twilio webhook for outbound calls
router.post("/webhook/outbound/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    const config = getConfig();

    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { agent: true },
    });

    let agentGreeting = `Hello! I am ${call?.agent?.name || "your AI assistant"}. How can I help you today?`;

    if (call?.agent?.prompt) {
      // Use the first sentence of the prompt as greeting context, then ask
      const langMap = {
        hi: "Hindi",
        gu: "Gujarati",
        en: "English",
        ta: "Tamil",
        te: "Telugu",
        mr: "Marathi",
      };
      const lang = langMap[call.agent.language] || "English";

      try {
        const Groq = require("groq-sdk");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `${call.agent.prompt}\n\nYou are starting a phone call. Generate a short, friendly opening greeting (max 20 words) in ${lang}. Just the greeting text, nothing else.`,
            },
            {
              role: "user",
              content: "Start the call with your opening greeting.",
            },
          ],
          temperature: call.agent.temperature || 0.7,
          max_tokens: 50,
        });
        agentGreeting = completion.choices[0].message.content.trim();
      } catch (e) {
        console.warn("Groq greeting error, using default:", e.message);
      }
    }

    const voice = getTwilioVoice(call?.agent?.voice || "alloy");
    const gather = twiml.gather({
      input: "speech",
      timeout: 3,
      speechTimeout: "auto",
      language: getTwilioLanguage(call?.agent?.language || "en"),
      action: `${config.baseUrl}/api/calls/webhook/response/${callId}`,
      method: "POST",
    });

    gather.say({ voice }, agentGreeting);

    twiml.say({ voice }, "I did not hear anything. Let me try again.");
    twiml.redirect(`${config.baseUrl}/api/calls/webhook/outbound/${callId}`);

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Outbound webhook error:", error);
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({}, "Sorry, there was an error.");
    res.type("text/xml").send(twiml.toString());
  }
});

// Handle user response and continue conversation (Real AI powered)
router.post("/webhook/response/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    const userSpeech = req.body.SpeechResult || "";
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    const config = getConfig();

    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        agent: true,
        transcripts: { orderBy: { timestamp: "asc" }, take: 10 },
      },
    });

    if (call && call.agent && userSpeech) {
      // Save user transcript
      await prisma.transcript.create({
        data: { callId, speaker: "user", text: userSpeech },
      });

      // Build conversation history for AI context
      const conversation = call.transcripts.map((t) => ({
        role: t.speaker === "user" ? "user" : "assistant",
        content: t.text,
      }));

      // Real Groq AI response
      let aiResponse = "Main samajh gaya. Kuch aur puchh sakte hain?";
      try {
        const Groq = require("groq-sdk");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const languageMap = {
          hi: "Hindi",
          gu: "Gujarati",
          en: "English",
          ta: "Tamil",
          te: "Telugu",
          mr: "Marathi",
        };
        const lang = languageMap[call.agent.language] || "English";

        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant", // Active Groq model
          messages: [
            {
              role: "system",
              content: `${call.agent.prompt}. Keep responses under 25 words. You are on a phone call. Language: ${lang}. Be natural and conversational.`,
            },
            ...conversation,
            { role: "user", content: userSpeech },
          ],
          temperature: call.agent.temperature || 0.7,
          max_tokens: 80,
        });

        aiResponse = completion.choices[0].message.content.trim();
        console.log(`AI Response for call ${callId}: ${aiResponse}`);
      } catch (groqError) {
        console.error("Groq error in webhook:", groqError.message);
      }

      // Save AI transcript
      await prisma.transcript.create({
        data: { callId, speaker: "assistant", text: aiResponse },
      });

      // Continue listening for next user input
      const agentVoice = getTwilioVoice(call?.agent?.voice || "alloy");
      const gather = twiml.gather({
        input: "speech",
        timeout: 5,
        speechTimeout: "auto",
        language: getTwilioLanguage(call?.agent?.language || "en"),
        action: `${config.baseUrl}/api/calls/webhook/response/${callId}`,
        method: "POST",
      });

      gather.say({ voice: agentVoice }, aiResponse);

      twiml.say(
        { voice: agentVoice },
        "Thank you for your time. Have a great day!",
      );
      twiml.hangup();
    } else {
      // No speech detected or no agent
      const gather = twiml.gather({
        input: "speech",
        timeout: 5,
        speechTimeout: "auto",
        action: `${config.baseUrl}/api/calls/webhook/response/${callId}`,
        method: "POST",
      });
      gather.say(
        { voice: "alice" },
        "I didn't catch that. Could you please repeat?",
      );
      twiml.hangup();
    }

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Response webhook error:", error);
    const { twilio } = getTwilioClient();
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({}, "Thank you for calling. Goodbye!");
    twiml.hangup();
    res.type("text/xml").send(twiml.toString());
  }
});

// Handle call status updates
router.post("/webhook/status/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    const callStatus = req.body.CallStatus;

    await prisma.call.update({
      where: { id: callId },
      data: {
        status: callStatus.toUpperCase(),
        ...(callStatus === "completed" && {
          endedAt: new Date(),
          duration: parseInt(req.body.CallDuration) || 0,
        }),
      },
    });

    res.status(200).send("OK");
  } catch (error) {
    console.error("Status webhook error:", error);
    res.status(200).send("OK");
  }
});

module.exports = router;
