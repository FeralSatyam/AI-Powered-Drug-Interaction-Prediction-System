const GLOW_COLORS = {
  low: "#059669",
  moderate: "#d97706",
  high: "#dc2626",
};

export function ConnectionLine({ severity, animated = true }) {
  const color = GLOW_COLORS[severity];

  return (
    <div className="relative flex flex-1 items-center justify-center px-2" aria-hidden>
      <svg
        viewBox="0 0 120 24"
        className="h-6 w-full max-w-[140px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`line-grad-${severity}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
          <filter id={`glow-${severity}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          y1="12"
          x2="120"
          y2="12"
          stroke={`url(#line-grad-${severity})`}
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#glow-${severity})`}
          className={animated ? "animate-line-glow" : ""}
        />
        {animated && (
          <circle
            cx="60"
            cy="12"
            r="4"
            fill={color}
            className="animate-pulse-dot"
          />
        )}
      </svg>
    </div>
  );
}
