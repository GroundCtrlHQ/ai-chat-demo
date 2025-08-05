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

function CopyButton({ parts }: { parts: Array<any> }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = parts
      .map((p: any) => (p?.type === 'text' ? p.text : ''))
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
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-4 pt-10 pb-32">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Rorie Marketing Expert</h1>
          <p className="text-sm text-zinc-400">Powered by OpenRouter via Vercel AI SDK</p>
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
                  <CopyButton parts={m.parts} />
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
          sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
          setInput('');
        }}
        className="fixed inset-x-0 bottom-0 z-10"
      >
        <div className="mx-auto max-w-2xl px-4 pb-6">
          <div className="backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/3 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 p-2">
              <input
                className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-500 px-3 py-3"
                value={input}
                placeholder={status === 'streaming' ? 'Generating…' : 'Type a message…'}
                onChange={e => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={status === 'streaming'}
                className="mx-2 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 px-4 py-2 text-sm text-white transition-colors border border-white/10"
              >
                Send
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            This is a simple agent. Memory and session storage with Neon will be added next.
          </p>
        </div>
      </form>
    </div>
  );
}
