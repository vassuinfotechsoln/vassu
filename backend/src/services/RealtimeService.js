const Groq = require("groq-sdk");
const { PrismaClient } = require("@prisma/client");
const getConfig = require("../utils/config");

class RealtimeService {
  constructor() {
    const config = getConfig();
    try {
      if (config.groqApiKey) {
        this.groq = new Groq({ apiKey: config.groqApiKey });
      } else {
        console.warn("⚠️  GROQ_API_KEY not set. LLM pipeline disabled.");
        this.groq = null;
      }
    } catch (e) {
      console.error("Groq init error:", e.message);
      this.groq = null;
    }
    this.prisma = new PrismaClient();
    this.activeCalls = new Map();
  }

  async handleMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case "start_call":
        await this.startCall(ws, payload);
        break;
      case "audio_chunk":
        await this.processAudio(ws, payload);
        break;
      case "end_call":
        await this.endCall(ws, payload);
        break;
      default:
        ws.send(JSON.stringify({ error: "Unknown message type" }));
    }
  }

  async startCall(ws, { agentId, phoneNumber, direction }) {
    try {
      // Find agent in database
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new Error("Agent not found");
      }

      // Create call in database
      const call = await this.prisma.call.create({
        data: {
          agentId,
          phoneNumber: phoneNumber || "Unknown",
          direction: direction || "INBOUND",
          status: "INITIATED",
        },
      });

      this.activeCalls.set(ws, {
        callId: call.id,
        agent,
        audioBuffer: [],
        conversation: [],
      });

      ws.send(
        JSON.stringify({
          type: "call_started",
          payload: { callId: call.id, agent },
        })
      );
    } catch (error) {
      console.error("Start call error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: error.message },
        })
      );
    }
  }

  async processAudio(ws, { audioData }) {
    const callData = this.activeCalls.get(ws);
    if (!callData) return;

    try {
      // Convert audio to text using Whisper (Mocked for now as per current logic)
      const transcript = await this.speechToText(audioData);

      if (transcript && transcript.trim()) {
        // Save user transcript to database
        await this.saveTranscript(callData.callId, "user", transcript);

        // Get AI response
        const response = await this.generateResponse(
          callData.agent,
          transcript,
          callData.conversation
        );

        // Save AI transcript to database
        await this.saveTranscript(callData.callId, "assistant", response);

        // Convert response to speech
        const audioResponse = await this.textToSpeech(
          response,
          callData.agent.voice
        );

        // Update conversation history
        callData.conversation.push(
          { role: "user", content: transcript },
          { role: "assistant", content: response }
        );

        ws.send(
          JSON.stringify({
            type: "response",
            payload: {
              transcript,
              response,
              audio: audioResponse,
            },
          })
        );
      }
    } catch (error) {
      console.error("Audio processing error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Audio processing failed" },
        })
      );
    }
  }

  async speechToText(audioData) {
    try {
      // In a real scenario with Twilio/VI, audioData is often a base64 string or buffer
      // For real-time, streaming STT (like AssemblyAI) is better.
      // For this implementation, we'll use Groq's Whisper if it's a complete chunk, 
      // or keep it ready for AssemblyAI streaming.

      if (!this.groq) return "Hello";

      // Mocking the transcription logic for now but using real Groq for LLM
      // If we have a Buffer, we can send it to Groq Whisper
      console.log("Processing audio data for STT...");

      // For now, let's keep the mock returning something if audioData is just a placeholder
      // In a real stream, we'd pipe this to AssemblyAI
      return "Hello, how are you?";
    } catch (error) {
      console.error("STT error:", error);
      return "";
    }
  }

  async generateResponse(agent, userMessage, conversation) {
    try {
      // Professional Indian-context prompting
      const languageMap = {
        'hi': 'Hindi',
        'gu': 'Gujarati',
        'ta': 'Tamil',
        'te': 'Telugu',
        'mr': 'Marathi',
        'en': 'English'
      };

      const targetLanguage = languageMap[agent.language] || 'English';

      let systemPrompt = `${agent.prompt}. 
      - You are a helpful AI voice assistant name VassuTalks.
      - Keep responses strictly under 20 words for a smooth phone conversation.
      - Primary Language: ${targetLanguage}.
      - Use simple, conversational language. Avoid jargon.
      - If the user speaks in ${targetLanguage}, respond in ${targetLanguage}.
      - If they speak in a mix, respond naturally in a mix (Hinglish/Gujlish).`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversation.slice(-8), // Increased context slightly
        { role: "user", content: userMessage },
      ];

      const response = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // Active Groq model (llama3-8b-8192 is decommissioned)
        messages,
        temperature: agent.temperature || 0.6,
        max_tokens: 100,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Groq LLM error:", error);
      // Fallback response in English (or agent language)
      return "I'm sorry, I couldn't process that. Could you please say it again?";
    }
  }

  async textToSpeech(text, voiceId = "Rachel") {
    if (!text || text.trim() === "") return null;

    try {
      if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === "") {
        console.warn("ElevenLabs API Key missing or empty");
        return null;
      }

      // Voice ID mapping for ElevenLabs (these are common ones)
      const voiceMap = {
        "Rachel": "21m00Tcm4TlvDq8ikWAM",
        "Drew": "29vD33N1HAbCD867S3dN",
        "Clyde": "2EiwWnXFnvU5JabPnv8n",
        "Paul": "5Q0t7uMcjWpABMm35B6L",
        "Domi": "AZnzlk1XhxPqc80fgpNo",
        "Dave": "CYw3kZ02Hs0563khs1Fj"
      };

      const selectedVoice = voiceMap[voiceId] || voiceId;

      console.log(`ElevenLabs TTS: Generating audio for: "${text.substring(0, 30)}..."`);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2", // Multilingual v2 is much better for Indian languages
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.06,
              use_speaker_boost: true
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ElevenLabs Error: ${JSON.stringify(errorData)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64");
    } catch (error) {
      console.error("TTS Pipeline Failure:", error);
      return null;
    }
  }

  async saveTranscript(callId, speaker, text) {
    try {
      await this.prisma.transcript.create({
        data: {
          callId,
          speaker,
          text,
        },
      });
    } catch (error) {
      console.error("Transcript save error:", error);
    }
  }

  async endCall(ws, { callId }) {
    try {
      // Update database call status
      await this.prisma.call.update({
        where: { id: callId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
        },
      });

      this.activeCalls.delete(ws);

      ws.send(
        JSON.stringify({
          type: "call_ended",
          payload: { callId },
        })
      );
    } catch (error) {
      console.error("End call error:", error);
    }
  }

  cleanup(ws) {
    this.activeCalls.delete(ws);
  }
}

module.exports = RealtimeService;
