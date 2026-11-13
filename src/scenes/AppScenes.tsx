import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindow, Backdrop, BlurIn, GlassBadge, PopIn, SilverText, WipeIn } from "../components";
import { colors, EASE_OUT, fontFamily } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Window entrance: rises out of depth with a 3D tilt. */
const useWindowIn = (delay = 0, duration = 46) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...EASE_OUT),
  });
};

const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <BlurIn delay={delay} duration={24}>
    <div
      style={{
        color: "#93B4FF",
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  </BlurIn>
);

/* ---------- Beat 2: Every layer. Every factor. One integrated analysis. ---------- */
export const IntegratedScene: React.FC = () => {
  const p = useWindowIn(0, 50);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 120, top: 330, width: 640, display: "flex", flexDirection: "column", gap: 10 }}>
        <BlurIn delay={8}>
          <SilverText size={84}>Every layer.</SilverText>
        </BlurIn>
        <BlurIn delay={40}>
          <SilverText size={84}>Every factor.</SilverText>
        </BlurIn>
        <WipeIn delay={88} duration={40} style={{ marginTop: 28 }}>
          <div style={{ fontSize: 50, fontWeight: 700, color: "#93B4FF", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            One integrated analysis.
          </div>
        </WipeIn>
      </div>
      <div style={{ position: "absolute", left: 790, top: 160, perspective: 1800 }}>
        <div
          style={{
            opacity: p,
            transform: `translateZ(${(1 - p) * -400}px) rotateY(${(1 - p) * -24}deg) rotateX(${(1 - p) * 12}deg)`,
          }}
        >
          <AppWindow src="recordings/takeF_layers.mp4" width={1060} trimBefore={30} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Beat 3: And then, just one click. ---------- */
const Cursor: React.FC<{ x: number; y: number; pressed: boolean }> = ({ x, y, pressed }) => (
  <svg
    width={56}
    height={56}
    viewBox="0 0 24 24"
    style={{ position: "absolute", left: x, top: y, scale: pressed ? 0.86 : 1, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}
  >
    <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#fff" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);

export const OneClickScene: React.FC = () => {
  const frame = useCurrentFrame();
  const CLICK = 84;
  const t = interpolate(frame, [30, CLICK - 4], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cx = interpolate(t, [0, 1], [1500, 1010]);
  const cy = interpolate(t, [0, 1], [930, 640]);
  const pressed = frame >= CLICK && frame < CLICK + 8;
  const ripple = interpolate(frame, [CLICK, CLICK + 40], [0, 1], clamp);
  const flash = interpolate(frame, [CLICK + 4, CLICK + 18, CLICK + 60], [0, 0.55, 0], clamp);
  const btnIn = useWindowIn(6, 36);
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center" }}>
      <Backdrop glow="#1B3A8A" />
      <div style={{ position: "absolute", top: 270, width: "100%", textAlign: "center" }}>
        <BlurIn delay={0}>
          <SilverText size={100}>And then, just one click.</SilverText>
        </BlurIn>
      </div>
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
          background: "linear-gradient(180deg, #27272A 0%, #111114 100%)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.14), 0 30px 60px -12px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -3px 6px rgba(0,0,0,0.8), 0 0 ${80 * ripple}px rgba(59,130,246,${0.6 * (1 - ripple)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          color: "#fff",
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#93B4FF" strokeWidth={2} strokeLinecap="round">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
        </svg>
        Run land-use analysis
      </div>
      <div
        style={{
          position: "absolute",
          left: 1000 - 400 * ripple,
          top: 640 - 400 * ripple,
          width: 800 * ripple,
          height: 800 * ripple,
          borderRadius: "50%",
          border: `3px solid rgba(147,180,255,${1 - ripple})`,
        }}
      />
      <Cursor x={cx} y={cy} pressed={pressed} />
      <AbsoluteFill style={{ background: "#BFD3FF", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/* ---------- Beat 4: suitability map + area per zone ---------- */
const ZONES = [
  { name: "Forestry", ha: 200.85, color: colors.forestry, delay: 120 },
  { name: "Agroforestry", ha: 102.15, color: colors.agriculture, delay: 160 },
  { name: "Recreation", ha: 12.6, color: colors.recreation, delay: 200 },
  { name: "Industrial", ha: 0, color: colors.industrial, delay: 240 },
];
const TOTAL = 314.85;

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ZoneRow: React.FC<(typeof ZONES)[number]> = ({ name, ha, color, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 50], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  return (
    <PopIn delay={delay} fromX={40} fromY={0}>
      <GlassBadge style={{ width: 560, padding: "22px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: color, boxShadow: `0 0 16px ${color}` }} />
            {name}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
            {fmt(ha * p)} <span style={{ fontSize: 24, color: colors.muted, fontWeight: 600 }}>ha</span>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ width: `${(ha / TOTAL) * 100 * p}%`, height: 8, borderRadius: 4, background: color }} />
        </div>
      </GlassBadge>
    </PopIn>
  );
};

export const AllocationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useWindowIn(0, 50);
  const total = interpolate(frame, [40, 110], [0, TOTAL], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  const drift = interpolate(frame, [0, 600], [1, 1.05]);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 90, top: 150, perspective: 1800 }}>
        <div
          style={{
            opacity: p,
            transform: `translateZ(${(1 - p) * -300}px) rotateY(${(1 - p) * 18}deg)`,
          }}
        >
          <AppWindow
            src="recordings/takeE_alloc.mp4"
            width={1150}
            trimBefore={15}
            playbackRate={0.5}
            zoom={drift}
          />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1290, top: 150, display: "flex", flexDirection: "column", gap: 18 }}>
        <Eyebrow delay={20}>Initial suitability map</Eyebrow>
        <BlurIn delay={34}>
          <div style={{ color: colors.text, fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
            {fmt(total)}
            <span style={{ fontSize: 40, color: colors.muted, fontWeight: 600 }}> ha</span>
          </div>
        </BlurIn>
        <BlurIn delay={60}>
          <div style={{ color: colors.muted, fontSize: 30, fontWeight: 500, marginTop: -10, marginBottom: 14 }}>
            Area calculated for every recommended zone
          </div>
        </BlurIn>
        {ZONES.map((z) => (
          <ZoneRow key={z.name} {...z} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Beat 5: But the vision doesn't stop at a map. ---------- */
export const VisionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [10, 150], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 960 - 370, top: 250, perspective: 1600 }}>
        <div
          style={{
            transformOrigin: "50% 70%",
            transform: `rotateX(${tilt * 58}deg) rotateZ(${tilt * -18}deg) translateY(${tilt * 60}px)`,
            opacity: 1 - tilt * 0.25,
          }}
        >
          <AppWindow
            src="recordings/takeE_alloc.mp4"
            width={740}
            trimBefore={60}
            playbackRate={0.3}
            crop={{ x: 360, y: 100, w: 1020, h: 1100 }}
            zoom={1}
          />
        </div>
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,8,15,0.85) 0%, rgba(5,8,15,0.2) 45%, rgba(5,8,15,0) 70%)" }} />
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center" }}>
        <BlurIn delay={4}>
          <SilverText size={92}>But the vision doesn’t stop at a map.</SilverText>
        </BlurIn>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Beat 6: 3D reclamation plan + native species ---------- */
const SPECIES = [
  { local: "Sengon", latin: "Falcataria moluccana", share: 60, trees: "1,093" },
  { local: "Jati", latin: "Tectona grandis", share: 40, trees: "744" },
];

export const ThreeDScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const SPLIT = 420;
  const aOut = interpolate(frame, [SPLIT, SPLIT + 30], [1, 0], clamp);
  const bIn = interpolate(frame, [SPLIT + 6, SPLIT + 46], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  const pA = useWindowIn(0, 50);
  const push = interpolate(frame, [0, SPLIT], [1, 1.12]);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop glow="#14532D" />

      {/* Part A: eye-level forest growing on the real terrain */}
      <AbsoluteFill style={{ opacity: aOut }}>
        <div style={{ position: "absolute", left: 80, top: 60, perspective: 1800 }}>
          <div style={{ opacity: pA, transform: `translateZ(${(1 - pA) * -300}px) rotateX(${(1 - pA) * 14}deg)` }}>
            <AppWindow
              src="recordings/takeD_growth.mp4"
              width={1180}
              trimBefore={1 * fps}
              crop={{ x: 0, y: 106, w: 1400, h: 1140 }}
              zoom={push}
            />
          </div>
        </div>
        <div style={{ position: "absolute", left: 1320, top: 230, width: 540, display: "flex", flexDirection: "column", gap: 26 }}>
          <Eyebrow delay={16}>3D reclamation plan</Eyebrow>
          <BlurIn delay={28}>
            <SilverText size={72}>Explore it in 3D.</SilverText>
          </BlurIn>
          <PopIn delay={70}>
            <GlassBadge>
              <div style={{ fontSize: 22, color: colors.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Projected onto
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, marginTop: 6 }}>Your actual terrain</div>
            </GlassBadge>
          </PopIn>
          <PopIn delay={110}>
            <GlassBadge>
              <div style={{ fontSize: 22, color: colors.muted, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Growth horizon
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, marginTop: 6 }}>Year 0 → 30</div>
            </GlassBadge>
          </PopIn>
        </div>
      </AbsoluteFill>

      {/* Part B: native species chosen for each zone */}
      {frame >= SPLIT ? (
        <AbsoluteFill style={{ opacity: bIn }}>
          <div style={{ position: "absolute", left: 120, top: 250, width: 900, display: "flex", flexDirection: "column", gap: 26 }}>
            <Eyebrow delay={SPLIT + 10}>Forest zone · 200.4 ha</Eyebrow>
            <BlurIn delay={SPLIT + 20}>
              <SilverText size={80}>Native species, chosen per zone.</SilverText>
            </BlurIn>
            <div style={{ display: "flex", gap: 26, marginTop: 20 }}>
              {SPECIES.map((s, i) => (
                <PopIn key={s.local} delay={SPLIT + 60 + i * 24}>
                  <GlassBadge style={{ width: 380 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: 44, fontWeight: 800 }}>{s.local}</div>
                      <div style={{ fontSize: 40, fontWeight: 800, color: "#86EFAC" }}>{s.share}%</div>
                    </div>
                    <div style={{ fontSize: 26, fontStyle: "italic", color: colors.muted, marginTop: 4 }}>{s.latin}</div>
                    <div style={{ fontSize: 26, fontWeight: 600, marginTop: 14 }}>{s.trees} trees</div>
                  </GlassBadge>
                </PopIn>
              ))}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 1180,
              top: 90,
              translate: `${(1 - bIn) * 80}px 0px`,
            }}
          >
            <AppWindow
              src="recordings/takeC_site3d.mp4"
              width={620}
              trimBefore={Math.round(19.5 * fps)}
              crop={{ x: 1412, y: 118, w: 488, h: 700 }}
              style={{ borderRadius: 26 }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
