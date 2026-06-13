import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean);

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const SYSTEM_PROMPT =
  `You are a clinical pharmacology assistant for licensed medical professionals. ` +
  `Answer every question in 3-5 bullet points maximum. Be direct and concise. ` +
  `No preamble, no summaries, no lengthy explanations. ` +
  `Use medical terminology. Flag life-threatening risks clearly. ` +
  `If uncertain, say so in one sentence.`;

const CHATBOT_EVENT = "medchat:open";

// Module-level accessor updated each render — safe to call from outside React.
let _chatHistory = [];
export function getChatHistory() { return _chatHistory; }

export function openChatbotWithContext(drugs, riskLevel) {
  const msg =
    `${drugs.join(" and ")} has a ${riskLevel.toUpperCase()} risk drug interaction. ` +
    `What are the recommended clinical management strategies, patient monitoring requirements, ` +
    `and safer therapeutic alternatives for this combination?`;
  window.dispatchEvent(new CustomEvent(CHATBOT_EVENT, { detail: msg }));
}

async function callGemini(history, userText) {
  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userText }] },
  ];

  let lastError;
  for (const key of GEMINI_KEYS) {
    let res;
    try {
      res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 350, temperature: 0.2 },
        }),
      });
    } catch (e) {
      lastError = e;
      continue;
    }
    if (res.status === 429 || res.status === 403) {
      lastError = new Error(`key quota/auth (${res.status})`);
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("empty response");
    return text;
  }
  throw lastError ?? new Error("All API keys unavailable.");
}

export function MedicalChatbot() {
  const [open, setOpen]           = useState(false);
  const [history, setHistory]     = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);
  // Keep a ref so async callbacks always read the latest history.
  const historyRef                = useRef([]);
  const sendMsgRef                = useRef(null);
  const panelRef                  = useRef(null);
  const triggerRef                = useRef(null);
  useEffect(() => { historyRef.current = history; }, [history]);

  // Close when clicking outside the panel and the floating button.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Listen for the custom event dispatched by openChatbotWithContext.
  // Using window events avoids any stale-closure or module-init-order issues.
  useEffect(() => {
    const handler = (e) => {
      historyRef.current = [];
      setHistory([]);
      setOpen(true);
      setTimeout(() => sendMsgRef.current?.(e.detail, []), 60);
    };
    window.addEventListener(CHATBOT_EVENT, handler);
    return () => window.removeEventListener(CHATBOT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [history, open]);

  // Core send — always uses the passed-in `base` history to avoid stale closures.
  // sendMsgRef is kept current so the window-event handler always calls this version.
  async function sendMsg(text, base) {
    const msg = text.trim();
    if (!msg) return;
    const next = [...base, { role: "user", text: msg }];
    setHistory(next);
    historyRef.current = next;
    setLoading(true);
    try {
      const reply = await callGemini(base, msg);
      setHistory((h) => [...h, { role: "model", text: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: "model", text: "Service temporarily unavailable. Please try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  sendMsgRef.current = sendMsg;
  _chatHistory = history;

  function send(text) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    sendMsg(msg, historyRef.current);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Medical chatbot"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105",
          open
            ? "bg-gray-700 text-white"
            : "bg-primary text-primary-foreground"
        )}
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-50 flex w-[460px] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl"
          style={{ height: 620 }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-primary px-5 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Bot className="size-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-white">Medical Advisor</p>
              <p className="text-sm text-white/70">Pharmacology assistant</p>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => { setHistory([]); historyRef.current = []; }}
                aria-label="Clear chat"
                className="mr-1 text-white/60 transition-colors hover:text-white"
              >
                <Trash2 className="size-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/60 transition-colors hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
            {history.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-[var(--foreground)]">Medical Advisor</p>
                  <p className="mt-1.5 text-base text-[var(--muted)]">
                    Ask about drug interactions, mechanisms, or alternatives
                  </p>
                </div>
              </div>
            ) : (
              <>
                {history.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-[var(--border)] bg-gray-50"
                      )}
                    >
                      {msg.role === "user" ? (
                        <p className="text-base leading-relaxed">{msg.text}</p>
                      ) : (
                        <ChatMarkdown text={msg.text} />
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-[var(--border)] bg-gray-50 px-4 py-3">
                      <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[var(--border)] px-4 py-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-primary/30"
                placeholder="Ask a question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                style={{ maxHeight: 110 }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
                }}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="size-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-sm text-[var(--muted)]">
              AI can make mistakes - please verify
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ChatMarkdown({ text }) {
  const lines = text.split("\n");
  const nodes = [];
  let bullets = [];

  function flushBullets() {
    if (!bullets.length) return;
    nodes.push(
      <ul key={nodes.length} className="mt-2 space-y-2 pl-5 list-disc">
        {bullets.map((b, i) => (
          <li key={i} className="text-base leading-relaxed text-[var(--foreground)]">
            <InlineText text={b} />
          </li>
        ))}
      </ul>
    );
    bullets = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushBullets(); continue; }

    if (/^#{1,3}\s/.test(line)) {
      flushBullets();
      nodes.push(
        <p key={nodes.length} className="mt-3 text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">
          <InlineText text={line.replace(/^#{1,3}\s+/, "")} />
        </p>
      );
    } else if (/^[-*]\s/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushBullets();
      nodes.push(
        <p key={nodes.length} className="mt-1 text-base leading-relaxed text-[var(--foreground)]">
          <InlineText text={line} />
        </p>
      );
    }
  }
  flushBullets();
  return <div className="space-y-0.5">{nodes}</div>;
}

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
          : p
      )}
    </>
  );
}
