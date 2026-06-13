import { buildNetwork } from "@/lib/analysis/network";

const TONE = {
  safe:     { fill: "#ecfdf5", ring: "#6ee7b7" },
  neutral:  { fill: "#eff6ff", ring: "#93c5fd" },
  moderate: { fill: "#fffbeb", ring: "#f59e0b" },
  major:    { fill: "#fff1f2", ring: "#ef4444" },
};

const EDGE_COLOR = { major: "#ef4444", moderate: "#f59e0b" };

function trim(p, q, r) {
  const dx = q.x - p.x, dy = q.y - p.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * r, y: p.y + (dy / len) * r };
}

// Quadratic bezier control point pushed OUTWARD from diagram centre so every
// arc has its own unique path and arcs don't overlap at the centre.
function ctrlPoint(p, q, cx, cy) {
  const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  const dx = mid.x - cx, dy = mid.y - cy;
  const len = Math.hypot(dx, dy);
  const dist = Math.hypot(q.x - p.x, q.y - p.y);
  const outward = dist * 0.38;
  if (len < 4) {
    // Degenerate: midpoint is at diagram centre → curve perpendicular to edge.
    const edgeLen = dist || 1;
    return {
      x: mid.x - ((q.y - p.y) / edgeLen) * outward,
      y: mid.y + ((q.x - p.x) / edgeLen) * outward,
    };
  }
  return { x: mid.x + (dx / len) * outward, y: mid.y + (dy / len) * outward };
}

export function InteractionNetwork({ medications, interactions }) {
  const { nodes, edges, hasHarm, flaggedCount } = buildNetwork(
    medications,
    interactions
  );

  const n = nodes.length;

  // Wide canvas so radial labels on the left/right never clip.
  const W = 920;
  const cx = W / 2;

  // Node circle radius.
  const nodeR = n <= 3 ? 26 : n <= 5 ? 22 : 18;

  // Ring radius: scaled so adjacent-node arc length stays ≥ 150 px.
  const ringR =
    n <= 2 ? 115 :
    n <= 3 ? 150 :
    n <= 5 ? 175 :
    n <= 6 ? 195 : 215;

  // Gap between node edge and start of label text (radially outward).
  const LABEL_GAP = nodeR + 18;

  // Vertical canvas: enough room for the topmost label (which goes UP) and a
  // bottom caption line.
  const H = 2 * ringR + 2 * nodeR + 110;
  // cy is offset slightly down so the top label doesn't clip.
  const cy = ringR + nodeR + 36;

  // Compute position + angle for every node.
  const pos = {};
  const ang = {};
  nodes.forEach((nd, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    ang[nd.id] = a;
    pos[nd.id] = { x: cx + ringR * Math.cos(a), y: cy + ringR * Math.sin(a) };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full"
      role="img"
      aria-label="Medication interaction network"
    >
      <defs>
        <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodOpacity="0.13" />
        </filter>
      </defs>

      {/* ── Edges (only meaningful interactions) ── */}
      {edges
        .filter((e) => e.level === "major" || e.level === "moderate")
        .map((edge, i) => {
          const p = pos[edge.a], q = pos[edge.b];
          if (!p || !q) return null;
          const ctrl = ctrlPoint(p, q, cx, cy);
          const a = trim(p, ctrl, nodeR + 2);
          const b = trim(q, ctrl, nodeR + 2);
          const color = EDGE_COLOR[edge.level] ?? EDGE_COLOR.moderate;
          const w = edge.level === "major" ? 3.5 : 2.5;
          const d = `M ${a.x} ${a.y} Q ${ctrl.x} ${ctrl.y} ${b.x} ${b.y}`;
          return (
            <g key={`e${i}`}>
              <path d={d} fill="none" stroke={color} strokeWidth={w + 8} opacity="0.14" />
              <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
            </g>
          );
        })}

      {/* ── Nodes ── */}
      {nodes.map((nd) => {
        const p = pos[nd.id];
        if (!p) return null;
        const t = TONE[nd.tone];
        const a = ang[nd.id];
        const cosA = Math.cos(a), sinA = Math.sin(a);

        // Place label radially outward from node so it never overlaps the arc.
        const lx = p.x + cosA * LABEL_GAP;
        const ly = p.y + sinA * LABEL_GAP;
        // Text-anchor based on which side of the ring the node sits on.
        const anchor =
          cosA > 0.15 ? "start" : cosA < -0.15 ? "end" : "middle";

        return (
          <g key={nd.id}>
            {nd.flagged && (
              <circle
                cx={p.x} cy={p.y} r={nodeR + 7}
                fill="none" stroke={t.ring} strokeWidth="2" opacity="0.4"
              />
            )}
            <circle
              cx={p.x} cy={p.y} r={nodeR}
              fill={t.fill} stroke={t.ring} strokeWidth="2.5"
              filter="url(#nodeShadow)"
            />
            <circle cx={p.x} cy={p.y} r={nodeR * 0.3} fill={t.ring} opacity="0.9" />

            {/* Radial name label */}
            <text
              x={lx} y={ly + 5}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="13" fontWeight="600" fill="#111827"
            >
              {nd.id}
            </text>
          </g>
        );
      })}

      {/* ── Caption ── */}
      <text
        x={cx} y={H - 12}
        textAnchor="middle"
        fontSize="12.5" fontWeight="600"
        fill={hasHarm ? "#b91c1c" : "#047857"}
      >
        {hasHarm
          ? `${flaggedCount} medication${flaggedCount > 1 ? "s" : ""} flagged for review`
          : "No harmful interactions detected"}
      </text>
    </svg>
  );
}
