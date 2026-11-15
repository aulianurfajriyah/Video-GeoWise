import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Topographic contour lines (like a survey map) for the end card.
 * The lines are true iso-lines of a smooth terrain field, traced with marching squares every
 * frame; the terrain drifts slowly and the contour levels creep, so the map gently breathes.
 * They are revealed outward from the centre, with one contour picked out in green.
 */

type Hill = { x: number; y: number; h: number; s: number };
// Hills placed around the frame (in 0–1 units, y scaled by the aspect), kept off the centre
// so the lockup sits in a calm valley.
const HILLS: Hill[] = [
  { x: 0.12, y: 0.2, h: 1.0, s: 0.16 },
  { x: 0.86, y: 0.16, h: 0.85, s: 0.14 },
  { x: 0.9, y: 0.78, h: 1.1, s: 0.18 },
  { x: 0.14, y: 0.86, h: 0.75, s: 0.15 },
  { x: 0.52, y: -0.05, h: 0.6, s: 0.2 },
  { x: 0.55, y: 1.08, h: 0.7, s: 0.2 },
  { x: 0.33, y: 0.55, h: 0.35, s: 0.1 },
  { x: 0.7, y: 0.45, h: 0.3, s: 0.09 },
];

const STEP = 16; // grid cell, px
const SPACING = 0.065; // field units between contours
const HIGHLIGHT = 7; // which contour (from the lowest) is drawn in green

const field = (x: number, y: number, t: number): number => {
  let v = 0;
  for (const hl of HILLS) {
    const dx = x - (hl.x + 0.015 * Math.sin(t * 0.9 + hl.y * 7));
    const dy = y - (hl.y + 0.015 * Math.cos(t * 0.7 + hl.x * 5));
    v += hl.h * Math.exp(-(dx * dx + dy * dy) / (2 * hl.s * hl.s));
  }
  // Gentle large-scale undulation so the lines wander like real terrain
  v += 0.12 * Math.sin(x * 6.1 + t * 0.4) * Math.cos(y * 5.3 - t * 0.3);
  v += 0.06 * Math.sin((x + y) * 11 - t * 0.5);
  return v;
};

/** One SVG path (move/line pairs) per contour level. */
const traceContours = (w: number, h: number, t: number, levels: number[]): string[] => {
  const cols = Math.ceil(w / STEP) + 1;
  const rows = Math.ceil(h / STEP) + 1;
  const vals = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      vals[j * cols + i] = field((i * STEP) / w, (j * STEP) / w, t);
    }
  }
  return levels.map((lv) => {
    let d = "";
    const lerpPt = (ax: number, ay: number, av: number, bx: number, by: number, bv: number) => {
      const k = (lv - av) / (bv - av);
      return `${(ax + (bx - ax) * k).toFixed(1)} ${(ay + (by - ay) * k).toFixed(1)}`;
    };
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const x0 = i * STEP;
        const y0 = j * STEP;
        const x1 = x0 + STEP;
        const y1 = y0 + STEP;
        const a = vals[j * cols + i]; // top-left
        const b = vals[j * cols + i + 1]; // top-right
        const c = vals[(j + 1) * cols + i + 1]; // bottom-right
        const e = vals[(j + 1) * cols + i]; // bottom-left
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (e > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const top = () => lerpPt(x0, y0, a, x1, y0, b);
        const right = () => lerpPt(x1, y0, b, x1, y1, c);
        const bottom = () => lerpPt(x0, y1, e, x1, y1, c);
        const left = () => lerpPt(x0, y0, a, x0, y1, e);
        const seg = (p: string, q: string) => {
          d += `M${p}L${q}`;
        };
        switch (idx) {
          case 1:
          case 14:
            seg(left(), bottom());
            break;
          case 2:
          case 13:
            seg(bottom(), right());
            break;
          case 3:
          case 12:
            seg(left(), right());
            break;
          case 4:
          case 11:
            seg(top(), right());
            break;
          case 6:
          case 9:
            seg(top(), bottom());
            break;
          case 7:
          case 8:
            seg(left(), top());
            break;
          case 5:
            seg(left(), top());
            seg(bottom(), right());
            break;
          case 10:
            seg(top(), right());
            seg(left(), bottom());
            break;
        }
      }
    }
    return d;
  });
};

export const ContourLines: React.FC<{ color?: string; accent?: string }> = ({ color = "rgba(29,29,31,0.16)", accent = "#2E9E5B" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  // Levels creep upward so the lines slowly flow (under one spacing over the outro, so the
  // green contour never hops to its neighbour).
  const phase = t * 0.005;
  const levels = useMemo(() => Array.from({ length: 22 }, (_, k) => 0.02 + k * SPACING), []);
  const paths = traceContours(
    width,
    height,
    t,
    levels.map((l) => l + phase),
  );
  const reveal = interpolate(frame, [0, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const r = 100 + reveal * 1400;
  const mask = `radial-gradient(circle at 50% 46%, black ${r - 260}px, transparent ${r}px)`;
  return (
    <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* Faint survey grid */}
        {Array.from({ length: Math.ceil(width / 160) + 1 }, (_, i) => (
          <line key={`v${i}`} x1={i * 160} y1={0} x2={i * 160} y2={height} stroke="rgba(29,29,31,0.045)" strokeWidth={1} />
        ))}
        {Array.from({ length: Math.ceil(height / 160) + 1 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 160 - 20} x2={width} y2={i * 160 - 20} stroke="rgba(29,29,31,0.045)" strokeWidth={1} />
        ))}
        {paths.map((d, k) => (
          <path
            key={k}
            d={d}
            fill="none"
            stroke={k === HIGHLIGHT ? accent : color}
            strokeWidth={k === HIGHLIGHT ? 2.4 : k % 4 === 0 ? 1.6 : 1.1}
            strokeOpacity={k === HIGHLIGHT ? 0.75 : 1}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
