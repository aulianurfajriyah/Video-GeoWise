import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Video } from "@remotion/media";
import { colors, EASE_OUT, fontFamily, REC, useTheme } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Deep navy cinematic background with a masked grid and animated film grain. */
export const Backdrop: React.FC<{ glow?: string }> = ({ glow = colors.navy }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  if (theme.mode === "light") {
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1500px 1000px at 50% 30%, #FFFFFF 0%, #F3F2EF 45%, #E4E2DD 100%)",
        }}
      >
        <AbsoluteFill
          style={{
            backgroundSize: "80px 80px",
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
            maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            translate: `0px ${(frame * 0.25) % 80}px`,
          }}
        />
        <AbsoluteFill style={{ opacity: 0.5 }}>
          <Grain />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1400px 900px at 50% 38%, ${glow} 0%, ${colors.bgTop} 48%, ${colors.bgDeep} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundSize: "80px 80px",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 72%)",
          translate: `0px ${(frame * 0.25) % 80}px`,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Silver matte gradient headline text (from the cinematic hero inspiration). */
export const SilverText: React.FC<{
  children: React.ReactNode;
  size: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size, weight = 800, style }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        fontFamily,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.04,
        background: theme.headline,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: theme.headlineShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Text that blurs + rises in from `delay` frames. */
export const BlurIn: React.FC<{
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, duration = 36, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
  return (
    <div
      style={{
        opacity: p,
        translate: `0px ${(1 - p) * 50}px`,
        scale: 0.92 + 0.08 * p,
        filter: `blur(${(1 - p) * 18}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Left-to-right clip reveal. */
export const WipeIn: React.FC<{
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, duration = 34, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [100, 0], {
    ...clamp,
    easing: Easing.bezier(0.76, 0, 0.24, 1),
  });
  return <div style={{ clipPath: `inset(-20% ${p}% -20% 0)`, ...style }}>{children}</div>;
};

/** Frosted glass badge. */
export const GlassBadge: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        fontFamily,
        color: theme.text,
        borderRadius: 24,
        padding: "20px 26px",
        background: theme.glassBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: theme.glassShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pops a child in with a springy scale from `delay`. */
export const PopIn: React.FC<{
  delay: number;
  children: React.ReactNode;
  fromX?: number;
  fromY?: number;
  style?: React.CSSProperties;
}> = ({ delay, children, fromX = 0, fromY = 40, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 26], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const o = interpolate(frame, [delay, delay + 12], [0, 1], clamp);
  return (
    <div
      style={{
        opacity: o,
        scale: 0.75 + 0.25 * p,
        translate: `${fromX * (1 - p)}px ${fromY * (1 - p)}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A screen recording presented as a floating app window.
 * `width` is the on-screen width; the menu bar is cropped away.
 * `focus` zooms into part of the recording (in recording pixels).
 */
export const AppWindow: React.FC<{
  src: string;
  width: number;
  trimBefore?: number;
  playbackRate?: number;
  zoom?: number;
  focusX?: number;
  focusY?: number;
  crop?: { x: number; y: number; w: number; h: number };
  style?: React.CSSProperties;
}> = ({ src, width, trimBefore, playbackRate, zoom = 1, focusX, focusY, crop, style }) => {
  const visible = crop ?? { x: 0, y: REC.menuBar, w: REC.width, h: REC.height - REC.menuBar };
  const height = (width * visible.h) / visible.w;
  const s = (width / visible.w) * zoom;
  const fx = focusX ?? visible.x + visible.w / 2;
  const fy = focusY ?? visible.y + visible.h / 2;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        background: "#f3f3f3",
        boxShadow:
          "0 50px 120px -20px rgba(0,0,0,0.9), 0 20px 40px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.14)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: REC.width,
          height: REC.height,
          left: width / 2 - fx * s,
          top: height / 2 - fy * s,
          transformOrigin: "0 0",
          scale: s,
        }}
      >
        <Video
          src={staticFile(src)}
          trimBefore={trimBefore}
          playbackRate={playbackRate}
          muted
          style={{ width: REC.width, height: REC.height }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(110deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 40%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "linear-gradient(180deg, #FFFFFF 0%, #E4E4E7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow:
        "0 30px 60px -15px rgba(0,0,0,0.85), inset 0 -3px 6px rgba(0,0,0,0.08), inset 0 1px 1px #fff",
      ...style,
    }}
  >
    <Img src={staticFile("logo-a.svg")} style={{ width: size * 0.62, height: size * 0.62 }} />
  </div>
);

/** Deterministic pseudo-random helper for procedural graphics. */
export const rnd = (seed: string) => random(seed);
