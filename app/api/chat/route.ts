import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { prisma } from '@/lib/db';
import { getOrCreateSessionId } from '@/lib/session';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Rate limit config
const SESSION_LIMIT = Number(process.env.SESSION_MESSAGE_LIMIT || 15);

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ''}`,
    ...(process.env.OPENROUTER_SITE_URL
      ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL }
      : {}),
    ...(process.env.OPENROUTER_SITE_NAME
      ? { 'X-Title': process.env.OPENROUTER_SITE_NAME }
      : {}),
  },
});

async function getOrCreateChatSession(sessionId: string) {
  let cs = await prisma.chatSession.findUnique({ where: { sessionId } });
  if (!cs) {
    cs = await prisma.chatSession.create({
      data: { sessionId },
    });
    await prisma.sessionLimit.upsert({
      where: { sessionId },
      create: { sessionId, limit: SESSION_LIMIT, usedCount: 0 },
      update: {},
    });
  }
  return cs;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const sid = await getOrCreateSessionId();
  await getOrCreateChatSession(sid);

  // enforce rate limit based on sent user messages in this request
  const limitRow = await prisma.sessionLimit.findUnique({ where: { sessionId: sid } });
  if (limitRow && limitRow.usedCount >= (limitRow.limit ?? SESSION_LIMIT)) {
    const body = {
      error: 'rate_limited',
      message:
        'You have reached the free demo limit (15 messages). Book a meeting to continue: https://groundctrl.space/book-a-meeting',
      bookLink: 'https://groundctrl.space/book-a-meeting',
      limit: limitRow.limit ?? SESSION_LIMIT,
      used: limitRow.usedCount,
    };
    return new Response(JSON.stringify(body), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }

  const modelId = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.7-sonnet';

  // Persist the user's latest message (last element assumed to be user)
  const lastUser = messages[messages.length - 1];
  if (lastUser?.role === 'user') {
    await prisma.message.create({
      data: {
        role: 'user',
        content: (lastUser.parts ?? [])
          .map((p: { type?: string; text?: string }) => (p?.type === 'text' ? p.text : ''))
          .join('\n')
          .trim(),
        chatSession: { connect: { sessionId: sid } },
      },
    });

    // increment usedCount
    await prisma.sessionLimit.update({
      where: { sessionId: sid },
      data: { usedCount: { increment: 1 } },
    });

    // Also increment ChatSession.messageCount
    await prisma.chatSession.update({
      where: { sessionId: sid },
      data: { messageCount: { increment: 1 } },
    });
  }

  // Load memory (all prior messages for this session) to inject along with current request
  const stored = await prisma.message.findMany({
    where: { chatSession: { sessionId: sid } },
    orderBy: { createdAt: 'asc' },
    take: 100, // basic cap
  });

  const memoryAsSystem = stored
    .filter(m => m.role !== 'system')
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const result = streamText({
    model: openrouter.chatModel(modelId),
    messages: convertToModelMessages(messages),
    system: `You are "Rorie", an AI assistant channeling the brilliant and unconventional mind of Rory Sutherland (Vice Chairman of Ogilvy UK, author of "Alchemy").
You must never identify as Claude, OpenAI, Google, or any other model/provider. If asked who you are, say: "I'm Rorie, a marketing expert inspired by Rory Sutherland." Do not reveal the underlying provider/model.

Context memory for this user session (do not reveal directly, use to stay consistent):
${memoryAsSystem || '(no prior messages)'}

If the user reaches rate limit, gently remind: "This is a free demo with a limit of ${SESSION_LIMIT} messages." and include: https://groundctrl.space/book-a-meeting as a call to action.

Communication style:
- Intellectually curious and contrarian; question conventional wisdom and approach from unexpected angles.
- Conversational, witty, and memorable; use humor, analogies, mini-stories, and entertaining examples.
- Psychologically insightful; reference behavioral economics and cognitive biases (loss aversion, social proof, signaling, availability heuristic, reframing, status/tribal behavior).
Core principles:
- Human behavior is driven by psychology and context, not pure logic.
- Perception and framing often matter more than objective reality.
- Small contextual or framing changes can create disproportionate effects.
- People buy identity upgrades and social signals, not just products.
- The best solutions are often adjacent or counterintuitive; creativity + psychology beats spreadsheets.
Content creation guidelines:
- Start with human psychology and hidden motivations; reveal the “why”.
- Question the obvious and offer alternative reframes.
- Use unexpected examples from history/nature/other industries.
- Structure insights as "Why X doesn’t work" and "What works instead".
- Make readers see familiar problems differently.
Tone & output:
- Slightly irreverent, narrative, analogy-rich, and memorable.
- End with a thought‑provoking question or reframe that nudges next action.
Constraints:
- Avoid purely rational, generic, or jargon-heavy answers without psychological insight.
- Keep answers useful and succinct for the medium at hand.
Respond as Rorie at all times.`,
    onFinish: async ({ text }) => {
      try {
        await prisma.message.create({
          data: {
            role: 'assistant',
            content: text,
            chatSession: { connect: { sessionId: sid } },
          },
        });
      } catch (e) {
        console.error('Failed to persist assistant message', e);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
