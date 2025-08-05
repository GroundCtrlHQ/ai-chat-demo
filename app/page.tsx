'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="fill-current">
      <path d="M16 1H6a2 2 0 0 0-2 2v3h2V3h10V1z" />
      <path d="M18 5H8a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 15H8V7h10v13Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="fill-current">
      <path d="M20.285 2.859 9 14.143l-5.285-5.285L2 10.572 9 17.572 21.999 4.572z" />
    </svg>
  );
}

function CopyButton({ parts }: { parts: Array<{ type?: string; text?: string }> }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = parts
      .map((p: { type?: string; text?: string }) => (p?.type === 'text' ? p.text : ''))
      .join('\n')
      .trim();
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      aria-label="Copy message"
      title={copied ? 'Copied!' : 'Copy'}
      onClick={onCopy}
      className={
        'inline-flex items-center justify-center h-7 w-7 rounded-md border transition-colors ' +
        (copied
          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
          : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300')
      }
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [limitInfo, setLimitInfo] = useState<{ limit: number; used: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    onError: (e) => console.error(e),
    onFinish: () => {
      // could refresh limit info if server sends it back in headers later
    },
  });

  // Monkey patch fetch used by useChat to capture 429 globally for this page.
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await originalFetch(input, init);
    // Only inspect our chat endpoint responses
    try {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/chat') && res.status === 429) {
        const data = await res.clone().json().catch(() => null);
        if (data && typeof data.limit === 'number') {
          setLimitInfo({ limit: data.limit ?? 15, used: data.used ?? 15 });
        } else {
          setLimitInfo({ limit: 15, used: 15 });
        }
      }
    } catch {
      // ignore
    }
    return res;
  };

  function handleClear() {
    setMessages([]);
    setLimitInfo(null);
    // Soft clear; session server-side remains so counts persist by design.
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative text-zinc-100">
      {/* Diagonal Grid with Light (dark-mode tuned) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 20px)
          `,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-10 pb-32">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Rorie Marketing Expert</h1>
              <p className="text-sm text-zinc-400">Powered by OpenRouter via Vercel AI SDK</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20 px-3 py-1.5 text-xs border border-white/10"
                title="Clear local chat view (server session persists)"
              >
                Clear
              </button>
              <div
                className="text-[11px] text-zinc-400 bg-white/5 border border-white/10 rounded-md px-2 py-1"
                title="Limit: 15 messages per session. This is a free demo."
                aria-label="Info: Limit 15 messages per session"
              >
                (i) Limit: 15 / session
              </div>
            </div>
          </div>
          {limitInfo && (
            <div className="mt-3 text-[13px] text-amber-300">
              You’ve reached the free demo limit ({limitInfo.used}/{limitInfo.limit}). Book a meeting to continue:{' '}
              <a className="underline text-amber-200 hover:text-amber-100" href="https://groundctrl.space/book-a-meeting" target="_blank" rel="noreferrer">
                https://groundctrl.space/book-a-meeting
              </a>
            </div>
          )}
        </header>

        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className="flex">
              <div
                className={
                  'backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/3 rounded-2xl p-4 ring-1 ring-white/10 shadow-[0_0_1px_0_rgba(255,255,255,0.2)] ' +
                  (m.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]')
                }
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">
                    {m.role === 'user' ? 'You' : 'Rorie'}
                  </div>
                </div>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <p
                        key={`${m.id}-${i}`}
                        className="leading-relaxed text-zinc-100 whitespace-pre-wrap"
                      >
                        {part.text}
                      </p>
                    );
                  }
                  return null;
                })}
                <div className="mt-2 flex justify-end">
                  <CopyButton parts={m.parts} />
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.trim()) return;
          if (limitInfo) {
            // prevent sending when limited
            return;
          }
          sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
          setInput('');
        }}
        className="fixed inset-x-0 bottom-0 z-10"
      >
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-6">
          <div className="backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/3 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 p-2">
              <input
                className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-500 px-3 py-3"
                value={input}
                placeholder={
                  limitInfo
                    ? 'Limit reached. Book a meeting to continue.'
                    : status === 'streaming'
                      ? 'Generating…'
                      : 'Type a message…'
                }
                onChange={e => setInput(e.target.value)}
                disabled={!!limitInfo}
              />
              <button
                type="submit"
                disabled={status === 'streaming' || !!limitInfo}
                className="mx-2 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 px-4 py-2 text-sm text-white transition-colors border border-white/10 disabled:opacity-50"
                title={limitInfo ? 'Message limit reached' : 'Send message'}
              >
                Send
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Free demo with limit of 15 messages per session. When reached, please{' '}
            <a className="underline text-zinc-300" href="https://groundctrl.space/book-a-meeting" target="_blank" rel="noreferrer">
              book a meeting
            </a>.
          </p>
        </div>
      </form>
    </div>
  );
}
