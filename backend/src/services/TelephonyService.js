/**
 * TelephonyService.js — Cloud CPaaS Voice API Integration
 *
 * Telephony CPaaS REST API reference:
 *   Base URL : https://api.vicp.in/v1   (set BASE_URL in .env to override)
 *   Auth     : Bearer token in Authorization header
 *
 * ── How to activate ────────────────────────────────────────────────────────
 *  1. Log in to the provider portal
 *  2. Create an application → copy API Key + Secret
 *  3. Enter them in Settings → Telephony Configuration (or .env)
 *  4. Set your public server URL in Settings → Base URL
 *  5. Register your virtual number on the portal
 * ───────────────────────────────────────────────────────────────────────────
 */

const getConfig = require("../utils/config");

// ── Telephony API base URL ────────────────────────────────────────────────────────
const VI_BASE_URL = process.env.VI_BASE_URL || "https://api.vicp.in/v1";

// ── Simulation mode ────────────────────────────────────────────────────────
// When telephony credentials are absent, all calls run in simulation so the rest
// of the app (dashboard, agents, transcripts) keeps working normally.
function isSimulation(config) {
  return !config.viApiKey || !config.viApiSecret || !config.viVirtualNumber;
}

// ── Auth header ────────────────────────────────────────────────────────────
// Uses HTTP Basic Auth: base64(apiKey:apiSecret) as Bearer token
function authHeader(config) {
  const token = Buffer.from(
    `${config.viApiKey}:${config.viApiSecret}`,
  ).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── makeOutboundCall ────────────────────────────────────────────────────────
/**
 * Initiates an outbound call via Telephony CPaaS.
 *
 * API  POST /v1/voice/calls
 * Body:
 * {
 *   "from"        : "+919XXXXXXXXX",   // your virtual number
 *   "to"          : "+919XXXXXXXXX",   // recipient
 *   "answer_url"  : "https://you.com/api/calls/ans/answer/{callId}",
 *   "event_url"   : "https://you.com/api/calls/ans/status/{callId}",
 *   "answer_method": "GET",
 *   "event_method" : "POST"
 * }
 *
 * Response:
 * {
 *   "uuid"   : "call_xxxx",
 *   "status" : "started",
 *   "direction": "outbound",
 *   "from"   : "+919XXXXXXXXX",
 *   "to"     : "+919XXXXXXXXX"
 * }
 */
async function makeOutboundCall({ to, callId, baseUrl }) {
  const config = getConfig();

  if (isSimulation(config)) {
    console.log(`[Telephony Simulation] Would call ${to} for callId=${callId}`);
    return {
      uuid: `vi_sim_${Date.now()}`,
      status: "simulated",
      to,
      from: "SIMULATION",
    };
  }

  const answerUrl = `${baseUrl}/api/calls/voice/answer/${callId}`;
  const eventUrl = `${baseUrl}/api/calls/voice/status/${callId}`;

  const body = {
    from: config.viVirtualNumber,
    to,
    answer_url: answerUrl,
    event_url: eventUrl,
    answer_method: "GET",
    event_method: "POST",
  };

  console.log(`[Voice] Initiating call to ${to} → answer_url: ${answerUrl}`);

  const res = await fetch(`${VI_BASE_URL}/voice/calls`, {
    method: "POST",
    headers: authHeader(config),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Telephony API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  console.log(
    `[Voice] Call initiated — uuid: ${data.uuid}, status: ${data.status}`,
  );
  return data;
}

// ── hangupCall ─────────────────────────────────────────────────────────────
async function hangupCall(viUuid) {
  const config = getConfig();
  if (isSimulation(config)) return { status: "simulated_hangup" };

  const res = await fetch(`${VI_BASE_URL}/voice/calls/${viUuid}`, {
    method: "DELETE",
    headers: authHeader(config),
  });

  return res.ok ? { status: "hung_up" } : { status: "error" };
}

// ── buildVoiceResponse ─────────────────────────────────────────────────────
/**
 * Builds a VI NCCO (Nexmo Call Control Object) — the JSON array that
 * instructs VI what to do when the call connects (same format as Vonage/Nexmo).
 *
 * VI follows the NCCO spec:
 * [
 *   { "action": "talk", "text": "Hello!", "voice_name": "Amy", "language": "en-IN" },
 *   { "action": "input", "type": ["speech"], "eventUrl": ["https://..."] }
 * ]
 */
function buildVoiceResponse({
  text,
  language = "en-IN",
  voiceName = "Amy",
  inputUrl = null,
}) {
  const ncco = [
    {
      action: "talk",
      text,
      voice_name: voiceName,
      language,
    },
  ];

  if (inputUrl) {
    ncco.push({
      action: "input",
      type: ["speech"],
      eventUrl: [inputUrl],
      speech: {
        endOnSilence: 3,
        language,
      },
    });
  } else {
    ncco.push({ action: "talk", text: "Thank you for your time. Goodbye!" });
  }

  return ncco;
}

// ── Voice / language maps ──────────────────────────────────────────────────
// NCCO voice names (compatible voices available on the portal)
const VOICE_MAP = {
  alloy: "Amy", // Neutral female
  echo: "Brian", // Male
  fable: "Brian", // British male
  onyx: "Raveena", // Deep Indian male
  nova: "Aditi", // Indian female
  shimmer: "Aditi", // Soft Indian female
};

const LANGUAGE_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
};

function getVoiceName(voice) {
  return VOICE_MAP[voice] || "Amy";
}
function getLanguage(lang) {
  return LANGUAGE_MAP[lang] || "en-IN";
}

module.exports = {
  makeOutboundCall,
  hangupCall,
  buildVoiceResponse,
  getVoiceName,
  getLanguage,
  isSimulation,
};
