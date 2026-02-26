const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Get all agents
router.get("/", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: { calls: true },
        },
      },
    });
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent by ID
router.get("/:id", async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { calls: true },
        },
      },
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new agent
router.post("/", async (req, res) => {
  try {
    const { name, prompt, voice, language, temperature } = req.body;

    if (!name || !prompt) {
      return res.status(400).json({ error: "Name and prompt are required" });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        prompt,
        voice: voice || "alloy",
        language: language || "en",
        temperature: parseFloat(temperature) || 0.7,
        knowledgeUrl: req.body.knowledgeUrl || null,
        knowledgeText: req.body.knowledgeText || null,
      },
    });

    res.status(201).json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update agent
router.put("/:id", async (req, res) => {
  try {
    const { name, prompt, voice, language, temperature } = req.body;

    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: {
        name,
        prompt,
        voice,
        language,
        temperature: parseFloat(temperature),
        knowledgeUrl: req.body.knowledgeUrl,
        knowledgeText: req.body.knowledgeText,
      },
    });

    res.json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete agent
router.delete("/:id", async (req, res) => {
  try {
    await prisma.agent.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
