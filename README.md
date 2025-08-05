# GroundCtrl AI Chat – “Rorie” Marketing Expert

A production-ready Next.js AI chat experience featuring “Rorie”, an assistant inspired by Rory Sutherland’s contrarian marketing mindset. It uses the Vercel AI SDK with OpenRouter for responses, and Neon (Postgres) via Prisma for per-session memory and rate limiting.

Live UX highlights:
- Dark-mode UI with subtle diagonal grid background
- Real-time streaming responses
- Copy-to-clipboard per message (bottom-right)
- Clear button to reset local view
- Free demo limit with CTA to book a meeting

Useful links:
- GroundCtrl site: https://groundctrl.space/
- Book a meeting: https://groundctrl.space/book-a-meeting

## What this project does

- AI chat with strong “Rorie” persona and prompt guardrails
- Session-based memory:
  - Anonymous cookie session (gc_session_id) identifies the browser session
  - User and assistant messages are stored in Neon (Postgres) for that session
  - On each turn, recent history is included to give the model continuity
- Simple rate limiting:
  - 15 user messages per session by default
  - On limit, API returns 429 and UI surfaces a CTA linking to “Book a meeting”
- Developer visibility:
  - Prisma Studio exposed locally to inspect ChatSession, Message, and SessionLimit tables

## Tech stack

- Framework: Next.js 15 (App Router, TypeScript)
- AI: Vercel AI SDK with OpenRouter provider
- DB: Neon Postgres + Prisma ORM
- UI: Tailwind CSS
- Dev: Turbopack, ESLint

## Repository structure

```
ai-chat/
├─ app/
│  ├─ api/chat/route.ts   # Chat API: sessions, memory, rate limit, streaming
│  ├─ layout.tsx          # Root layout
│  ├─ page.tsx            # Chat UI (dark-mode grid, copy button, limit notice)
│  └─ globals.css         # Global styles
├─ lib/
│  ├─ db.ts               # Prisma client singleton
│  └─ session.ts          # Cookie-based session id
├─ prisma/
│  ├─ schema.prisma       # ChatSession, Message, SessionLimit
│  └─ migrations/         # Applied migrations
└─ src/generated/prisma/  # Prisma client output
```

## Environment configuration

Create `.env` (or `.env.local`) with:

```env
# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
# Optional identification
# OPENROUTER_SITE_URL=
# OPENROUTER_SITE_NAME=

# Neon
DATABASE_URL=postgres://<user>:<pass>@<host>/<db>?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://<user>:<pass>@<host>/<db>?sslmode=require

# Demo session limit (default 15 if unset)
SESSION_MESSAGE_LIMIT=15
```

Note: In this repository we also generate a Prisma client to `src/generated/prisma` (configured in `prisma/schema.prisma`).

## Local development

1) Install dependencies
```bash
pnpm install
```

2) Generate Prisma client and apply migrations
```bash
pnpm approve-builds @prisma/client @prisma/engines prisma   # approve postinstall for prisma if prompted
pnpm prisma generate
pnpm prisma migrate dev --name init_chat_sessions
```

3) Run dev server and Prisma Studio
```bash
SESSION_MESSAGE_LIMIT=15 pnpm dev
pnpm prisma studio -- --port 5555
```
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555

## Using this project (for others)

- Fork/clone the repository
- Create your `.env` with OpenRouter and Neon credentials
- Run the steps above to migrate and start
- Optionally tweak:
  - Rate limit: set `SESSION_MESSAGE_LIMIT`
  - Context window: in `app/api/chat/route.ts`, adjust how many past messages are loaded
  - Persona & prompt: edit the `system` text in the same API route

## Production notes

- Deploy on Vercel and configure environment variables in the dashboard
- Neon is serverless; ensure the `DATABASE_URL` uses SSL and (optionally) the pooler endpoint for scale
- For longer conversations, consider:
  - Summarization of older turns
  - Increasing message load cap
  - Authentication to give higher limits to trusted users

## Credits and contact

- Built by GroundCtrl. Learn more: https://groundctrl.space/
- Book a meeting: https://groundctrl.space/book-a-meeting

MIT License.
