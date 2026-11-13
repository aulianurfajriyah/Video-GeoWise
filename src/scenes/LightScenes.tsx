import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LAYERS, S, type Layer } from "./LayersScene";
import { CARD_PT, InputCard, START_BTN_PT } from "./InputCard";
import { Backdrop, BlurIn, GlassBadge, PopIn, SilverText, WipeIn } from "../components";
import { MacBook } from "../MacBook";
import { colors, EASE_OUT, fontFamily, useTheme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(...EASE_OUT);

const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const theme = useTheme();
  return (
    <BlurIn delay={delay} duration={24}>
      <div style={{ color: theme.eyebrow, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
        {children}
      </div>
    </BlurIn>
  );
};

/** Camera-style entrance for the laptop: rises from depth with a slight 3D turn. */
const MacStage: React.FC<{
  left: number;
  top: number;
  delay?: number;
  turn?: number;
  /** false = already in place on frame 0 (for match cuts from the previous scene). */
  enter?: boolean;
  children: React.ReactNode;
}> = ({ left, top, delay = 0, turn = -14, enter = true, children }) => {
  const frame = useCurrentFrame();
  const p = enter ? interpolate(frame, [delay, delay + 55], [0, 1], { ...clamp, easing: ease }) : 1;
  // A slow continuous drift keeps the shot alive (like a slider move).
  const drift = interpolate(frame, [0, 700], [0, 1]);
  return (
    <div style={{ position: "absolute", left, top, perspective: 2400 }}>
      <div
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 120}px) rotateY(${(1 - p) * turn + drift * 2}deg) rotateX(${(1 - p) * 10}deg) scale(${0.94 + 0.06 * p})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- Beat 2 ---------- */
export const LightIntegratedScene: React.FC = () => {
  const theme = useTheme();
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 110, top: 360, width: 600 }}>
        <BlurIn delay={8}>
          <SilverText size={84}>Every layer.</SilverText>
        </BlurIn>
        <BlurIn delay={40}>
          <SilverText size={84}>Every factor.</SilverText>
        </BlurIn>
        <WipeIn delay={88} duration={40} style={{ marginTop: 30 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: theme.muted, letterSpacing: "-0.02em" }}>
            One integrated analysis.
          </div>
        </WipeIn>
      </div>
      <MacStage left={700} top={190} turn={-18}>
        <MacBook width={1120} src="recordings/takeF_layers.mp4" trimBefore={30} />
      </MacStage>
    </AbsoluteFill>
  );
};

/* ---------- Beat 3 ---------- */
// The analysis parameters from the Layers beat, spread out behind the button.
// On click they gather into the centre behind it.
// Input card placement (px) and the Start Analysis button centre derived from it.
const CARD_SCALE = 1.25;
const CARD_POS = { x: 410, y: 225 };
const BTN_CENTER = {
  x: CARD_POS.x + (CARD_PT.w - START_BTN_PT.right - START_BTN_PT.w / 2) * CARD_SCALE,
  y: CARD_POS.y + (CARD_PT.h - START_BTN_PT.bottom - START_BTN_PT.h / 2) * CARD_SCALE,
};
const TILE = 150;
// Site polygon centre/size on the card vs. in scene 4's MacBook (MacBook 1130 at 110,230;
// recording scaled 1087/1920; polygon centre (888,637) and height 965 in recording px).
const MATCH = {
  from: { x: 960, y: 531 },
  to: { x: 131.5 + 888 * (1087 / 1920), y: 251.5 + 637 * (1087 / 1920) },
  scale: (965 * (1087 / 1920)) / (965 * 0.29 * CARD_SCALE),
};

// The big "Run land-use analysis" button the parameters gather into.
const PILL = { x: 960, y: 626, w: 660, h: 132 };

const PARAM_SPOTS: Record<string, { x: number; y: number }> = {
  rd: { x: 300, y: 600 },
  rv: { x: 610, y: 455 },
  pw: { x: 610, y: 870 },
  vl: { x: 1310, y: 455 },
  sl: { x: 1310, y: 870 },
  el: { x: 1620, y: 600 },
};

// Where the Layers scene leaves the merged stack on its last frame.
const STACK = { x: 960, y: 590, rotX: 58, rotZ: -28 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The merged grid from the Layers scene, fading as the stack splits apart. */
const StackGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const o = interpolate(frame, [0, 12], [1, 0], clamp);
  const n = 14;
  return (
    <div
      style={{
        position: "absolute",
        left: STACK.x - S / 2,
        top: STACK.y - S / 2,
        width: S,
        height: S,
        opacity: o,
        borderRadius: 18,
        transform: `perspective(2200px) rotateX(${STACK.rotX}deg) rotateZ(${STACK.rotZ}deg) translateZ(18px)`,
        boxShadow: "0 0 0 3px rgba(29,29,31,0.85)",
      }}
    >
      <svg width={S} height={S}>
        {Array.from({ length: n + 1 }).map((_, i) => (
          <React.Fragment key={i}>
            <line x1={(i * S) / n} y1={0} x2={(i * S) / n} y2={S} stroke={theme.gridLine} strokeWidth={1.4} />
            <line x1={0} y1={(i * S) / n} x2={S} y2={(i * S) / n} stroke={theme.gridLine} strokeWidth={1.4} />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
};

/**
 * One parameter layer. It starts exactly where the Layers scene ends (stacked,
 * isometric, full size), flies straight out to its spot around the button,
 * then gathers back into the centre behind the button on click.
 */
const ParamTile: React.FC<{ layer: Layer; index: number; click: number }> = ({ layer, index, click }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const spot = PARAM_SPOTS[layer.key];
  // Unstack: top layers peel off first.
  const sStart = 2 + (LAYERS.length - 1 - index) * 3;
  const p = interpolate(frame, [sStart, sStart + 40], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.25, 1) });
  // Gather: staggered slightly so they stream into the button one after another.
  const gStart = click + 2 + index * 2;
  const g = interpolate(frame, [gStart, gStart + 30], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  // Idle float once spread out.
  const floatY = Math.sin((frame + index * 17) / 22) * 8 * p;
  const floatR = (Math.sin((frame + index * 29) / 30) * 3 + (random(`tilt-${layer.key}`) - 0.5) * 10) * p * (1 - g);

  const sx = lerp(STACK.x, spot.x, p);
  const sy = lerp(STACK.y, spot.y, p) + floatY;
  const x = lerp(sx, PILL.x, g);
  const y = lerp(sy, PILL.y, g);
  const k = lerp(1, TILE / S, p) * (1 - 0.65 * g);
  const fill = lerp(index === 0 ? 0.95 : 0.35, 0.95, p);
  const layerO = lerp(index === 0 ? 1 : 0.62, 1, p);
  const opacity = layerO * interpolate(g, [0.75, 1], [1, 0], clamp);
  const labelO = Math.min(interpolate(p, [0.75, 1], [0, 1], clamp), interpolate(g, [0, 0.35], [1, 0], clamp));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - S / 2,
          top: y - S / 2,
          width: S,
          height: S,
          opacity,
          borderRadius: lerp(18, 26 * (S / TILE), p),
          overflow: "hidden",
          background: `rgba(255,255,255,${fill})`,
          boxShadow: `0 0 0 ${lerp(2, 7.5, p)}px ${layer.color}88, 0 ${lerp(30, 80, p)}px ${lerp(60, 150, p)}px -${lerp(0, 50, p)}px rgba(0,0,0,${lerp(0.45, 0.35, p)})`,
          transform: `perspective(2200px) rotateX(${STACK.rotX * (1 - p)}deg) rotateZ(${STACK.rotZ * (1 - p) + floatR}deg) scale(${k})`,
        }}
      >
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          <layer.Art />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: sx - 150,
          top: sy + TILE / 2 + 12,
          width: 300,
          opacity: labelO,
          color: theme.text,
          fontSize: 22,
          fontWeight: 700,
          whiteSpace: "nowrap",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, background: layer.color }} />
        {layer.label}
      </div>
    </>
  );
};

const Spinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();
  // macOS-style spinner: 8 spokes with a rotating highlight.
  const step = Math.floor(frame / 2) % 8;
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24">
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={-5}
          x2={0}
          y2={-10}
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.25 + 0.75 * (((i - step + 8) % 8) / 7)}
          transform={`rotate(${i * 45})`}
        />
      ))}
    </svg>
  );
};

export const LightOneClickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLICK = 84;
  // 1) Cursor glides to the big button and clicks.
  const t = interpolate(frame, [30, CLICK - 4], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cx = interpolate(t, [0, 1], [1500, PILL.x + 40]);
  const cy = interpolate(t, [0, 1], [930, PILL.y + 14]);
  const cursorO = interpolate(frame, [24, 34, CLICK + 16, CLICK + 28], [0, 1, 1, 0], clamp);
  const pressed = frame >= CLICK && frame < CLICK + 8;
  const btnIn = interpolate(frame, [16, 50], [0, 1], { ...clamp, easing: ease });
  const ripple = interpolate(frame, [CLICK, CLICK + 36], [0, 1], { ...clamp, easing: ease });
  // 2) Parameters gather behind it (ParamTile), with a glow building up.
  const glow = interpolate(frame, [CLICK + 6, CLICK + 40, CLICK + 80], [0, 1, 0], clamp);
  // 3) The site card appears behind the button, which settles onto it as Start Analysis.
  const CARD_AT = 118;
  const cardIn = interpolate(frame, [CARD_AT, CARD_AT + 34], [0, 1], { ...clamp, easing: ease });
  const m = interpolate(frame, [CARD_AT + 4, CARD_AT + 40], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.25, 1) });
  // 4) Processing… then the suitability zones colour in.
  const LOAD = CARD_AT + 44;
  const loading = interpolate(frame, [LOAD, LOAD + 8], [0, 1], clamp);
  const reveal = interpolate(frame, [LOAD + 28, LOAD + 62], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  // Scan sweep across the map while processing.
  const scan = interpolate(frame, [LOAD + 2, LOAD + 32], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const scanO = interpolate(frame, [LOAD, LOAD + 6, LOAD + 28, LOAD + 36], [0, 1, 1, 0], clamp);
  // 5) Push-in that lands the card's site polygon exactly on the polygon in scene 4's MacBook,
  //    so the crossfade reads as one continuous map.
  const push = interpolate(frame, [LOAD + 40, 238], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.3, 1) });
  const tx = (MATCH.to.x - MATCH.from.x) * push;
  const ty = (MATCH.to.y - MATCH.from.y) * push;
  const zoom = 1 + (MATCH.scale - 1) * push;
  // Caption carried over from the Layers scene, fading as the stack splits.
  const carry = interpolate(frame, [0, 12], [1, 0], clamp);
  const titleOut = interpolate(frame, [CARD_AT - 10, CARD_AT + 12], [1, 0], clamp);

  // Button morph: big pill → the card's Start Analysis capsule.
  const small = { w: START_BTN_PT.w * CARD_SCALE, h: START_BTN_PT.h * CARD_SCALE };
  const bw = lerp(PILL.w, small.w + 10, m);
  const bh = lerp(PILL.h, small.h, m);
  const bx = lerp(PILL.x, BTN_CENTER.x - 5, m);
  const by = lerp(PILL.y, BTN_CENTER.y, m);
  const fs = lerp(44, 16, m);
  const big = interpolate(m, [0, 0.45], [1, 0], clamp);
  const label = interpolate(m, [0.55, 1], [0, 1], clamp) * (1 - loading);

  // Map area of the card in screen px (for the scan sweep).
  const map = { x: CARD_POS.x + 32 * CARD_SCALE, y: CARD_POS.y + 92 * CARD_SCALE, w: 816 * CARD_SCALE, h: 384 * CARD_SCALE };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      {/* Energy that builds behind the button as the parameters merge */}
      <div
        style={{
          position: "absolute",
          left: PILL.x - 420,
          top: PILL.y - 260,
          width: 840,
          height: 520,
          borderRadius: "50%",
          opacity: glow,
          scale: 0.6 + 0.4 * glow,
          background:
            "radial-gradient(closest-side, rgba(95,175,122,0.55), rgba(242,178,51,0.30) 45%, rgba(103,232,249,0.0) 100%)",
          filter: "blur(30px)",
        }}
      />
      {LAYERS.map((layer, i) => (
        <ParamTile key={layer.key} layer={layer} index={i} click={CLICK} />
      ))}
      <StackGrid />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 110,
          textAlign: "center",
          opacity: carry,
          color: "#1D1D1F",
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        One unified spatial grid
      </div>
      <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center", opacity: titleOut }}>
        <BlurIn delay={14}>
          <SilverText size={100}>And then, just one click.</SilverText>
        </BlurIn>
      </div>

      {/* Everything that pushes into scene 4 together */}
      <AbsoluteFill
        style={{
          transformOrigin: `${MATCH.from.x}px ${MATCH.from.y}px`,
          translate: `${tx}px ${ty}px`,
          scale: zoom,
        }}
      >
        {/* The real GeoWise site form card (boundary step) */}
        <div
          style={{
            position: "absolute",
            left: CARD_POS.x,
            top: CARD_POS.y,
            opacity: cardIn,
            translate: `0px ${(1 - cardIn) * 50}px`,
            scale: 0.95 + 0.05 * cardIn,
            filter: `blur(${(1 - cardIn) * 10}px)`,
          }}
        >
          <InputCard scale={CARD_SCALE} reveal={reveal} showButton={false} />
        </div>
        {/* Processing scan over the boundary map */}
        <div
          style={{
            position: "absolute",
            left: map.x,
            top: map.y,
            width: map.w,
            height: map.h - 86 * CARD_SCALE,
            overflow: "hidden",
            borderRadius: 16 * CARD_SCALE,
            opacity: scanO,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: lerp(-200, map.w, scan),
              width: 200,
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(95,175,122,0.28) 70%, rgba(95,175,122,0.75) 100%)",
            }}
          />
        </div>

        {/* The button: big pill → Start Analysis → Processing… */}
        <div
          style={{
            position: "absolute",
            left: bx - bw / 2,
            top: by - bh / 2,
            width: bw,
            height: bh,
            borderRadius: bh / 2,
            opacity: btnIn,
            scale: (0.85 + 0.15 * btnIn) * (pressed ? 0.95 : 1),
            background: lerp(0, 1, loading) > 0.5 ? "#2C2C2E" : "#000",
            boxShadow: `0 ${lerp(30, 3, m)}px ${lerp(60, 8, m)}px -${lerp(18, 0, m)}px rgba(0,0,0,${lerp(0.45, 0.22, m)})`,
            color: "#fff",
            fontWeight: lerp(700, 500, m),
            fontSize: fs,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: big }}>
            Run land-use analysis
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: label }}>
            Start Analysis
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: loading }}>
            <Spinner size={17} color="#fff" />
            Processing…
          </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: PILL.x - 420 * ripple,
          top: PILL.y - 420 * ripple,
          width: 840 * ripple,
          height: 840 * ripple,
          borderRadius: "50%",
          border: `3px solid rgba(17,17,19,${0.5 * (1 - ripple)})`,
        }}
      />
      <svg
        width={56}
        height={56}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: cx, top: cy, opacity: cursorO, scale: pressed ? 0.86 : 1, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}
      >
        <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Beat 4 ---------- */
const ZONES = [
  { name: "Forestry", ha: 200.85, color: colors.forestry, delay: 120 },
  { name: "Agroforestry", ha: 102.15, color: colors.agriculture, delay: 160 },
  { name: "Recreation", ha: 12.6, color: colors.recreation, delay: 200 },
  { name: "Industrial", ha: 0, color: colors.industrial, delay: 240 },
];
const TOTAL = 314.85;
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ZoneCard: React.FC<(typeof ZONES)[number]> = ({ name, ha, color, delay }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const p = interpolate(frame, [delay, delay + 50], [0, 1], { ...clamp, easing: ease });
  return (
    <PopIn delay={delay} fromX={0} fromY={-40}>
      <GlassBadge style={{ width: 500, padding: "18px 24px", borderRadius: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(255,255,255,0.9)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{name}</div>
            <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: "rgba(0,0,0,0.07)" }}>
              <div style={{ width: `${(ha / TOTAL) * 100 * p}%`, height: 6, borderRadius: 3, background: color }} />
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", minWidth: 150, textAlign: "right" }}>
            {fmt(ha * p)}
            <span style={{ fontSize: 20, color: theme.muted, fontWeight: 600 }}> ha</span>
          </div>
        </div>
      </GlassBadge>
    </PopIn>
  );
};

export const LightAllocationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const total = interpolate(frame, [40, 110], [0, TOTAL], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <MacStage left={110} top={230} turn={16} enter={false}>
        <MacBook width={1130} src="recordings/takeE_alloc.mp4" trimBefore={15} playbackRate={0.5} />
      </MacStage>
      <div style={{ position: "absolute", left: 1350, top: 170, display: "flex", flexDirection: "column", gap: 16 }}>
        <Eyebrow delay={20}>Initial suitability map</Eyebrow>
        <BlurIn delay={34}>
          <div style={{ color: theme.text, fontSize: 92, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
            {fmt(total)}
            <span style={{ fontSize: 38, color: theme.muted, fontWeight: 600 }}> ha</span>
          </div>
        </BlurIn>
        <BlurIn delay={60}>
          <div style={{ color: theme.muted, fontSize: 28, fontWeight: 500, marginTop: -8, marginBottom: 12, width: 500 }}>
            Area calculated for every recommended zone
          </div>
        </BlurIn>
        {ZONES.map((z) => (
          <ZoneCard key={z.name} {...z} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Beat 5 ---------- */
export const LightVisionScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Camera orbits up and over the laptop: the map on screen tips back toward 3D.
  const tilt = interpolate(frame, [10, 160], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", zIndex: 2 }}>
        <BlurIn delay={4}>
          <SilverText size={88}>But the vision doesn’t stop at a map.</SilverText>
        </BlurIn>
      </div>
      <div style={{ position: "absolute", left: 960 - 500, top: 270, perspective: 1800 }}>
        <div
          style={{
            transformOrigin: "50% 100%",
            transform: `rotateX(${tilt * 38}deg) rotateZ(${tilt * -10}deg) translateY(${tilt * -30}px) scale(${1 - tilt * 0.12})`,
          }}
        >
          <MacBook width={1000} image="stills/alloc.png" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Beat 6 ---------- */
const SPECIES = [
  { local: "Sengon", latin: "Falcataria moluccana", share: 60, trees: "1,093" },
  { local: "Jati", latin: "Tectona grandis", share: 40, trees: "744" },
];

export const LightThreeDScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const SPLIT = 420;
  const aOut = interpolate(frame, [SPLIT, SPLIT + 30], [1, 0], clamp);
  const bIn = interpolate(frame, [SPLIT + 6, SPLIT + 46], [0, 1], { ...clamp, easing: ease });
  // Slow push toward the laptop over part A (whole screen stays in frame).
  const pushA = interpolate(frame, [0, SPLIT], [1, 1.06]);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <AbsoluteFill style={{ opacity: aOut }}>
        <div style={{ position: "absolute", left: 110, top: 200, width: 1120, height: 760, scale: pushA, transformOrigin: "50% 50%" }}>
          <MacStage left={0} top={0} turn={-16}>
            <MacBook width={1120} src="recordings/takeD_growth.mp4" trimBefore={1 * fps} />
          </MacStage>
        </div>
        <div style={{ position: "absolute", left: 1340, top: 260, width: 520, display: "flex", flexDirection: "column", gap: 24 }}>
          <Eyebrow delay={16}>3D reclamation plan</Eyebrow>
          <BlurIn delay={28}>
            <SilverText size={64}>Explore it in 3D.</SilverText>
          </BlurIn>
          <PopIn delay={70} fromY={-40}>
            <GlassBadge>
              <div style={{ fontSize: 20, color: theme.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Projected onto</div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>Your actual terrain</div>
            </GlassBadge>
          </PopIn>
          <PopIn delay={110} fromY={-40}>
            <GlassBadge>
              <div style={{ fontSize: 20, color: theme.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Growth horizon</div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>Year 0 → 30</div>
            </GlassBadge>
          </PopIn>
        </div>
      </AbsoluteFill>

      {frame >= SPLIT ? (
        <AbsoluteFill style={{ opacity: bIn }}>
          <div style={{ position: "absolute", left: 90, top: 200, width: 560, display: "flex", flexDirection: "column", gap: 22 }}>
            <Eyebrow delay={SPLIT + 10}>Forest zone · 200.4 ha</Eyebrow>
            <BlurIn delay={SPLIT + 20}>
              <SilverText size={68}>Native species, chosen per zone.</SilverText>
            </BlurIn>
            {SPECIES.map((s, i) => (
              <PopIn key={s.local} delay={SPLIT + 60 + i * 20} fromY={-40}>
                <GlassBadge style={{ width: 520, borderRadius: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: colors.forestry, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width={30} height={30} viewBox="0 0 24 24" fill="#fff">
                        <path d="M12 2c-3 3-6 6-6 10a6 6 0 0 0 5 5.9V22h2v-4.1A6 6 0 0 0 18 12c0-4-3-7-6-10z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 32, fontWeight: 800 }}>{s.local}</div>
                      <div style={{ fontSize: 22, fontStyle: "italic", color: theme.muted }}>{s.latin}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: colors.forestry }}>{s.share}%</div>
                      <div style={{ fontSize: 20, color: theme.muted }}>{s.trees} trees</div>
                    </div>
                  </div>
                </GlassBadge>
              </PopIn>
            ))}
          </div>
          <div style={{ position: "absolute", left: 690, top: 220, translate: `${(1 - bIn) * 80}px 0px` }}>
            <MacBook width={1110} src="recordings/takeC_site3d.mp4" trimBefore={Math.round(19.5 * fps)} />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Outro ---------- */
export const LightOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const icon = interpolate(frame, [6, 36], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 36,
            background: "linear-gradient(180deg, #FFFFFF 0%, #ECECEE 100%)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: 0.6 + 0.4 * icon,
            opacity: interpolate(frame, [6, 18], [0, 1], clamp),
          }}
        >
          <Img src={staticFile("logo-a.svg")} style={{ width: 92, height: 92 }} />
        </div>
        <BlurIn delay={20} duration={44}>
          <SilverText size={150}>GeoWise</SilverText>
        </BlurIn>
        <WipeIn delay={58} duration={40}>
          <div style={{ fontSize: 56, fontWeight: 600, color: theme.text, letterSpacing: "-0.02em" }}>
            Mind your future mining site.
          </div>
        </WipeIn>
        <BlurIn delay={100} duration={36}>
          <div style={{ marginTop: 20, color: theme.muted, fontSize: 28, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Land-use suitability · 3D reclamation planning
          </div>
        </BlurIn>
      </div>
    </AbsoluteFill>
  );
};
