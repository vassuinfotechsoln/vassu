# Deployment Guide

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- Twilio Account
- OpenAI API Key

### Setup

```bash
# Clone repository
git clone <repo-url>
cd omniclone

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure environment variables
npx prisma db push
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

## Docker Deployment

### Using Docker Compose

```bash
# Create .env file with your credentials
cp .env.example .env

# Start all services
docker-compose up -d

# Sync database schema
docker-compose exec backend npx prisma db push
```

## Cloud Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Create MongoDB database addon
3. Set environment variables:
   - `DATABASE_URL` (from Railway MongoDB)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `OPENAI_API_KEY`
4. Deploy backend and frontend as separate services

### Vercel (Frontend only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_WS_URL
```

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Configure environment variables

## Environment Variables

### Backend (.env)

```
DATABASE_URL=mongodb://localhost:27017/vassutalks
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
OPENAI_API_KEY=sk-your-openai-key
PORT=3001
WS_PORT=3002
BASE_URL=https://your-domain.com
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
```

## Production Checklist

- [ ] Database schema synced
- [ ] Environment variables configured
- [ ] Twilio webhook URLs updated
- [ ] SSL certificates configured
- [ ] CORS settings updated
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy implemented

## Scaling Considerations

### Database

- Use connection pooling
- Implement read replicas for heavy read workloads
- Consider database sharding for large scale

### Backend

- Use Redis for session management
- Implement horizontal scaling with load balancer
- Use message queues for async processing

### WebSocket

- Use sticky sessions or Redis adapter
- Consider WebSocket clustering

### Monitoring

- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Database performance monitoring
