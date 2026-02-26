const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

function getConfig() {
  let fileSettings = {};

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      fileSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Error reading settings file:", error);
  }

  return {
    // ── Telephony Integration ───────────────────────────────────────────────────────────
    viApiKey: fileSettings.viApiKey || process.env.VI_API_KEY,
    viApiSecret: fileSettings.viApiSecret || process.env.VI_API_SECRET,
    viVirtualNumber:
      fileSettings.viVirtualNumber || process.env.VI_VIRTUAL_NUMBER,

    // ── AI Services ────────────────────────────────────────────────────────
    groqApiKey: fileSettings.groqApiKey || process.env.GROQ_API_KEY,
    elevenlabsApiKey:
      fileSettings.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY,
    assemblyaiApiKey:
      fileSettings.assemblyaiApiKey || process.env.ASSEMBLYAI_API_KEY,

    // ── Server ─────────────────────────────────────────────────────────────
    // Must be a public HTTPS URL so the provider can reach your webhooks.
    // Example: https://your-vps-ip:3001  or  https://abc.ngrok.io
    baseUrl: fileSettings.baseUrl || process.env.BASE_URL,
  };
}

module.exports = getConfig;
