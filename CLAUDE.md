# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
pnpm install                              # Install dependencies
pnpm dev                                  # Start dev server with Turbopack
pnpm build                                # Build for production
pnpm start                                # Start production server
pnpm lint                                 # Run ESLint
```

### Database (Prisma)
```bash
pnpm prisma generate                      # Generate Prisma client
pnpm prisma migrate dev --name <name>     # Create and apply migration
pnpm prisma studio -- --port 5555        # Open Prisma Studio at localhost:5555
pnpm prisma db push                       # Push schema changes to database
```

### Environment Setup
- Copy `env.example` to `.env` and configure:
  - `OPENROUTER_API_KEY`: OpenRouter API key
  - `DATABASE_URL`: Neon Postgres connection string
  - `SESSION_MESSAGE_LIMIT`: Rate limit (default 15)

## Architecture

### Core Components
- **Next.js 15 App Router**: Modern React framework with TypeScript
- **AI Integration**: Vercel AI SDK with OpenRouter provider for streaming chat
- **Database**: Neon Postgres with Prisma ORM
- **Session Management**: Cookie-based anonymous sessions for memory and rate limiting

### Key Files
- `app/api/chat/route.ts`: Main chat API with session handling, memory loading, and rate limiting
- `app/page.tsx`: Chat UI with dark theme, real-time streaming, and copy functionality
- `lib/session.ts`: Cookie-based session ID management (`gc_session_id`)
- `lib/db.ts`: Prisma client singleton
- `prisma/schema.prisma`: Database schema with ChatSession, Message, and SessionLimit models

### Data Flow
1. Anonymous sessions identified by `gc_session_id` cookie (30-day expiry)
2. Each user message increments rate limit counter (`SessionLimit` table)
3. All messages stored in `Message` table linked to `ChatSession`
4. Recent message history loaded for context on each API call (100 message cap)
5. AI responses streamed back and persisted after completion

### AI Persona
The system implements "Rorie", an AI assistant inspired by Rory Sutherland's marketing mindset:
- Contrarian and psychologically insightful
- Focus on behavioral economics and cognitive biases
- Question conventional wisdom with unexpected angles
- Use humor, analogies, and memorable examples
- Never reveal underlying AI provider/model

### Rate Limiting
- 15 messages per session by default (configurable via `SESSION_MESSAGE_LIMIT`)
- Returns 429 status with booking CTA when limit reached
- UI shows limit info and prevents further input when reached

### Database Schema
- `ChatSession`: Session container with message count
- `Message`: Individual messages with role (user/assistant/system) and content
- `SessionLimit`: Per-session rate limiting with usage tracking

### Generated Code
- Prisma client outputs to `src/generated/prisma` (custom location)
- This ensures generated types are available for import across the app