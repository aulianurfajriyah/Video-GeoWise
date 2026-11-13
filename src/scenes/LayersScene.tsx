import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Backdrop } from "../components";
import { colors, EASE_OUT, fontFamily, useTheme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const S = 560; // plane size

export type Layer = {
  key: string;
  label: string;
  color: string;
  appear: number;
  Art: React.FC;
};

const Roads: React.FC = () => (
  <g fill="none" stroke={colors.road} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 140 L180 170 L300 120 L560 180" strokeWidth={9} />
    <path d="M180 170 L210 340 L160 560" strokeWidth={7} />
    <path d="M210 340 L420 360 L560 330" strokeWidth={6} />
    <path d="M420 360 L440 560" strokeWidth={5} />
    <path d="M300 120 L330 0" strokeWidth={5} />
  </g>
);

const Rivers: React.FC = () => (
  <g fill="none" stroke={colors.river} strokeLinecap="round">
    <path d="M-10 420 C 120 380, 160 470, 280 430 S 420 300, 570 330" strokeWidth={14} />
    <path d="M280 430 C 300 520, 360 540, 380 570" strokeWidth={7} />
    <path d="M170 410 C 150 300, 90 260, 60 150" strokeWidth={6} />
    <path d="M420 350 C 460 250, 520 220, 560 120" strokeWidth={5} />
  </g>
);

const Power: React.FC = () => {
  const pts: [number, number][] = [
    [20, 40], [150, 120], [280, 210], [400, 290], [540, 380],
  ];
  const pts2: [number, number][] = [
    [280, 210], [250, 360], [230, 540],
  ];
  const line = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <g>
      <polyline points={line(pts)} fill="none" stroke={colors.power} strokeWidth={4} strokeDasharray="14 10" />
      <polyline points={line(pts2)} fill="none" stroke={colors.power} strokeWidth={4} strokeDasharray="14 10" />
      {[...pts, ...pts2].map(([x, y], i) => (
        <rect key={i} x={x - 9} y={y - 9} width={18} height={18} fill={colors.power} rx={3} />
      ))}
    </g>
  );
};

const ELEV_COLOR = "#3FA796";
const Elevation: React.FC = () => (
  <g fill="none" stroke={ELEV_COLOR} strokeWidth={3} opacity={0.9}>
    {Array.from({ length: 9 }).map((_, i) => {
      const r = 30 + i * 32;
      return (
        <ellipse
          key={i}
          cx={330 - i * 6}
          cy={250 + i * 5}
          rx={r * 1.15}
          ry={r * 0.85}
          transform={`rotate(${i * 4} 330 250)`}
        />
      );
    })}
  </g>
);

const Slope: React.FC = () => {
  // Unique per instance: a duplicate id in a hidden (premounted) copy blanks the gradient.
  const id = `slopeG-${React.useId().replace(/:/g, "")}`;
  return (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#2E9E5B" />
        <stop offset="0.45" stopColor="#B8D24A" />
        <stop offset="0.7" stopColor="#F2B233" />
        <stop offset="1" stopColor="#D9412F" />
      </linearGradient>
    </defs>
    <rect width={S} height={S} fill={`url(#${id})`} opacity={0.5} />
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1={i * 44} y1={S} x2={i * 44 + 160} y2={0} stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
    ))}
  </g>
  );
};

// Settlements: clusters of houses.
const VILLAGE_COLOR = "#D9653B";
const Village: React.FC = () => {
  const clusters: [number, number, number][] = [
    [130, 300, 7],
    [390, 140, 6],
    [430, 450, 8],
  ];
  const houses: React.ReactNode[] = [];
  clusters.forEach(([cx, cy, n], k) => {
    for (let i = 0; i < n; i++) {
      const a = random(`va${k}-${i}`) * Math.PI * 2;
      const r = 14 + random(`vr${k}-${i}`) * 52;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      houses.push(
        <g key={`${k}-${i}`} transform={`translate(${x} ${y})`}>
          <rect x={-11} y={-4} width={22} height={16} rx={2} fill={VILLAGE_COLOR} />
          <path d="M-14 -3 L0 -15 L14 -3 Z" fill={VILLAGE_COLOR} />
        </g>,
      );
    }
  });
  return (
    <g>
      {clusters.map(([cx, cy], k) => (
        <circle key={k} cx={cx} cy={cy} r={82} fill={VILLAGE_COLOR} opacity={0.12} />
      ))}
      {houses}
    </g>
  );
};

export const LAYERS: Layer[] = [
  { key: "rd", label: "Roads", color: colors.road, appear: 14, Art: Roads },
  { key: "rv", label: "Rivers", color: colors.river, appear: 44, Art: Rivers },
  { key: "pw", label: "Power lines", color: colors.power, appear: 74, Art: Power },
  { key: "vl", label: "Villages", color: VILLAGE_COLOR, appear: 104, Art: Village },
  { key: "sl", label: "Slope", color: "#F2B233", appear: 134, Art: Slope },
  { key: "el", label: "Elevation", color: ELEV_COLOR, appear: 164, Art: Elevation },
];

const COLLAPSE = [222, 262] as const;

const Plane: React.FC<{ layer: Layer; index: number }> = ({ layer, index }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const enter = interpolate(frame, [layer.appear, layer.appear + 26], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
  const gap = interpolate(frame, [...COLLAPSE], [64, 0], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const z = index * gap + (1 - enter) * 260;
  // Once merged, the planes blend into one composite surface.
  const merged = interpolate(frame, [COLLAPSE[1] - 10, COLLAPSE[1] + 10], [1, 0.62], clamp);
  return (
    <div
      style={{
        position: "absolute",
        width: S,
        height: S,
        left: -S / 2,
        top: -S / 2,
        transform: `translateZ(${z}px)`,
        opacity: enter * (index === 0 ? 1 : merged),
        borderRadius: 18,
        overflow: "hidden",
        background: index === 0 ? theme.planeBase : theme.plane,
        boxShadow: `0 0 0 2px ${layer.color}66, 0 30px 60px rgba(0,0,0,0.45)`,
      }}
    >
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <layer.Art />
      </svg>
    </div>
  );
};

const GridOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const light = theme.mode === "light";
  const p = interpolate(frame, [COLLAPSE[1] - 4, COLLAPSE[1] + 26], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
  const n = 14;
  return (
    <div
      style={{
        position: "absolute",
        width: S,
        height: S,
        left: -S / 2,
        top: -S / 2,
        transform: `translateZ(${LAYERS.length * 2 + 4}px)`,
        opacity: p,
        borderRadius: 18,
        boxShadow: light
          ? `0 0 0 3px rgba(29,29,31,0.85), 0 30px 80px rgba(0,0,0,${0.25 * p})`
          : `0 0 0 3px rgba(255,255,255,0.85), 0 0 80px rgba(96,165,250,${0.55 * p})`,
      }}
    >
      <svg width={S} height={S}>
        {Array.from({ length: n + 1 }).map((_, i) => (
          <React.Fragment key={i}>
            <line x1={(i * S) / n} y1={0} x2={(i * S) / n} y2={S * p} stroke={theme.gridLine} strokeWidth={1.4} />
            <line x1={0} y1={(i * S) / n} x2={S * p} y2={(i * S) / n} stroke={theme.gridLine} strokeWidth={1.4} />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

const LabelRow: React.FC<{ layer: Layer }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const p = interpolate(frame, [layer.appear, layer.appear + 20], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: p,
        translate: `${(1 - p) * -40}px 0px`,
        fontSize: 40,
        fontWeight: 600,
        color: theme.text,
        letterSpacing: "-0.01em",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 6,
          background: layer.color,
          boxShadow: `0 0 18px ${layer.color}`,
        }}
      />
      {layer.label}
    </div>
  );
};

export const LayersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const labelsOut = interpolate(frame, [COLLAPSE[0], COLLAPSE[0] + 24], [1, 0], clamp);
  const caption = interpolate(frame, [COLLAPSE[1] + 6, COLLAPSE[1] + 34], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
  const spin = interpolate(frame, [0, 330], [-44, -28]);
  const stackX = interpolate(frame, [COLLAPSE[0], COLLAPSE[1] + 20], [1180, 960], {
    ...clamp,
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 150, top: 330, opacity: labelsOut, display: "flex", flexDirection: "column", gap: 30 }}>
        {LAYERS.map((l) => (
          <LabelRow key={l.key} layer={l} />
        ))}
      </div>

      <div style={{ position: "absolute", left: stackX, top: 590, perspective: 2200 }}>
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(58deg) rotateZ(${spin}deg)`,
          }}
        >
          {LAYERS.map((l, i) => (
            <Plane key={l.key} layer={l} index={i} />
          ))}
          <GridOverlay />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 110,
          textAlign: "center",
          opacity: caption,
          translate: `0px ${(1 - caption) * 30}px`,
          color: theme.text,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        One unified spatial grid
      </div>
    </AbsoluteFill>
  );
};
