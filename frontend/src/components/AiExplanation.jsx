import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

async function fetchGeminiExplanation(drugs, riskLevel) {
  const [drugA, drugB, ...rest] = drugs;
  const drugsStr = rest.length
    ? drugs.slice(0, -1).join(", ") + " and " + drugs[drugs.length - 1]
    : `${drugA} and ${drugB}`;
  const prompt =
    `Explain the drug interaction between ${drugsStr} (classified as ${riskLevel.toUpperCase()} risk).\n\n` +
    `Respond with exactly 2-3 bullet points. Each bullet must be one concise sentence covering: ` +
    `the mechanism, the clinical outcome, and (if space allows) the key monitoring requirement. ` +
    `No headings, no sub-bullets, no preamble. Professional and factually accurate.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("empty response");
  return text;
}

export function AiExplanation({ drugs, riskLevel, fallback = "" }) {
  const [text, setText]     = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!GEMINI_KEY) {
      setText(fallback);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetchGeminiExplanation(drugs, riskLevel)
      .then((explanation) => {
        if (!cancelled) setText(explanation);
      })
      .catch(() => {
        if (!cancelled) setText(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
        <Loader2 className="size-3.5 animate-spin" />
        Generating clinical explanation…
      </div>
    );
  }

  return (
    <div className="mt-2">
      <GeminiMarkdown text={text} />
    </div>
  );
}

function GeminiMarkdown({ text }) {
  const lines = text.split("\n");
  const nodes = [];
  let bulletBuffer = [];

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={nodes.length} className="mt-1 space-y-1 pl-4 list-disc">
        {bulletBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-[var(--text2,#374151)]">
            <InlineText text={item} />
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^#{1,3}\s/.test(line)) {
      flushBullets();
      const heading = line.replace(/^#{1,3}\s+/, "");
      nodes.push(
        <p key={nodes.length} className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
          <InlineText text={heading} />
        </p>
      );
    } else if (/^[-*]\s/.test(line)) {
      bulletBuffer.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushBullets();
      nodes.push(
        <p key={nodes.length} className="mt-1.5 text-sm leading-relaxed text-[var(--text2,#374151)]">
          <InlineText text={line} />
        </p>
      );
    }
  }
  flushBullets();
  return <>{nodes}</>;
}

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-semibold text-[var(--foreground)]">{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}
