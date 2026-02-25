const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

function getConfig() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf8");
      const settings = JSON.parse(data);
      return {
        twilioAccountSid:
          settings.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken:
          settings.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN,
        twilioPhoneNumber:
          settings.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER,
        groqApiKey: settings.groqApiKey || process.env.GROQ_API_KEY,
        elevenlabsApiKey:
          settings.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY,
        assemblyaiApiKey:
          settings.assemblyaiApiKey || process.env.ASSEMBLYAI_API_KEY,
        baseUrl: settings.baseUrl || process.env.BASE_URL, // Assuming baseUrl might be added later or fallback
      };
    }
  } catch (error) {
    console.error("Error reading settings file:", error);
  }

  return {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    groqApiKey: process.env.GROQ_API_KEY,
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    assemblyaiApiKey: process.env.ASSEMBLYAI_API_KEY,
    baseUrl: process.env.BASE_URL,
  };
}

module.exports = getConfig;
