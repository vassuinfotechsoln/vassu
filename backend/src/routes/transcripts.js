const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get transcripts for a call
router.get('/call/:callId', async (req, res) => {
  try {
    const transcripts = await prisma.transcript.findMany({
      where: { callId: req.params.callId },
      orderBy: { timestamp: 'asc' }
    });
    res.json(transcripts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save transcript
router.post('/', async (req, res) => {
  try {
    const { callId, speaker, text } = req.body;

    const transcript = await prisma.transcript.create({
      data: {
        callId,
        speaker,
        text
      }
    });

    res.status(201).json(transcript);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;