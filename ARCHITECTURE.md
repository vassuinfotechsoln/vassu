# OmniClone Architecture

## System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User/Caller   │    │   Dashboard     │    │   Admin Panel   │
│                 │    │   (Next.js)     │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ Phone Call           │ WebSocket            │ HTTP API
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Express   │  │  WebSocket  │  │   Twilio    │            │
│  │   Server    │  │   Server    │  │  Webhooks   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Real-time Pipeline                            │
│                                                                 │
│  Audio Input → STT (Whisper) → LLM (GPT-4) → TTS → Audio Out   │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Whisper   │  │   OpenAI    │  │   OpenAI    │            │
│  │     STT     │  │     LLM     │  │     TTS     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │    Redis    │  │   File      │            │
│  │ (Primary)   │  │  (Cache)    │  │  Storage    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (Next.js)

```
frontend/
├── app/                    # App Router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.js       # Main dashboard
│   │   ├── agents/       # Agent management
│   │   ├── calls/        # Call history
│   │   └── settings/     # Configuration
│   └── layout.js         # Root layout
├── components/            # Reusable components
│   ├── Sidebar.jsx       # Navigation
│   ├── CallLogTable.jsx  # Call history table
│   ├── LiveTranscript.jsx # Real-time transcript
│   ├── CallMonitor.jsx   # Call controls
│   └── AgentEditor.jsx   # Agent configuration
└── lib/                  # Utilities and hooks
```

### Backend (Node.js/Express)

```
backend/
├── src/
│   ├── routes/           # API endpoints
│   │   ├── calls.js     # Call management
│   │   ├── agents.js    # Agent CRUD
│   │   └── transcripts.js # Transcript API
│   ├── services/        # Business logic
│   │   ├── RealtimeService.js # STT→LLM→TTS pipeline
│   │   └── TwilioService.js   # Voice call handling
│   ├── middleware/      # Auth, validation, etc.
│   └── models/         # Data models
├── prisma/             # Database schema
└── tests/              # Unit tests
```

## Data Flow

### Inbound Call Flow

1. **Call Received**: Twilio receives call → webhook to backend
2. **Call Setup**: Create call record → start WebSocket stream
3. **Audio Processing**:
   - Twilio streams audio → WebSocket
   - Audio chunks → Whisper STT
   - Text → OpenAI LLM
   - Response → OpenAI TTS
   - Audio → Twilio stream
4. **Logging**: Save transcripts → PostgreSQL
5. **Dashboard Update**: WebSocket → frontend updates

### Outbound Call Flow

1. **Call Initiation**: Dashboard → API request
2. **Twilio Call**: Backend → Twilio API
3. **Call Connection**: Same as inbound flow from step 2

### Real-time Pipeline (<1s latency)

```
Audio Chunk (20ms) → Buffer → STT → LLM → TTS → Audio Response
     ↓                ↓        ↓      ↓      ↓
   WebSocket      Whisper   GPT-4   TTS-1  WebSocket
```

## Database Schema

### Core Tables

- **agents**: AI agent configurations
- **calls**: Call records and metadata
- **transcripts**: Conversation logs

### Relationships

```sql
agents (1) → (many) calls
calls (1) → (many) transcripts
```

## API Design

### REST Endpoints

- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET/PUT/DELETE /api/agents/:id` - Agent CRUD
- `GET /api/calls` - List calls
- `POST /api/calls/outbound` - Initiate call
- `GET /api/calls/:id` - Call details
- `GET /api/transcripts/call/:id` - Call transcripts

### WebSocket Events

- `start_call` - Begin call session
- `audio_chunk` - Process audio data
- `response` - AI response with audio
- `end_call` - Terminate session

## Security

### Authentication

- API key authentication for Twilio webhooks
- JWT tokens for dashboard access
- Rate limiting on all endpoints

### Data Protection

- Encrypt sensitive data at rest
- TLS for all communications
- Audio data not permanently stored
- GDPR compliance for transcripts

## Performance Optimizations

### Latency Reduction

- WebSocket for real-time communication
- Audio streaming in small chunks (20ms)
- Parallel processing of STT/LLM/TTS
- Connection pooling for database

### Scalability

- Horizontal scaling with load balancer
- Redis for session management
- Database read replicas
- CDN for static assets

## Monitoring & Observability

### Metrics

- Call success rate
- Average response latency
- Concurrent call capacity
- Error rates by component

### Logging

- Structured logging (JSON)
- Call session tracking
- Performance metrics
- Error tracking with stack traces

## Deployment Architecture

### Production Setup

```
Internet → Load Balancer → App Servers → Database
    ↓           ↓              ↓           ↓
  HTTPS      SSL Term      Docker      PostgreSQL
             Rate Limit    Containers   + Redis
```

### High Availability

- Multi-AZ deployment
- Database failover
- Health checks
- Auto-scaling groups

This architecture supports:

- **Scalability**: Handle 1000+ concurrent calls
- **Reliability**: 99.9% uptime SLA
- **Performance**: <1s response latency
- **Security**: Enterprise-grade protection
