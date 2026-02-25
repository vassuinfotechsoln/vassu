const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

// Get settings
router.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8");
    const settings = JSON.parse(data);

    // Mask sensitive data if needed, but for this editing UI we need to return them
    // or return a flag saying they are set.
    // For now, return as is so the UI acts as a persistence view.
    // In production, we shouldn't send secrets back to client.
    // Only mask if requested or for specific read-only views.
    res.json(settings);
  } catch (error) {
    console.error("Error reading settings:", error);
    // If file doesn't exist, return default/empty
    res.json({});
  }
});

// Update settings
router.post("/", async (req, res) => {
  try {
    const newSettings = req.body;

    // Validate or merge? Merge is safer.
    let currentSettings = {};
    try {
      const currentData = await fs.readFile(SETTINGS_FILE, "utf8");
      currentSettings = JSON.parse(currentData);
    } catch (e) {
      // Ignore error if file doesn't exist
    }

    const updatedSettings = { ...currentSettings, ...newSettings };

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));

    res.json(updatedSettings);
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

// Validate API keys
router.get("/validate", async (req, res) => {
  const results = {
    groq: false,
    elevenlabs: false,
    assemblyai: false
  };

  try {
    // Check Groq
    if (process.env.GROQ_API_KEY) {
      const Groq = require("groq-sdk");
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      await groq.chat.completions.create({
        messages: [{ role: "user", content: "hi" }],
        model: "llama-3.1-8b-instant",
        max_tokens: 1
      });
      results.groq = true;
    }

    // Check ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      const response = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY }
      });
      results.elevenlabs = response.ok;
    }

    // Check AssemblyAI
    if (process.env.ASSEMBLYAI_API_KEY) {
      const response = await fetch("https://api.assemblyai.com/v2/user/free-tier", {
        headers: { "authorization": process.env.ASSEMBLYAI_API_KEY }
      });
      results.assemblyai = response.ok;
    }

    res.json(results);
  } catch (error) {
    console.error("Validation error:", error);
    res.json(results);
  }
});

module.exports = router;
