import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
  children: React.ReactNode;
}> = ({ left, top, delay = 0, turn = -14, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 55], [0, 1], { ...clamp, easing: ease });
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
export const LightOneClickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLICK = 84;
  const t = interpolate(frame, [30, CLICK - 4], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cx = interpolate(t, [0, 1], [1500, 1010]);
  const cy = interpolate(t, [0, 1], [930, 640]);
  const pressed = frame >= CLICK && frame < CLICK + 8;
  const ripple = interpolate(frame, [CLICK, CLICK + 40], [0, 1], clamp);
  const flash = interpolate(frame, [CLICK + 4, CLICK + 18, CLICK + 60], [0, 0.85, 0], clamp);
  const btnIn = interpolate(frame, [6, 42], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center" }}>
        <BlurIn delay={0}>
          <SilverText size={100}>And then, just one click.</SilverText>
        </BlurIn>
      </div>
      {/* GeoWise-style black pill button */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 960 - 330,
          width: 660,
          height: 132,
          borderRadius: 66,
          opacity: btnIn,
          scale: (0.85 + 0.15 * btnIn) * (pressed ? 0.95 : 1),
          background: "#111113",
          boxShadow: `0 30px 60px -18px rgba(0,0,0,0.45), 0 0 0 ${14 * ripple}px rgba(17,17,19,${0.12 * (1 - ripple)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          color: "#fff",
          fontSize: 44,
          fontWeight: 700,
        }}
      >
        Run land-use analysis
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1000 - 420 * ripple,
          top: 640 - 420 * ripple,
          width: 840 * ripple,
          height: 840 * ripple,
          borderRadius: "50%",
          border: `3px solid rgba(17,17,19,${0.5 * (1 - ripple)})`,
        }}
      />
      <svg width={56} height={56} viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, scale: pressed ? 0.86 : 1, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))" }}>
        <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
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
      <MacStage left={110} top={230} turn={16}>
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
