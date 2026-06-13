import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionNetwork } from "@/components/insights/InteractionNetwork";

const LEGEND = [
  { color: "#ef4444", label: "High risk" },
  { color: "#f59e0b", label: "Moderate" },
];

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const STEP = 0.2;

export function InteractionNetworkCard({ medications, interactions }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(null); // { startX, startY, baseX, baseY }
  const containerRef = useRef(null);

  const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const zoomIn  = () => setZoom((z) => clamp(+(z + STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => clamp(+(z - STEP).toFixed(2)));
  const reset   = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => clamp(+(z + (e.deltaY < 0 ? STEP : -STEP)).toFixed(2)));
  }, []);

  // Attach wheel listener as non-passive so e.preventDefault() actually stops
  // the browser from zooming the page when the user scrolls over the map.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onMouseDown = useCallback((e) => {
    dragging.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [offset]);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    setOffset({
      x: dragging.current.baseX + (e.clientX - dragging.current.startX),
      y: dragging.current.baseY + (e.clientY - dragging.current.startY),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = null;
    setIsDragging(false);
  }, []);

  if (medications.length < 2) return null;

  const harmfulCount = interactions.filter(
    (ix) => ix.severity === "critical" || ix.severity === "high"
  ).length;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Drug interaction map
        </h3>
        <div className="flex items-center gap-2">
          {harmfulCount > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] text-red-700">
              {harmfulCount} high-risk pair{harmfulCount > 1 ? "s" : ""}
            </span>
          )}
          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-gray-50 px-1 py-0.5">
            <button
              type="button" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}
              className="flex size-6 items-center justify-center rounded text-sm font-bold text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--foreground)] disabled:opacity-30"
              aria-label="Zoom out"
            >−</button>
            <button
              type="button" onClick={reset}
              className="min-w-[36px] text-center text-[11px] font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Reset zoom and pan"
            >{Math.round(zoom * 100)}%</button>
            <button
              type="button" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}
              className="flex size-6 items-center justify-center rounded text-sm font-bold text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--foreground)] disabled:opacity-30"
              aria-label="Zoom in"
            >+</button>
          </div>
        </div>
      </div>

      {/* Map canvas - scroll to zoom, drag to pan */}
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg border border-[var(--border)] bg-[#f8fafb]"
        style={{
          height: 420,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onPointerDown={onMouseDown}
        onPointerMove={onMouseMove}
        onPointerUp={onMouseUp}
        onPointerLeave={onMouseUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease",
            width: "100%",
            height: "100%",
          }}
        >
          <InteractionNetwork medications={medications} interactions={interactions} />
        </div>
      </div>

      <p className="mt-1.5 text-center text-[11px] text-[var(--muted)]">
        Scroll to zoom · drag to pan · click % to reset
      </p>

      <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <svg width="24" height="8" viewBox="0 0 24 8" aria-hidden>
              <line x1="1" y1="4" x2="23" y2="4" stroke={item.color} strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            {item.label}
          </li>
        ))}
        <li className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
          </svg>
          No interaction
        </li>
        <li className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="#fff1f2" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
          Flagged drug
        </li>
      </ul>
    </section>
  );
}
