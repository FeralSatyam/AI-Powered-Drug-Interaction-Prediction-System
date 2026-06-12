"use client";

import { useEffect, useMemo, useState } from "react";

type AnimationPhase = "idle" | "converging" | "reaction" | "revealed";

interface MedicationPillProps {
  name: string;
  side: "left" | "right";
  phase: AnimationPhase;
}

export function MedicationPill({ name, side, phase }: MedicationPillProps) {
  const animate =
    phase === "converging" || phase === "reaction" || phase === "revealed";
  const convergeClass = animate
    ? side === "left"
      ? "animate-pill-to-center-left"
      : "animate-pill-to-center-right"
    : "";
  const glowClass =
    phase === "reaction" || phase === "revealed" ? "animate-pill-glow" : "";

  return (
    <div
      className={`absolute top-1/2 z-10 -translate-y-1/2 ${side === "left" ? "left-0" : "right-0"} ${convergeClass} ${glowClass}`}
      style={{ animationFillMode: "forwards" }}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md ring-1 ring-black/5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-teal-100 text-[var(--primary)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.5 15.3l-1.5 4.5-3-1.5-3 1.5-1.5-4.5" />
          </svg>
        </span>
        <span className="max-w-[100px] truncate text-sm font-semibold text-[var(--foreground)] sm:max-w-[140px]">
          {name}
        </span>
      </div>
    </div>
  );
}

interface ReactionCoreProps {
  active: boolean;
  severity: "low" | "moderate" | "high";
}

const GLOW: Record<string, string> = {
  low: "from-emerald-400/40 to-teal-300/20",
  moderate: "from-amber-400/50 to-orange-300/20",
  high: "from-red-400/50 to-rose-300/20",
};

export function ReactionCore({ active, severity }: ReactionCoreProps) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[8] -translate-x-1/2 -translate-y-1/2">
      <div
        className={`h-28 w-28 rounded-full bg-gradient-radial ${GLOW[severity]} animate-reaction-burst`}
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.35) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-[var(--primary)]/20 animate-ripple-1" />
        <div className="absolute h-[72px] w-[72px] rounded-full border-2 border-[var(--primary)]/30 animate-ripple-2" />
        <div className="absolute h-[100px] w-[100px] rounded-full border border-[var(--primary)]/20 animate-ripple-3" />
      </div>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[var(--primary)] animate-particle"
          style={{
            ["--particle-x" as string]: p.x,
            ["--particle-y" as string]: p.y,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

const PARTICLES = [
  { x: "48px", y: "-36px", delay: 0 },
  { x: "-42px", y: "-30px", delay: 80 },
  { x: "36px", y: "42px", delay: 120 },
  { x: "-48px", y: "36px", delay: 160 },
  { x: "0px", y: "-52px", delay: 200 },
  { x: "52px", y: "0px", delay: 60 },
  { x: "-52px", y: "6px", delay: 100 },
  { x: "6px", y: "48px", delay: 140 },
];

interface ConnectionBeamProps {
  visible: boolean;
  severity: "low" | "moderate" | "high";
}

const BEAM_COLOR: Record<string, string> = {
  low: "#059669",
  moderate: "#d97706",
  high: "#dc2626",
};

export function ConnectionBeam({ visible, severity }: ConnectionBeamProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-8 top-1/2 z-[6] -translate-y-1/2 sm:inset-x-12">
      <svg viewBox="0 0 200 20" className="h-4 w-full animate-beam-draw" preserveAspectRatio="none">
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={BEAM_COLOR[severity]} stopOpacity="0.2" />
            <stop offset="50%" stopColor={BEAM_COLOR[severity]} stopOpacity="1" />
            <stop offset="100%" stopColor={BEAM_COLOR[severity]} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="10"
          x2="200"
          y2="10"
          stroke="url(#beam-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-line-glow"
        />
      </svg>
    </div>
  );
}

const EMERGING_SYMPTOMS = [
  { key: "Nausea", emoji: "🤢", angle: -70, delay: 0 },
  { key: "Dizziness", emoji: "😵", angle: -35, delay: 100 },
  { key: "Anxiety", emoji: "😰", angle: 0, delay: 200 },
  { key: "Fatigue", emoji: "😴", angle: 35, delay: 300 },
  { key: "Headache", emoji: "🤕", angle: 70, delay: 400 },
];

interface EmergingSymptomsProps {
  visible: boolean;
  symptoms: string[];
}

export function EmergingSymptoms({ visible, symptoms }: EmergingSymptomsProps) {
  const display = useMemo(() => {
    const normalized = symptoms.map((s) => s.toLowerCase());
    const matched = EMERGING_SYMPTOMS.filter((s) =>
      normalized.some(
        (n) => n.includes(s.key.toLowerCase()) || s.key.toLowerCase().includes(n)
      )
    );
    if (matched.length >= 2) return matched.slice(0, 5);
    return EMERGING_SYMPTOMS;
  }, [symptoms]);

  if (!visible) return null;

  return (
    <div className="relative mx-auto mt-4 h-32 w-full max-w-md">
      {display.map((item) => {
        const radius = 100;
        const rad = (item.angle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = -Math.cos(rad) * radius * 0.45 - 20;

        return (
          <div
            key={item.key}
            className="absolute left-1/2 top-full animate-symptom-emerge"
            style={{
              ["--emerge-x" as string]: `${x}px`,
              ["--emerge-y" as string]: `${y}px`,
              animationDelay: `${item.delay}ms`,
            }}
          >
            <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white/85 px-3 py-2 shadow-lg backdrop-blur-sm ring-1 ring-white/70">
              <span className="text-2xl leading-none" role="img" aria-label={item.key}>
                {item.emoji}
              </span>
              <span className="text-[10px] font-semibold text-[var(--muted)]">{item.key}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useReactionPhase(resetKey: string) {
  const [phase, setPhase] = useState<AnimationPhase>("idle");

  useEffect(() => {
    setPhase("idle");
    const t1 = setTimeout(() => setPhase("converging"), 200);
    const t2 = setTimeout(() => setPhase("reaction"), 1700);
    const t3 = setTimeout(() => setPhase("revealed"), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [resetKey]);

  return phase;
}
