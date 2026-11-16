import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BlurIn } from "../components";
import { fontFamily } from "../theme";

/* Captions over the opening drone footage, centred in the 1920 × 1080 footage frame. They live
   inside the footage itself, so once it turns out to be a QuickTime window they shrink and
   minimise (genie) with it. */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CAPTION_1 = { lines: ["Every mine eventually closes."], delay: 30, out: 300 };
export const CAPTION_2 = { lines: ["What comes next?", "Planning it means juggling scattered data."], delay: 312 };

const SIZE = [92, 56];
const WEIGHT = [800, 500];
const GAP = 14;
/** How far above the frame's centre the captions (and their shade) sit, px in the 1080 frame. */
const LIFT = 0;
const SHADE = `radial-gradient(ellipse 70% 60% at 50% ${50 - (LIFT / 1080) * 100}%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 100%)`;

const lineStyle = (i: number): React.CSSProperties => ({
  color: "#fff",
  fontSize: SIZE[i ? 1 : 0],
  fontWeight: WEIGHT[i ? 1 : 0],
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
  textShadow: "0 10px 40px rgba(0,0,0,0.55)",
  marginTop: i === 0 ? 0 : GAP,
});

/** One centred caption block; `out` fades it (omit to keep it until the footage is gone). */
const Caption: React.FC<{ lines: string[]; delay: number; out?: number; still?: boolean }> = ({ lines, delay, out, still }) => {
  const frame = useCurrentFrame();
  const o = out === undefined ? 1 : interpolate(frame, [out - 18, out], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", opacity: o, fontFamily }}>
      <div style={{ transform: `translateY(${-LIFT}px)` }}>
        {lines.map((l, i) =>
          still ? (
            <div key={l} style={lineStyle(i)}>
              {l}
            </div>
          ) : (
            <BlurIn key={l} delay={delay + i * 22} duration={30}>
              <div style={lineStyle(i)}>{l}</div>
            </BlurIn>
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Shade + both captions, animated (frames of the intro). */
export const FootageCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const shade = interpolate(frame, [CAPTION_1.delay - 10, CAPTION_1.delay + 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: SHADE, opacity: shade }} />
      <Caption {...CAPTION_1} />
      <Caption {...CAPTION_2} />
    </AbsoluteFill>
  );
};

/** The second caption, fully in, for the window's still frame (1920 × 1080 box). */
export const StillCaption: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: SHADE }} />
    <Caption lines={CAPTION_2.lines} delay={0} still />
  </AbsoluteFill>
);

/** Draws StillCaption onto a canvas over the video area (x, y, w: its rect in canvas units). */
export const drawStillCaption = (g: CanvasRenderingContext2D, x: number, y: number, w: number) => {
  const q = w / 1920;
  const h = 1080 * q;
  g.save();
  g.translate(x + w / 2, y + h / 2 - LIFT * q);
  // Shade: the CSS ellipse (70% × 60% radii) as a scaled radial gradient.
  g.save();
  g.scale((0.7 * w) / (0.6 * h), 1);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, 0.6 * h);
  rg.addColorStop(0, "rgba(0,0,0,0.42)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect((-w / 2) * ((0.6 * h) / (0.7 * w)), -h / 2, w * ((0.6 * h) / (0.7 * w)), h);
  g.restore();
  const lh = SIZE.map((s) => s * 1.1 * q);
  const total = lh[0] + GAP * q + lh[1];
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#fff";
  g.shadowColor = "rgba(0,0,0,0.55)";
  g.shadowBlur = 40 * q;
  g.shadowOffsetY = 10 * q;
  CAPTION_2.lines.forEach((l, i) => {
    const s = SIZE[i] * q;
    g.font = `${WEIGHT[i]} ${s}px ${fontFamily}`;
    if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${-0.03 * s}px`;
    const cy = -total / 2 + (i === 0 ? lh[0] / 2 : lh[0] + GAP * q + lh[1] / 2);
    g.fillText(l, 0, cy);
  });
  g.restore();
};
