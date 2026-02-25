const RealtimeService = require('../../src/services/RealtimeService');

// Mock dependencies
jest.mock('groq-sdk');
jest.mock('@elevenlabs/elevenlabs-js');
jest.mock('assemblyai');
jest.mock('@prisma/client');

describe('RealtimeService', () => {
  let realtimeService;
  let mockWs;

  beforeEach(() => {
    realtimeService = new RealtimeService();
    mockWs = {
      send: jest.fn()
    };
  });

  describe('handleMessage', () => {
    it('should handle start_call message', async () => {
      const mockData = {
        type: 'start_call',
        payload: {
          agentId: 'test-agent-id',
          phoneNumber: '+1234567890',
          direction: 'OUTBOUND'
        }
      };

      // Mock Prisma agent.findUnique
      realtimeService.prisma.agent.findUnique = jest.fn().mockResolvedValue({
        id: 'test-agent-id',
        name: 'Test Agent',
        prompt: 'Test prompt'
      });

      // Mock Prisma call.create
      realtimeService.prisma.call.create = jest.fn().mockResolvedValue({
        id: 'test-call-id',
        agentId: 'test-agent-id',
        phoneNumber: '+1234567890',
        direction: 'OUTBOUND'
      });

      await realtimeService.handleMessage(mockWs, mockData);

      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'call_started',
          payload: expect.objectContaining({
            callId: 'test-call-id'
          })
        })
      );
    });

    it('should handle audio_chunk message', async () => {
      // Setup active call
      realtimeService.activeCalls.set(mockWs, {
        callId: 'test-call-id',
        agent: { voice: 'alloy', prompt: 'Test prompt', temperature: 0.7 },
        conversation: []
      });

      // Mock STT
      realtimeService.speechToText = jest.fn().mockResolvedValue('Hello, how are you?');

      // Mock LLM
      realtimeService.generateResponse = jest.fn().mockResolvedValue('I am doing well, thank you!');

      // Mock TTS
      realtimeService.textToSpeech = jest.fn().mockResolvedValue('base64audiodata');

      // Mock transcript save
      realtimeService.saveTranscript = jest.fn().mockResolvedValue();

      const mockData = {
        type: 'audio_chunk',
        payload: {
          audioData: 'base64audiodata'
        }
      };

      await realtimeService.handleMessage(mockWs, mockData);

      expect(realtimeService.speechToText).toHaveBeenCalledWith('base64audiodata');
      expect(realtimeService.generateResponse).toHaveBeenCalled();
      expect(realtimeService.textToSpeech).toHaveBeenCalled();
      expect(mockWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'response',
          payload: expect.objectContaining({
            transcript: 'Hello, how are you?',
            response: 'I am doing well, thank you!',
            audio: 'base64audiodata'
          })
        })
      );
    });
  });

  describe('speechToText', () => {
    it('should convert audio to text using AssemblyAI', async () => {
      // Mock AssemblyAI transcription
      realtimeService.assemblyai.transcripts.transcribe = jest.fn().mockResolvedValue({
        text: 'Hello world'
      });

      const result = await realtimeService.speechToText('base64audiodata');

      expect(result).toBe('Hello world');
      expect(realtimeService.assemblyai.transcripts.transcribe).toHaveBeenCalledWith({
        audio: expect.any(Buffer),
        language_code: 'hi'
      });
    });
  });

  describe('generateResponse', () => {
    it('should generate AI response using Groq', async () => {
      const mockAgent = {
        prompt: 'You are a helpful assistant',
        temperature: 0.7
      };

      // Mock Groq chat completion
      realtimeService.groq.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'Hello! How can I help you today?'
          }
        }]
      });

      const result = await realtimeService.generateResponse(
        mockAgent,
        'Hello',
        []
      );

      expect(result).toBe('Hello! How can I help you today?');
      expect(realtimeService.groq.chat.completions.create).toHaveBeenCalledWith({
        model: 'llama3-8b-8192',
        messages: expect.arrayContaining([
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' }
        ]),
        temperature: 0.7,
        max_tokens: 150
      });
    });
  });

  describe('textToSpeech', () => {
    it('should convert text to speech using ElevenLabs TTS', async () => {
      const mockBuffer = Buffer.from('audio data');

      // Mock ElevenLabs TTS
      realtimeService.elevenlabs.textToSpeech = jest.fn().mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield mockBuffer;
        }
      });

      const result = await realtimeService.textToSpeech('Hello world', 'Rachel');

      expect(result).toBe(mockBuffer.toString('base64'));
      expect(realtimeService.elevenlabs.textToSpeech).toHaveBeenCalledWith({
        voice_id: 'Rachel',
        text: 'Hello world',
        model_id: 'eleven_multilingual_v2'
      });
    });
  });
});