import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { LAYERS, S, type Layer } from "./LayersScene";
import { CARD_PT, InputCard, START_BTN_PT } from "./InputCard";
import { Backdrop, BlurIn, GlassBadge, PopIn, SilverText, WipeIn } from "../components";
import { MacBook } from "../MacBook";
import { Exit, NativeSpecies } from "./NativeSpecies";
import { ContourLines } from "../ContourLines";
import { colors, EASE_OUT, fontFamily, REC, useTheme } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(...EASE_OUT);

const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({ children, delay = 0, color }) => {
  const theme = useTheme();
  return (
    <BlurIn delay={delay} duration={24}>
      <div style={{ color: color ?? theme.eyebrow, fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
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
        <BlurIn delay={48}>
          <SilverText size={84}>Every factor.</SilverText>
        </BlurIn>
        <WipeIn delay={105} duration={40} style={{ marginTop: 30 }}>
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
const PILL = { x: 960, y: 540, w: 660, h: 132 }; // frame centre (no title above it)

const PARAM_SPOTS: Record<string, { x: number; y: number }> = {
  rd: { x: 300, y: 520 },
  rv: { x: 610, y: 340 },
  pw: { x: 610, y: 740 },
  vl: { x: 1310, y: 340 },
  sl: { x: 1310, y: 740 },
  el: { x: 1620, y: 520 },
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
          boxShadow: `0 0 0 ${lerp(2, 7.5, p)}px ${layer.color}88`,
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
// Pull back to the wide shot so the badges sit beside the Mac before the flip. It runs to the
// scene's last frame still moving (no stop), handing its motion straight to the flip.
const ZOOM_OUT: [number, number] = [486, 525];

const useCamera = () => {
  const smooth = Easing.inOut(Easing.cubic);
  return (frame: number) => {
    const fs = CAM_KEYS.map((k) => k.f);
    const fx = interpolate(frame, fs, CAM_KEYS.map((k) => k.x), { ...clamp, easing: smooth });
    const fy = interpolate(frame, fs, CAM_KEYS.map((k) => k.y), { ...clamp, easing: smooth });
    const focus = rec(fx, fy);
    let z: number;
    let tx: number;
    let ty: number;
    if (frame < ZOOM_IN[1]) {
      // Zoom in as a straight zoom about the one point that stays put between the wide shot
      // (identity) and the framing it lands on, in log scale (no sideways arc).
      const e = interpolate(frame, [...ZOOM_IN], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
      const f1 = rec(
        interpolate(ZOOM_IN[1], fs, CAM_KEYS.map((k) => k.x), { ...clamp, easing: smooth }),
        interpolate(ZOOM_IN[1], fs, CAM_KEYS.map((k) => k.y), { ...clamp, easing: smooth }),
      );
      const t1 = { x: CAM_TARGET.x - f1.x * CAM_ZOOM, y: CAM_TARGET.y - f1.y * CAM_ZOOM };
      const fx = -t1.x / (CAM_ZOOM - 1);
      const fy = -t1.y / (CAM_ZOOM - 1);
      z = Math.exp(lerp(0, Math.log(CAM_ZOOM), e));
      tx = fx - z * fx;
      ty = fy - z * fy;
    } else if (frame < ZOOM_OUT[0]) {
      // Following the cursor at full zoom: screen = stage * z + t, focus on CAM_TARGET.
      z = CAM_ZOOM;
      tx = CAM_TARGET.x - focus.x * z;
      ty = CAM_TARGET.y - focus.y * z;
    } else {
      // Pull back to the wide shot as a straight zoom about the one point that stays put
      // (no sideways arc); log-scale so the zoom speed feels even.
      const e = interpolate(frame, [...ZOOM_OUT], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.65, 0.8) });
      const t1 = { x: CAM_TARGET.x - focus.x * CAM_ZOOM, y: CAM_TARGET.y - focus.y * CAM_ZOOM };
      const fx = -t1.x / (CAM_ZOOM - 1);
      const fy = -t1.y / (CAM_ZOOM - 1);
      z = Math.exp(lerp(Math.log(CAM_ZOOM), 0, e));
      tx = fx - z * fx;
      ty = fy - z * fy;
    }
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
  // One smooth ease for both travel and growth, so the badge moves in a straight line and
  // scales up evenly (no arc, no overshoot).
  const fly = interpolate(frame, [at, at + 32], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const grow = fly;
  const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const fill = interpolate(frame, [at + 12, at + 42], [0, 1], { ...clamp, easing: ease });
  if (frame < at) return null;
  // Badge centre travels straight from the screen point to the slot centre, lifting off the glass (shadow).
  const cx = lerp(from.x, slot.x + w / 2, fly);
  const cy = lerp(from.y, slot.y + COL.h / 2, fly);
  const lift = Math.sin(fly * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - COL.h / 2,
        width: w,
        opacity: o,
        transform: `scale(${0.15 + 0.85 * grow})`,
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
export const MAC_FLIP_FRAMES = 122;

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

/**
 * Motion blur by averaging a few sub-frame copies with ordinary alpha blending (copy k drawn
 * at 1/(k+1) over the ones before), so the result is a true average. The additive approach
 * (each copy at 1/N, summed) rounds every colour channel separately at very low values and
 * leaves rainbow banding on smooth gradients like the aluminium lid.
 */
const SmoothMotionBlur: React.FC<{ samples: number; shutter: number; children: React.ReactNode }> = ({ samples, shutter, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      {Array.from({ length: samples }, (_, k) => (
        <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
          <Freeze frame={Math.max(0, frame - (shutter * k) / Math.max(1, samples - 1))}>{children}</Freeze>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

export const LightMacFlip: React.FC = () => (
  <AbsoluteFill style={{ fontFamily }}>
    <Backdrop />
    <SmoothMotionBlur samples={6} shutter={0.5}>
      <MacFlipBody />
    </SmoothMotionBlur>
  </AbsoluteFill>
);

const MacFlipBody: React.FC = () => {
  const frame = useCurrentFrame();
  const io = Easing.bezier(0.65, 0, 0.35, 1);
  const W = MAC_BOX.w;
  const lidH = (W - W * 0.038) * (982 / 1512) + W * 0.019 * 2.2;
  // Beat 4's last frame (hard cut), including its slow drift turn (2° per 700 frames, 525 frames in).
  const from = { left: MAC_BOX.left, top: MAC_BOX.top, w: MAC_BOX.w, rotY: (2 * 525) / 700 };
  // The model is scaled about the hinge centre, so place it where beat 2's (smaller) Mac has its hinge.
  const endScale = INTEGRATED_MAC.w / W;
  const to = {
    left: INTEGRATED_MAC.left + INTEGRATED_MAC.w / 2 - W / 2,
    top: INTEGRATED_MAC.top - lidH * (1 - endScale),
    w: INTEGRATED_MAC.w,
    rotY: 0,
  };

  // One continuous move: it starts already moving on frame 0 (picking up beat 4's pull-back
  // under the crossfade, no hold) and lands softly by frame 76, holding only under the
  // closing crossfade (114–122).
  const lift =
    frame < 88
      ? interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0.35, 0.35, 1) })
      : interpolate(frame, [88, 114], [1, 0], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  // Lid folds half way (about 55°), never shut.
  const half = interpolate(frame, [4, 26, 86, 110], [0, 1, 1, 0], { ...clamp, easing: io });
  // One full turn while the lid is half closed: spread over 2 s with a gentle ease, so it
  // peaks at ~9° a frame (a faster turn strobed at 30 fps).
  // A full turn over ~2.9 s with a gentle ease: at most ~6° a frame, so it reads as smooth motion
  // at 30 fps without motion blur.
  const spin = interpolate(frame, [10, 98], [0, 360], { ...clamp, easing: Easing.bezier(0.38, 0, 0.62, 1) });
  const move = interpolate(frame, [0, 114], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.2, 0.2, 1) });
  const left = lerp(from.left, to.left, move);
  const top = lerp(from.top, to.top, move);
  const scale = lerp(1, endScale, move) * (1 - 0.4 * lift);
  // Head-on at both ends (matches the flat mockup under the crossfades), looking down mid-move.
  const pitch = -24 * lift;
  const lidAngle = -55 * half + 6 * lift;
  // Screen content swaps while the screen faces away (back of the lid towards camera).
  const image = spin < 180 ? "stills/alloc.png" : "stills/layers_start.png";
  const badgesOut = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // While in 3D the laptop is pulled to the middle of the frame (hinge at y 600).
  const dx = (960 - (left + W / 2)) * lift;
  const dy = (600 - (top + lidH)) * lift;
  const cx = left + W / 2 + dx;
  // Camera level with the hinge at rest (deck seen edge-on, like the flat mockup it cuts from),
  // rising to look down on the keyboard as the laptop lifts.
  const cy = top + lidH * (1 - 0.5 * lift) + dy;
  const D = lidH * 0.92;

  return (
    <AbsoluteFill>
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
// The Land-Use Allocation view shows clearly for a moment, then a liquid-glass copy of
// the app's view switcher pops up over the (blurred) screen, the cursor taps "Simulation",
// the screen switches to the simulation view, the camera zooms into the pit until it
// matches the first frame of the satellite-to-ground clip, and the clip takes over.
export const VISION_FRAMES = 258; // TAB.clip (150) + the clip to its landing (98) + a short rest, then a 6-frame dissolve
const VISION_MAC = { left: 460, top: 270, w: 1000 };
const VISION_SCREEN = (() => {
  const bezel = VISION_MAC.w * 0.019;
  const sw = VISION_MAC.w - bezel * 2;
  const sh = (sw * 982) / 1512;
  return { x: VISION_MAC.left + bezel, y: VISION_MAC.top + bezel, w: sw, h: sh };
})();
/** Frames (beat 5) of each step. */
const TAB = {
  // Beat 2's laptop (same recording, same frame) holds still through the short
  // crossfade, then glides to the centre while its screen dissolves into Land-Use Allocation.
  settle: [9, 30],
  toAlloc: [12, 26],
  popIn: 50, // popup appears (1:26.20), after the map has been readable for ~1 s
  cursorIn: [57, 82],
  click: 84,
  slide: [86, 106],
  screenSwap: [100, 112],
  dock: [114, 138], // popup shrinks into the screen's own tab bar
  toCrop: [112, 150], // zoom into the pit (long enough that it never has to brake hard before the clip) until the frame matches the clip's first frame
  clip: 150, // cut to the satellite-to-ground clip (3 s, no holds)
} as const;
const TAB_LABELS = ["Land-Use Allocation", "Comparison", "Simulation"];
const POPUP = { w: 1080, h: 116, pad: 8, cx: 960, cy: 560 };
/** Screenshots sit below a black menu bar, like the screen recordings in the other scenes. */
const MENU = REC.menuBar / REC.height;
const belowMenu: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: `${MENU * 100}%`,
  width: "100%",
  height: `${(1 - MENU) * 100}%`,
  objectFit: "fill",
};
/** The tab bar inside the Simulation screenshot (fractions of the screen). */
const SCREEN_TABS = { cx: 0.499, cy: MENU + (1 - MENU) * (35 / 1255), w: 0.2925 };
/** The clip's first frame is this crop of the Simulation screenshot (screenshot px, 2000×1255). */
/** The AI clip (transition2) opens on ai/start_frame_simulation.png — the 900 × 506 crop at
 * (550, 463) — reframed 1.036× wider, so the camera lands on that wider crop. */
const CLIP_CROP = { x: 534, y: 454, w: 932, h: 524 };
/** Satellite → ground → plant-level view, pre-built as one 30 fps clip (124 frames): the
 * AI dive from the Simulation screen (transition2, 24 → 30 fps at 2×, close to our zoom's speed), its slow ground-level
 * tail sped up 4× so it never stalls, a short dissolve into the ground-to-plant clip
 * (transition-ground-plant-2, 24 → 30 fps at 1×), which tips up to the simulation's low view. */
const SATELLITE_CLIP = "seedance/satellite_to_plant.mp4";
/** Clip frame where the tip-up has come to rest; the clip holds it under the dissolve. */
const CLIP_REST = 98;
/** The clip is entered on its first frame (it is already moving there). */
const CLIP_TRIM_SCALE = 1;
/** Zoom speed of the clip's first frames (log-scale per frame), matched by our zoom in. */
const CLIP_ZOOM_RATE = 0.11; // the dive is re-timed to this steady speed (log-scale per frame) until it eases out
/** The clip's resting frame vs the simulation's first (as beat 6 shows it, cover-fitted at 1×):
 * same hill and rocks, framed differently — best uniform match (gradient correlation 0.88 on the
 * ridge and rocks; uniform so the picture never stretches) is the clip scaled 1.08× about the
 * centre and moved 56 px right, 32 px up.
 * The clip eases into that alignment as its tip-up settles, then both hold still while they
 * dissolve, so the view lands exactly on the simulation's. */
const CLIP_ALIGN = { sx: 1.08, sy: 1.08, tx: 56, ty: -32, frames: [150 + CLIP_REST - 20, 150 + CLIP_REST] as const };
const CLIP_DISSOLVE = 4;
/** Beat 2 (196 frames) overlaps beat 5 by an 8-frame fade, so beat 5's frame 0 is beat 2's frame 188. */
const INTEGRATED_FRAMES = 196;
const INTO_VISION_FADE = 8;
const INTEGRATED_AT_START = INTEGRATED_FRAMES - INTO_VISION_FADE;

/** Liquid-glass segmented control. The selection is a lens spanning tab `trail` → tab `lead`
 * (fractional indices): the leading edge runs ahead, the trailing edge catches up, and the
 * lens lifts (`lift` 0 → 1) off the bar while it moves, like iOS 26 liquid glass. */
const GlassTabs: React.FC<{ lead: number; trail: number; lift: number; pressed: boolean }> = ({ lead, trail, lift, pressed }) => {
  const segW = (POPUP.w - POPUP.pad * 2) / TAB_LABELS.length;
  const pillL = POPUP.pad + Math.min(lead, trail) * segW;
  const pillR = POPUP.pad + (Math.max(lead, trail) + 1) * segW;
  const pillH = POPUP.h - POPUP.pad * 2;
  return (
    <div
      style={{
        position: "relative",
        width: POPUP.w,
        height: POPUP.h,
        borderRadius: POPUP.h / 2,
        background: "linear-gradient(180deg, rgba(252,252,250,0.9) 0%, rgba(246,246,243,0.82) 100%)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        boxShadow:
          "0 0 0 1.5px rgba(255,255,255,0.9), 0 0 0 2.5px rgba(0,0,0,0.05), inset 0 2px 1px rgba(255,255,255,1), inset 0 -2px 3px rgba(0,0,0,0.05), 0 34px 70px -24px rgba(0,0,0,0.32), 0 10px 22px -10px rgba(0,0,0,0.16)",
        fontFamily,
      }}
    >
      {/* Dividers between unselected tabs; they fade as the lens reaches them */}
      {[1, 2].map((i) => {
        const x = POPUP.pad + i * segW;
        const gap = Math.max(pillL - x, x - pillR, 0);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: POPUP.h * 0.3,
              width: 1.5,
              height: POPUP.h * 0.4,
              background: "rgba(0,0,0,0.12)",
              opacity: Math.min(gap / 24, 1),
            }}
          />
        );
      })}
      {/* The selection lens: solid grey at rest, a lifted clear-glass droplet while moving */}
      <div
        style={{
          position: "absolute",
          left: pillL,
          top: POPUP.pad,
          width: pillR - pillL,
          height: pillH,
          borderRadius: pillH / 2,
          scale: `${1 + 0.04 * lift} ${1 + 0.14 * lift}`,
          background: `linear-gradient(180deg, rgba(${lerp(226, 240, lift)},${lerp(226, 240, lift)},${lerp(223, 238, lift)},1) 0%, rgba(${lerp(222, 226, lift)},${lerp(222, 228, lift)},${lerp(219, 228, lift)},1) 100%)`,
          boxShadow: `0 0 0 ${1.5 * lift}px rgba(255,255,255,${0.9 * lift}), inset 0 1px 0 rgba(255,255,255,${0.6 + 0.4 * lift}), inset 0 -2px 4px rgba(0,0,0,${0.03 + 0.05 * lift}), 0 ${10 * lift}px ${26 * lift}px rgba(0,0,0,${0.16 * lift})`,
        }}
      />
      {TAB_LABELS.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: POPUP.pad + i * segW,
            top: 0,
            width: segW,
            height: POPUP.h,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 500,
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
            color: "#3A3A3C",
            scale: pressed && i === 2 ? 0.96 : 1,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

const Cursor: React.FC<{ x: number; y: number; scale: number; opacity: number }> = ({ x, y, scale, opacity }) => (
  <svg width={46} height={46} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, scale, opacity, transformOrigin: "0 0" }}>
    <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
);

export const LightVisionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const io = Easing.bezier(0.65, 0, 0.35, 1);

  // Popup: spring in, then dock into the screenshot's own tab bar.
  // Grows and fades in together with one soft ease (no overshoot), in step with the blur.
  const popIn = interpolate(frame, [TAB.popIn - 2, TAB.popIn + 20], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  const popFade = interpolate(frame, [TAB.popIn - 2, TAB.popIn + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.67, 1) });
  const dock = interpolate(frame, [...TAB.dock], [0, 1], { ...clamp, easing: io });
  const dockX = VISION_SCREEN.x + VISION_SCREEN.w * SCREEN_TABS.cx;
  const dockY = VISION_SCREEN.y + VISION_SCREEN.h * SCREEN_TABS.cy;
  const dockScale = (VISION_SCREEN.w * SCREEN_TABS.w) / POPUP.w;

  // Selection 0 → 2: the leading edge reaches "Simulation" first, the trailing edge follows,
  // and the lens lifts off the bar for the trip, settling back as it lands.
  const [s0, s1] = TAB.slide;
  const lead = 2 * interpolate(frame, [s0, s1 - 4], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  const trail = 2 * interpolate(frame, [s0 + 3, s1], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.25, 1) });
  const lift = interpolate(frame, [s0 - 2, s0 + 5, s1 - 5, s1 + 2], [0, 1, 1, 0], { ...clamp, easing: io });
  const pressed = frame >= TAB.click && frame < TAB.click + 6;

  // Cursor: in from the lower right to the "Simulation" tab, click, then leave with the popup.
  const segW = (POPUP.w - POPUP.pad * 2) / 3;
  const target = { x: POPUP.cx - POPUP.w / 2 + POPUP.pad + 2.5 * segW, y: POPUP.cy + 4 };
  const cIn = interpolate(frame, [...TAB.cursorIn], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cursorOpacity = interpolate(frame, [TAB.cursorIn[0], TAB.cursorIn[0] + 6, TAB.dock[0], TAB.dock[0] + 10], [0, 1, 1, 0], clamp);

  // Screen content: beat 2's recording → Land-Use Allocation → Simulation.
  const allocIn = interpolate(frame, [...TAB.toAlloc], [0, 1], clamp);
  const simIn = interpolate(frame, [...TAB.screenSwap], [0, 1], clamp);
  // The screen goes soft while the tab bar is up, so the bar reads clearly.
  // Eased in and out; drawn as a blurred copy fading over the sharp screen, so the blur grows
  // smoothly and the screen keeps its size (a growing blur radius needed a scale-up to hide its
  // dark edges).
  const BLUR_PX = 14;
  const screenBlur =
    interpolate(frame, [TAB.popIn - 2, TAB.popIn + 16], [0, 1], { ...clamp, easing: io }) *
    interpolate(frame, [TAB.dock[0], TAB.dock[0] + 24], [1, 0], { ...clamp, easing: io });

  // Start exactly on beat 2's laptop (position, size and its slight drift turn), then settle.
  const settle = interpolate(frame, [...TAB.settle], [0, 1], { ...clamp, easing: io });
  const fromScale = INTEGRATED_MAC.w / VISION_MAC.w;
  const macTranslate = `${(INTEGRATED_MAC.left - VISION_MAC.left) * (1 - settle)}px ${(INTEGRATED_MAC.top - VISION_MAC.top) * (1 - settle)}px`;
  const macScale = lerp(fromScale, 1, settle);
  const driftTurn = ((2 * (INTEGRATED_AT_START + frame)) / 700) * (1 - settle);

  // Zoom (no rotation) into the pit until the frame shows exactly CLIP_CROP, then cut to the clip.
  const k = VISION_SCREEN.w / 2000; // screenshot px → frame px
  const crop = {
    x: VISION_SCREEN.x + (CLIP_CROP.x + CLIP_CROP.w / 2) * k,
    y: VISION_SCREEN.y + VISION_SCREEN.h * MENU + (CLIP_CROP.y + CLIP_CROP.h / 2) * k,
  };
  const toCrop = interpolate(frame, [...TAB.toCrop], [0, 1], { ...clamp, easing: io });
  // Log-space zoom that never stops: it reaches the crop exactly at the cut while still
  // moving at the clip's opening speed, then keeps going under a short dissolve into the clip
  // (no hold, and the dissolve hides the small sharpness/colour difference).
  const cropLog = Math.log(1920 / (CLIP_CROP.w * k)) + Math.log(CLIP_TRIM_SCALE);
  const zoomT = (frame - TAB.toCrop[0]) / (TAB.toCrop[1] - TAB.toCrop[0]);
  const exitLog = CLIP_ZOOM_RATE * (TAB.toCrop[1] - TAB.toCrop[0]); // log-speed at the cut, over the span
  const camLog =
    zoomT <= 0
      ? 0
      : zoomT <= 1
        ? (-2 * zoomT ** 3 + 3 * zoomT ** 2) * cropLog + (zoomT ** 3 - zoomT ** 2) * exitLog
        : cropLog + CLIP_ZOOM_RATE * (frame - TAB.toCrop[1]);
  const camScale = Math.exp(camLog);
  const clipIn = interpolate(frame, [TAB.clip, TAB.clip + CLIP_DISSOLVE], [0, 1], clamp);
  const align = interpolate(frame, [...CLIP_ALIGN.frames], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.3, 1) });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          top: 110,
          width: "100%",
          textAlign: "center",
          zIndex: 2,
          opacity: interpolate(frame, [TAB.toCrop[0] - 6, TAB.toCrop[0] + 8], [1, 0], clamp),
        }}
      >
        <BlurIn delay={10}>
          <SilverText size={88}>Beyond the map.</SilverText>
        </BlurIn>
      </div>
      {/* Camera: zooms into the pit on the screen */}
      <AbsoluteFill
        style={{
          transformOrigin: `${crop.x}px ${crop.y}px`,
          translate: `${(960 - crop.x) * toCrop}px ${(540 - crop.y) * toCrop}px`,
          scale: camScale,
          // Stays fully opaque under the clip's fade-in (fading both at once let the light
          // background show through: a flash), then hides once the clip is fully in.
          opacity: clipIn < 1 ? 1 : 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: VISION_MAC.left,
            top: VISION_MAC.top,
            translate: macTranslate,
            scale: macScale,
            transformOrigin: "0 0",
            perspective: 2400,
          }}
        >
          <div style={{ transform: `rotateY(${driftTurn}deg)` }}>
            <MacBook width={VISION_MAC.w}>
              {/* While blurred: an enlarged, equally blurred copy underneath fills the soft edge of
                  the blurred screen, so the blur has no dark rim and the screen keeps its size. */}
              {screenBlur > 0.005 ? (
                <div style={{ position: "absolute", inset: 0, scale: 1.08, filter: `blur(${BLUR_PX * screenBlur}px)` }}>
                  <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: `${MENU * 100}%`, background: "#000" }} />
                  <Img src={staticFile("stills/allocation_ui.png")} style={{ ...belowMenu }} />
                  <Img src={staticFile("stills/simulation_ui.png")} style={{ ...belowMenu, opacity: simIn }} />
                </div>
              ) : null}
              <div style={{ position: "absolute", inset: 0, filter: screenBlur > 0.005 ? `blur(${BLUR_PX * screenBlur}px)` : undefined }}>
                {allocIn < 1 ? (
                  <Video
                    src={staticFile("recordings/takeF_layers.mp4")}
                    trimBefore={30 + INTEGRATED_AT_START}
                    muted
                    objectFit="fill"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                ) : null}
                <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: `${MENU * 100}%`, background: "#000", opacity: allocIn }} />
                <Img src={staticFile("stills/allocation_ui.png")} style={{ ...belowMenu, opacity: allocIn }} />
                <Img src={staticFile("stills/simulation_ui.png")} style={{ ...belowMenu, opacity: simIn }} />
              </div>
            </MacBook>
          </div>
        </div>
        {frame >= TAB.popIn && dock < 1 ? (
          <div
            style={{
              position: "absolute",
              left: lerp(POPUP.cx, dockX, dock) - POPUP.w / 2,
              top: lerp(POPUP.cy, dockY, dock) - POPUP.h / 2,
              opacity: popFade * interpolate(dock, [0.75, 1], [1, 0], clamp),
              scale: lerp(0.7 + 0.3 * popIn, dockScale, dock),
              filter: `blur(${(1 - popFade) * 16}px)`,
            }}
          >
            <GlassTabs lead={lead} trail={trail} lift={lift} pressed={pressed} />
          </div>
        ) : null}
      </AbsoluteFill>
      {/* Satellite → ground → plant-level view (generated clips); starts on the zoomed frame above */}
      <Sequence from={TAB.clip} premountFor={60}>
        {/* Outer: the simulation's fixed 1.3× framing; inner: clip → simulation alignment */}
        <AbsoluteFill style={{ scale: lerp(1, SIM_SCALE, align), transformOrigin: SIM_ORIGIN }}>
        <AbsoluteFill
          style={{
            opacity: clipIn,
            scale: `${lerp(1, CLIP_ALIGN.sx, align)} ${lerp(1, CLIP_ALIGN.sy, align)}`,
            translate: `${CLIP_ALIGN.tx * align}px ${CLIP_ALIGN.ty * align}px`,
          }}
        >
          <Freeze frame={CLIP_REST} active={(f) => f >= CLIP_REST}>
            <Video src={staticFile(SATELLITE_CLIP)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
          </Freeze>
        </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      {cursorOpacity > 0 ? (
        <Cursor
          x={lerp(1500, target.x, cIn)}
          y={lerp(980, target.y, cIn)}
          scale={pressed ? 0.88 : 1}
          opacity={cursorOpacity}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Beat 6 ---------- */

/** Beat 6 part A: the growth simulation plays straight away, slowed so its growth
 * (clip frames 3 → 66) spans GROW_FRAMES while the badge counts Year 0 → 30. */
const GROWTH_SRC = "recordings/simulation_growth.mp4";
/** Clip frames (30 fps) where growth starts and finishes. */
const GROW_CLIP = [3, 66] as const;
const GROW_FRAMES = 210; // 7 s: the counter reaches 30 just before "30 years" is said
const GROW_RATE = (GROW_CLIP[1] - GROW_CLIP[0]) / GROW_FRAMES;
/** Tilt up to the sky after the forest has grown; the scene ends shortly after. */
/** The forest holds while "See what your land could become 30 years from now" is read;
 * the tilt to the sky starts on "Starting today". */
const SKY_PAN = [340, 400] as const;
export const THREED_FRAMES = 415;
const SKY = "#AAD0EC"; // the clip's sky at its top edge
/** The simulation opens framed 1.3× (anchored at the centre of the ground line) so the grown
 * trees fill the frame — beat 5's clip lands on exactly this framing — then creeps in slowly
 * (to SIM_SCALE_END) from the same anchor while the forest grows. */
export const SIM_SCALE = 1.3;
const SIM_SCALE_END = 1.65;
export const SIM_ORIGIN = "50% 100%";
/** End-card background tone; the sky above the simulation fades into it. */
const END_TONE = "#F3F2EF";
/** How far the tilt to the sky moves the shot: the footage is 1080 × SIM_SCALE_END tall once
 * pushed in (bottom-anchored), so it must travel that far plus a margin for the treetops to
 * leave the frame entirely before the end card. */
const SKY_PAN_DIST = 1080 * 1.65 + 300;
const SKY_HIGH = "#DCEBF6";
/** Last scene frame the clip still has footage for; it holds there afterwards. */
const GROW_LAST = Math.floor((180 - GROW_CLIP[0] - 1) / GROW_RATE);
/** The simulation holds its first frame while beat 5's clip dissolves into it (same view, both
 * still), then the growth starts. */
const GROW_HOLD = 6;
/** Scene frame where the Year counter reaches 30 (1:41 in the light cut). */
const YEAR_30_AT = 334;
const growthFill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export const LightThreeDScene: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  // The counter reaches Year 30 at scene frame 339 (1:41 in the light cut; it was 1:51 before
  // the intro was shortened). It runs past the growth clip, which finishes earlier.
  const year = interpolate(frame, [GROW_HOLD, YEAR_30_AT], [0, 30], clamp);
  // Once grown, the camera tilts up past the treetops (they fade into the sky and leave the
  // frame), so the end card dissolves in from clear sky.
  const pan = interpolate(frame, [...SKY_PAN], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  // Every overlay leaves before the tilt to the sky: each part slides off towards its side and
  // fades, a few frames after the one before (follow-through).
  const exitAt = SKY_PAN[0] - 30;
  // Slow push in from the centre-bottom anchor: starts once the dissolve hold is over and
  // finishes as the tilt to the sky begins (a push still running during the tilt moved the
  // apparent anchor off the bottom edge). Eases out only, so it is already moving from the start.
  const simScale = interpolate(frame, [GROW_HOLD, SKY_PAN[0]], [SIM_SCALE, SIM_SCALE_END], { ...clamp, easing: Easing.bezier(0.3, 0.25, 0.45, 1) });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <AbsoluteFill>
        {/* The growth simulation full-screen (no laptop), continuing from the ground shot */}
        {/* Fixed framing: it opens on exactly the view the ground-to-plant clip lands on */}
        <AbsoluteFill style={{ scale: simScale, transformOrigin: SIM_ORIGIN, translate: `0px ${pan * SKY_PAN_DIST}px` }}>
          {/* One video element the whole time (swapping elements made the preview blink) */}
          <Freeze frame={GROW_HOLD} active={frame < GROW_HOLD}>
            <Sequence from={GROW_HOLD} layout="none">
              <Freeze frame={GROW_LAST} active={(f) => f >= GROW_LAST}>
                <Video
                  src={staticFile(GROWTH_SRC)}
                  muted
                  trimBefore={GROW_CLIP[0]}
                  playbackRate={GROW_RATE}
                  objectFit="cover"
                  style={growthFill}
                />
              </Freeze>
            </Sequence>
          </Freeze>
          {/* The clip's top edge melts into sky, and more sky continues above it for the tilt-up */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 260, background: `linear-gradient(180deg, ${SKY} 0%, rgba(170,208,236,0) 100%)` }} />
          {/* Tall enough that the tilt never reaches its edge; it ends on the end card's own tone,
              so the dissolve into it is soft */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -2400,
              height: 2401,
              background: `linear-gradient(180deg, ${END_TONE} 0%, ${END_TONE} 45%, #E8EEF1 62%, ${SKY_HIGH} 80%, ${SKY} 100%)`,
            }}
          />
        </AbsoluteFill>
        {/* Light copy straight over the footage (no backdrop panel), kept legible with soft shadows */}
        {/* Left: native species flying into their zones on the site map */}
        <NativeSpecies exitAt={exitAt} />
        <div style={{ position: "absolute", left: 1340, top: 260, width: 520, display: "flex", flexDirection: "column", gap: 24 }}>
          <Exit at={exitAt} order={0} dir={1} style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <Eyebrow delay={8} color="rgba(255,255,255,0.92)">3D reclamation plan</Eyebrow>
          </Exit>
          <Exit at={exitAt} order={1} dir={1}>
          <BlurIn delay={18}>
            <div style={{ fontFamily, fontSize: 64, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.04, color: "#FFFFFF", textShadow: "0 3px 16px rgba(0,0,0,0.45)" }}>Explore it in 3D.</div>
          </BlurIn>
          </Exit>
          <Exit at={exitAt} order={2} dir={1}>
          <PopIn delay={34} fromY={-40}>
            <GlassBadge>
              <div style={{ fontSize: 20, color: theme.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Growth horizon</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 34, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>Year {Math.floor(year)}</span>
                <span style={{ fontSize: 24, fontWeight: 600, color: theme.muted }}>→ 30</span>
              </div>
              <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: "rgba(0,0,0,0.08)" }}>
                <div style={{ width: `${(year / 30) * 100}%`, height: 6, borderRadius: 3, background: colors.forestry }} />
              </div>
            </GlassBadge>
          </PopIn>
          </Exit>
          <Exit at={exitAt} order={3} dir={1}>
          <PopIn delay={70} fromY={-40}>
            <GlassBadge>
              <div style={{ fontSize: 20, color: theme.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Projected onto</div>
              <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>Your actual terrain</div>
            </GlassBadge>
          </PopIn>
          </Exit>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

/* ---------- Outro ---------- */
/** End-card app icon: the G mark is about the wordmark's cap height (150 px Inter ≈ 109 px caps),
 * in a tile that frames it tightly rather than dwarfing it. */
const OUTRO_ICON = 132;
const OUTRO_MARK = 0.8;
/** "Download on the App Store" badge (black, per Apple's badge style). */
const AppStoreBadge: React.FC = () => (
  <div
    style={{
      marginTop: 44,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 30px 14px 24px",
      borderRadius: 18,
      background: "#000",
      boxShadow: "0 0 0 2px #A6A6A6, 0 24px 48px -20px rgba(0,0,0,0.45)",
      color: "#fff",
      fontFamily,
    }}
  >
    <svg width={50} height={50} viewBox="0 0 24 24" fill="#fff">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "0.01em" }}>Download on the</span>
      <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>App Store</span>
    </div>
  </div>
);

export const LightOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const icon = interpolate(frame, [6, 36], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      {/* Topographic contour map revealed from the centre; a soft wash keeps the copy clear */}
      <ContourLines />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 760px 420px at 50% 50%, rgba(243,242,239,0.92) 0%, rgba(243,242,239,0.7) 55%, rgba(243,242,239,0) 100%)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Lockup: icon sized to the wordmark, sitting on its left */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              width: OUTRO_ICON,
              height: OUTRO_ICON,
              borderRadius: OUTRO_ICON * 0.225,
              flexShrink: 0,
              background: "linear-gradient(180deg, #FFFFFF 0%, #ECECEE 100%)",
              boxShadow: "0 28px 56px -20px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: 0.6 + 0.4 * icon,
              opacity: interpolate(frame, [6, 18], [0, 1], clamp),
            }}
          >
            <Img src={staticFile("logo-a.svg")} style={{ width: OUTRO_ICON * OUTRO_MARK, height: OUTRO_ICON * OUTRO_MARK }} />
          </div>
          <BlurIn delay={20} duration={44}>
            <SilverText size={150}>GeoWise</SilverText>
          </BlurIn>
        </div>
        <WipeIn delay={62} duration={40}>
          <div style={{ marginTop: 40, fontSize: 52, fontWeight: 600, color: theme.text, letterSpacing: "-0.02em" }}>
            Mind your future mining site.
          </div>
        </WipeIn>
        <BlurIn delay={100} duration={36}>
          <div style={{ marginTop: 20, color: theme.muted, fontSize: 24, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Land-use suitability · 3D reclamation planning
          </div>
        </BlurIn>
        <PopIn delay={135} fromY={30}>
          <AppStoreBadge />
        </PopIn>
      </div>
    </AbsoluteFill>
  );
};
