import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Backdrop } from "../components";
import { colors, EASE_OUT, fontFamily, useTheme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = 560; // plane size

type Layer = {
  key: string;
  label: string;
  group: "data" | "terrain";
  color: string;
  appear: number;
  Art: React.FC;
};

const LandCover: React.FC = () => {
  const palette = ["#2E7D4F", "#3E9B5E", "#7FA65A", "#B9A46A", "#8C6E4A", "#5FAF7A"];
  const cells = [];
  const n = 8;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const c = palette[Math.floor(random(`lc${x}-${y}`) * palette.length)];
      cells.push(
        <rect key={`${x}-${y}`} x={(x * S) / n} y={(y * S) / n} width={S / n + 1} height={S / n + 1} fill={c} opacity={0.82} />,
      );
    }
  }
  return <>{cells}</>;
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

const Elevation: React.FC = () => (
  <g fill="none" stroke="#9FE3D2" strokeWidth={2.5} opacity={0.9}>
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

const Slope: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="slopeG" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#2E9E5B" />
        <stop offset="0.45" stopColor="#B8D24A" />
        <stop offset="0.7" stopColor="#F2B233" />
        <stop offset="1" stopColor="#D9412F" />
      </linearGradient>
    </defs>
    <rect width={S} height={S} fill="url(#slopeG)" opacity={0.5} />
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1={i * 44} y1={S} x2={i * 44 + 160} y2={0} stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
    ))}
  </g>
);

const Proximity: React.FC = () => (
  <g fill="none" stroke="#67E8F9" opacity={0.85}>
    {[
      [140, 160],
      [420, 400],
    ].map(([cx, cy], k) =>
      Array.from({ length: 6 }).map((_, i) => (
        <circle key={`${k}-${i}`} cx={cx} cy={cy} r={24 + i * 36} strokeWidth={3 - i * 0.35} />
      )),
    )}
    <circle cx={140} cy={160} r={9} fill="#67E8F9" />
    <circle cx={420} cy={400} r={9} fill="#67E8F9" />
  </g>
);

const LAYERS: Layer[] = [
  { key: "lc", label: "Land cover", group: "data", color: "#5FAF7A", appear: 14, Art: LandCover },
  { key: "rd", label: "Roads", group: "data", color: colors.road, appear: 40, Art: Roads },
  { key: "rv", label: "Rivers", group: "data", color: colors.river, appear: 64, Art: Rivers },
  { key: "pw", label: "Power networks", group: "data", color: colors.power, appear: 88, Art: Power },
  { key: "el", label: "Elevation", group: "terrain", color: "#9FE3D2", appear: 128, Art: Elevation },
  { key: "sl", label: "Slope", group: "terrain", color: "#F2B233", appear: 152, Art: Slope },
  { key: "px", label: "Proximity", group: "terrain", color: "#67E8F9", appear: 176, Art: Proximity },
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

const GroupTitle: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 16], [0, 1], clamp),
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: theme.muted,
        marginBottom: 6,
      }}
    >
      {children}
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
      <div style={{ position: "absolute", left: 150, top: 230, opacity: labelsOut, display: "flex", flexDirection: "column", gap: 22 }}>
        <GroupTitle delay={8}>Spatial data</GroupTitle>
        {LAYERS.filter((l) => l.group === "data").map((l) => (
          <LabelRow key={l.key} layer={l} />
        ))}
        <div style={{ height: 26 }} />
        <GroupTitle delay={122}>Terrain analysis</GroupTitle>
        {LAYERS.filter((l) => l.group === "terrain").map((l) => (
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
