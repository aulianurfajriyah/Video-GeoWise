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
const INTEGRATED_MAC = { left: 700, top: 190, w: 1120 };
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
      <MacStage left={INTEGRATED_MAC.left} top={INTEGRATED_MAC.top} turn={-18} enter={false}>
        <MacBook width={INTEGRATED_MAC.w} src="recordings/takeF_layers.mp4" trimBefore={30} />
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
// The Mac sits where the One click scene's push lands it (MacStage left 110 / top 230, width 1130).
const MAC_BOX = { left: 110, top: 230, w: 1130 };
const REC_K = 1087 / 1920; // recording px → stage px (screen width 1087 inside the bezel)
const rec = (x: number, y: number) => ({ x: 131.5 + x * REC_K, y: 251.5 + y * REC_K });

// Cursor path read from takeE_alloc.mp4, in scene frames (trimBefore 15, playbackRate 0.5 → rec t = 0.5 + f/60).
// The camera follows a slightly eased version of it.
const CAM_KEYS: { f: number; x: number; y: number }[] = [
  // One move per hover, then a still hold (no drifting between stops).
  { f: 0, x: 1100, y: 430 },
  { f: 110, x: 870, y: 500 }, // Agriculture
  { f: 175, x: 870, y: 500 },
  { f: 225, x: 815, y: 770 }, // Forestry
  { f: 300, x: 815, y: 770 },
  { f: 360, x: 875, y: 260 }, // Recreational Park
  { f: 425, x: 875, y: 260 },
  { f: 475, x: 1450, y: 310 }, // donut
  { f: 525, x: 1450, y: 310 },
];
const CAM_ZOOM = 1.75;
const CAM_TARGET = { x: 650, y: 560 }; // focus lands left of centre, leaving room for the cards
const ZOOM_IN: [number, number] = [26, 80];
// Pull back to the wide shot so the badges sit beside the Mac before the flip.
const ZOOM_OUT: [number, number] = [482, 520];

const useCamera = () => {
  const smooth = Easing.inOut(Easing.cubic);
  return (frame: number) => {
    const fs = CAM_KEYS.map((k) => k.f);
    const fx = interpolate(frame, fs, CAM_KEYS.map((k) => k.x), { ...clamp, easing: smooth });
    const fy = interpolate(frame, fs, CAM_KEYS.map((k) => k.y), { ...clamp, easing: smooth });
    const focus = rec(fx, fy);
    const k = interpolate(frame, [...ZOOM_IN, ...ZOOM_OUT], [0, 1, 1, 0], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
    const z = 1 + (CAM_ZOOM - 1) * k;
    // screen = stage * z + t ; at k = 1 the focus sits on CAM_TARGET, at k = 0 it is the identity.
    const tx = k * (CAM_TARGET.x - focus.x * z);
    const ty = k * (CAM_TARGET.y - focus.y * z);
    return { z, tx, ty, toScreen: (p: { x: number; y: number }) => ({ x: p.x * z + tx, y: p.y * z + ty }) };
  };
};

const ZONES = [
  // `at` = when the cursor hovers that zone (or legend row); `from` = where on the recording it pops out.
  { name: "Agriculture", ha: 102.15, color: colors.agriculture, at: 80, from: { x: 876, y: 490 } },
  { name: "Forestry", ha: 200.85, color: colors.forestry, at: 200, from: { x: 812, y: 800 } },
  { name: "Recreation", ha: 12.6, color: colors.recreation, at: 352, from: { x: 878, y: 222 } },
  { name: "Industrial", ha: 0, color: colors.industrial, at: 440, from: { x: 1700, y: 327 } },
];
const TOTAL = 314.85;
const TOTAL_AT = 462;
const TOTAL_FROM = { x: 1538, y: 300 }; // donut centre
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COL = { left: 1350, top: 250, gap: 16, h: 88, w: 500 };

/** Glass badge that pops out of the Mac screen at `from` and flies to its slot beside the MacBook. */
const PopOutBadge: React.FC<{
  at: number;
  from: { x: number; y: number };
  slot: { x: number; y: number };
  children: (p: number) => React.ReactNode;
  w?: number;
}> = ({ at, from, slot, children, w = COL.w }) => {
  const frame = useCurrentFrame();
  const fly = interpolate(frame, [at, at + 30], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.25, 1) });
  const grow = interpolate(frame, [at, at + 30], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.45, 0.64, 1) });
  const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const fill = interpolate(frame, [at + 12, at + 42], [0, 1], { ...clamp, easing: ease });
  if (frame < at) return null;
  // Badge centre travels from the screen point to the slot centre, lifting off the glass (shadow + tilt).
  const cx = lerp(from.x, slot.x + w / 2, fly);
  const cy = lerp(from.y, slot.y + COL.h / 2, fly) - Math.sin(fly * Math.PI) * 60;
  const lift = Math.sin(fly * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - COL.h / 2,
        width: w,
        opacity: o,
        transform: `perspective(1600px) rotateY(${(1 - fly) * -18}deg) scale(${0.15 + 0.85 * grow + lift * 0.06})`,
        transformOrigin: "50% 50%",
        filter: `drop-shadow(0 ${18 + lift * 30}px ${30 + lift * 30}px rgba(0,0,0,${0.12 + lift * 0.12}))`,
      }}
    >
      {children(fill)}
    </div>
  );
};

const ZoneRow: React.FC<{ name: string; ha: number; color: string; p: number }> = ({ name, ha, color, p }) => {
  const theme = useTheme();
  return (
    <GlassBadge style={{ width: COL.w, height: COL.h, boxSizing: "border-box", padding: "18px 24px", borderRadius: 26 }}>
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
  );
};

const TotalCard: React.FC<{ p: number }> = ({ p }) => (
          <div
            style={{
              width: COL.w,
              height: COL.h,
              boxSizing: "border-box",
              borderRadius: 26,
              padding: "0 28px",
              background: "#111113",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>Total site</div>
            <div style={{ fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {fmt(TOTAL * p)}
              <span style={{ fontSize: 22, opacity: 0.6, fontWeight: 600 }}> ha</span>
            </div>
          </div>
);

export const LightAllocationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = useCamera();
  const c = cam(frame);
  const slot = (i: number) => ({ x: COL.left, y: COL.top + i * (COL.h + COL.gap) });
  // Pop-out sources are fixed where the zone was on screen at the moment of the hover.
  const src = (at: number, p: { x: number; y: number }) => cam(at).toScreen(rec(p.x, p.y));
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      {/* Camera: zooms the whole MacBook (bezel included) and follows the cursor. */}
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${c.tx}px, ${c.ty}px) scale(${c.z})` }}>
        <MacStage left={MAC_BOX.left} top={MAC_BOX.top} turn={16} enter={false}>
          <MacBook width={MAC_BOX.w} src="recordings/takeE_alloc.mp4" trimBefore={15} playbackRate={0.5} />
        </MacStage>
      </AbsoluteFill>
      {ZONES.map((z, i) => (
        <PopOutBadge key={z.name} at={z.at} from={src(z.at, z.from)} slot={slot(i)}>
          {(p) => <ZoneRow name={z.name} ha={z.ha} color={z.color} p={p} />}
        </PopOutBadge>
      ))}
      <PopOutBadge at={TOTAL_AT} from={src(TOTAL_AT, TOTAL_FROM)} slot={{ x: COL.left, y: COL.top + 4 * (COL.h + COL.gap) + 10 }}>
        {(p) => <TotalCard p={p} />}
      </PopOutBadge>
    </AbsoluteFill>
  );
};

/* ---------- 4 → 2: close, turn around, open ---------- */
export const MAC_FLIP_FRAMES = 70;

/** A 3D MacBook: hinged lid with thickness + aluminium base with keyboard, trackpad and a soft contact shadow. */
const MacModel: React.FC<{
  width: number;
  image: string;
  /** Lid angle in degrees: 0 = upright, negative = folding towards the keyboard. */
  lidAngle: number;
}> = ({ width, image, lidAngle }) => {
  const logoId = React.useId();
  const bezel = width * 0.019;
  const sw = width - bezel * 2;
  const lidH = sw * (982 / 1512) + bezel * 2.2;
  const radius = width * 0.034;
  const baseW = width * 1.02;
  const baseH = width * 0.022; // slab thickness
  const baseL = (width - baseW) / 2;
  const D = lidH * 0.92; // base depth
  const lidT = width * 0.008; // lid thickness
  const face: React.CSSProperties = { position: "absolute", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const edge = "linear-gradient(180deg, #E4E6EA 0%, #B9BDC3 100%)";
  const keyRows = [14, 14, 14, 13, 12, 10];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height: lidH, transformStyle: "preserve-3d" }}>
      {/* Contact shadow on the floor */}
      <div
        style={{
          ...face,
          left: baseL - baseW * 0.06,
          top: lidH + baseH,
          width: baseW * 1.12,
          height: D * 1.12,
          transformOrigin: "50% 0",
          transform: `rotateX(90deg) translateY(${-D * 0.04}px)`,
          background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)",
          filter: "blur(18px)",
        }}
      />
      {/* Base deck */}
      <div
        style={{
          ...face,
          left: baseL,
          top: lidH,
          width: baseW,
          height: D,
          transformOrigin: "50% 0",
          transform: "rotateX(90deg)",
          borderRadius: `${radius * 0.4}px ${radius * 0.4}px ${radius}px ${radius}px`,
          background: "linear-gradient(180deg, #CFD2D6 0%, #E3E5E8 18%, #E9EAED 100%)",
          boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Hinge */}
        <div style={{ position: "absolute", left: baseW * 0.12, right: baseW * 0.12, top: 0, height: D * 0.025, background: "linear-gradient(180deg,#3A3B3F,#6B6E73)" }} />
        {/* Speaker grilles */}
        {[0.035, 0.885].map((x) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: baseW * x,
              width: baseW * 0.08,
              top: D * 0.07,
              height: D * 0.4,
              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.28) 1.2px, transparent 1.6px)",
              backgroundSize: "9px 9px",
            }}
          />
        ))}
        {/* Keyboard */}
        <div
          style={{
            position: "absolute",
            left: baseW * 0.13,
            right: baseW * 0.13,
            top: D * 0.07,
            height: D * 0.42,
            borderRadius: 10,
            background: "rgba(0,0,0,0.10)",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            boxSizing: "border-box",
          }}
        >
          {keyRows.map((n, r) => (
            <div key={r} style={{ flex: r === 0 ? 0.6 : 1, display: "flex", gap: 6, justifyContent: "center" }}>
              {Array.from({ length: n }).map((_, k) => (
                <div
                  key={k}
                  style={{
                    flex: r === 5 && k === Math.floor(n / 2) ? 5 : 1,
                    borderRadius: 6,
                    background: "linear-gradient(180deg,#2A2B2F,#17181B)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Trackpad */}
        <div
          style={{
            position: "absolute",
            left: baseW * 0.3,
            right: baseW * 0.3,
            top: D * 0.56,
            height: D * 0.36,
            borderRadius: 18,
            background: "linear-gradient(180deg, #E2E4E7, #D8DADE)",
            boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.07)",
          }}
        />
      </div>
      {/* Base edges: front, back, left, right */}
      <div
        style={{
          ...face,
          left: baseL,
          top: lidH,
          width: baseW,
          height: baseH,
          transform: `translateZ(${D}px)`,
          borderRadius: `0 0 ${baseH}px ${baseH}px`,
          background: "linear-gradient(180deg, #F2F3F5 0%, #D2D5D9 50%, #A6AAB0 100%)",
        }}
      >
        {/* Thumb notch */}
        <div style={{ position: "absolute", left: baseW * 0.43, width: baseW * 0.14, top: 0, height: baseH * 0.4, borderRadius: `0 0 ${baseH}px ${baseH}px`, background: "#BFC2C7" }} />
      </div>
      <div style={{ ...face, left: baseL, top: lidH, width: baseW, height: baseH, transform: "rotateY(180deg)", background: edge }} />
      <div style={{ ...face, left: baseL, top: lidH, width: D, height: baseH, transformOrigin: "0 50%", transform: "rotateY(-90deg)", background: edge }} />
      <div style={{ ...face, left: baseL + baseW - D, top: lidH, width: D, height: baseH, transformOrigin: "100% 50%", transform: "rotateY(90deg)", background: edge }} />
      {/* Lid, hinged on its bottom edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: lidH,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 100%",
          transform: `rotateX(${lidAngle}deg)`,
        }}
      >
        <div style={{ ...face, left: 0, top: 0 }}>
          <MacBook width={width} image={image} showBase={false} />
        </div>
        {/* Lid edges (top, left, right) */}
        <div style={{ ...face, left: radius, top: -lidT, width: width - radius * 2, height: lidT, transformOrigin: "50% 100%", transform: "rotateX(90deg)", background: edge }} />
        <div style={{ ...face, left: -lidT, top: radius, width: lidT, height: lidH - radius, transformOrigin: "100% 50%", transform: "rotateY(-90deg)", background: edge }} />
        <div style={{ ...face, left: width, top: radius, width: lidT, height: lidH - radius, transformOrigin: "0 50%", transform: "rotateY(90deg)", background: edge }} />
        {/* Back of the lid (aluminium) */}
        <div
          style={{
            ...face,
            left: 0,
            top: 0,
            width,
            height: lidH,
            borderRadius: radius,
            transform: `translateZ(${-lidT}px) rotateY(180deg)`,
            background:
              "radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 55%), linear-gradient(160deg, #E9EBEE 0%, #CDD0D5 55%, #B4B8BE 100%)",
            boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.65), inset 0 -10px 30px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Apple logo, polished like the real lid */}
          <svg width={width * 0.1} height={width * 0.1} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.6))" }}>
            <defs>
              <linearGradient id={logoId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F7F8FA" />
                <stop offset="0.5" stopColor="#B7BBC1" />
                <stop offset="1" stopColor="#8E9298" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${logoId})`}
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const LightMacFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const io = Easing.bezier(0.65, 0, 0.35, 1);
  const W = MAC_BOX.w;
  const lidH = (W - W * 0.038) * (982 / 1512) + W * 0.019 * 2.2;
  const from = { left: MAC_BOX.left, top: MAC_BOX.top, w: MAC_BOX.w, rotY: 0 }; // beat 4's last frame
  // The model is scaled about the hinge centre, so place it where beat 2's (smaller) Mac has its hinge.
  const endScale = INTEGRATED_MAC.w / W;
  const to = {
    left: INTEGRATED_MAC.left + INTEGRATED_MAC.w / 2 - W / 2,
    top: INTEGRATED_MAC.top - lidH * (1 - endScale),
    w: INTEGRATED_MAC.w,
    rotY: 0,
  };

  // Frames 0–8 and 62–70 sit under the crossfades, so the laptop holds still there.
  const lift = interpolate(frame, [8, 26, 46, 62], [0, 1, 1, 0], { ...clamp, easing: io });
  // Lid folds half way (about 55°), never shut.
  const half = interpolate(frame, [10, 28, 42, 60], [0, 1, 1, 0], { ...clamp, easing: io });
  // One full turn while the lid is half closed.
  const spin = interpolate(frame, [20, 52], [0, 360], { ...clamp, easing: io });
  const move = interpolate(frame, [8, 62], [0, 1], { ...clamp, easing: io });
  const left = lerp(from.left, to.left, move);
  const top = lerp(from.top, to.top, move);
  const scale = lerp(1, endScale, move) * (1 - 0.4 * lift);
  // Head-on at both ends (matches the flat mockup under the crossfades), looking down mid-move.
  const pitch = -24 * lift;
  const lidAngle = -55 * half + 6 * lift;
  // Screen content swaps while the screen faces away (back of the lid towards camera).
  const image = spin < 180 ? "stills/alloc.png" : "stills/layers_start.png";
  const badgesOut = interpolate(frame, [8, 22], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // While in 3D the laptop is pulled to the middle of the frame (hinge at y 600).
  const dx = (960 - (left + W / 2)) * lift;
  const dy = (600 - (top + lidH)) * lift;
  const cx = left + W / 2 + dx;
  const cy = top + lidH / 2 + dy;
  const D = lidH * 0.92;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      {/* Beat 4's badges slide away as the lid starts to fold */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - badgesOut, transform: `translateX(${badgesOut * 260}px)` }}>
        {ZONES.map((z, i) => (
          <div key={z.name} style={{ position: "absolute", left: COL.left, top: COL.top + i * (COL.h + COL.gap) }}>
            <ZoneRow name={z.name} ha={z.ha} color={z.color} p={1} />
          </div>
        ))}
        <div style={{ position: "absolute", left: COL.left, top: COL.top + 4 * (COL.h + COL.gap) + 10 }}>
          <TotalCard p={1} />
        </div>
      </div>
      <AbsoluteFill style={{ perspective: 3200, perspectiveOrigin: `${cx}px ${cy}px` }}>
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: W,
            height: lidH,
            transformStyle: "preserve-3d",
            // Pivot at the middle of the base so the laptop turns on the spot.
            transformOrigin: `${W / 2}px ${lidH}px ${D / 2}px`,
            transform: `translate(${dx}px, ${dy}px) scale3d(${scale}, ${scale}, ${scale}) rotateX(${pitch}deg) rotateY(${lerp(from.rotY, to.rotY, move) + spin}deg)`,
          }}
        >
          <MacModel width={W} image={image} lidAngle={lidAngle} />
        </div>
      </AbsoluteFill>
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
