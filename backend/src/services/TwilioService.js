const twilio = require("twilio");
const WebSocket = require("ws");
const getConfig = require("../utils/config");

class TwilioService {
  constructor() {
    const config = getConfig();
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken);
    this.activeStreams = new Map();
    this.config = config;
  }

  async initiateCall(phoneNumber, agentId) {
    try {
      const call = await this.client.calls.create({
        to: phoneNumber,
        from: this.config.twilioPhoneNumber,
        url: `${process.env.BASE_URL}/api/calls/webhook/outbound/${agentId}`,
        method: "POST",
      });

      return call;
    } catch (error) {
      console.error("Twilio call error:", error);
      throw error;
    }
  }

  handleMediaStream(ws, callId) {
    console.log(`Media stream connected for call: ${callId}`);

    this.activeStreams.set(callId, ws);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.event) {
          case "connected":
            console.log("Media stream connected");
            break;
          case "start":
            console.log("Media stream started");
            break;
          case "media":
            this.processAudioData(callId, data.media);
            break;
          case "stop":
            console.log("Media stream stopped");
            this.activeStreams.delete(callId);
            break;
        }
      } catch (error) {
        console.error("Media stream message error:", error);
      }
    });

    ws.on("close", () => {
      console.log(`Media stream closed for call: ${callId}`);
      this.activeStreams.delete(callId);
    });
  }

  processAudioData(callId, mediaData) {
    // Process incoming audio data
    const audioPayload = Buffer.from(mediaData.payload, "base64");

    // Send to real-time processing pipeline
    // This would integrate with your RealtimeService
    console.log(
      `Processing audio for call: ${callId}, size: ${audioPayload.length}`
    );
  }

  sendAudioToCall(callId, audioData) {
    const ws = this.activeStreams.get(callId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const mediaMessage = {
        event: "media",
        streamSid: callId,
        media: {
          payload: audioData,
        },
      };

      ws.send(JSON.stringify(mediaMessage));
    }
  }

  generateTwiML(message, streamUrl) {
    const twiml = new twilio.twiml.VoiceResponse();

    if (streamUrl) {
      twiml.start().stream({
        url: streamUrl,
        track: "both_tracks",
      });
    }

    twiml.say({ voice: "alice" }, message);

    return twiml.toString();
  }
}

module.exports = TwilioService;
