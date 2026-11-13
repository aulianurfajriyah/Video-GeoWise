import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, BlurIn, SilverText } from "../components";
import { FootageSlot, MacBook } from "../MacBook";
import { EASE_OUT, fontFamily } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Timing (frames @30fps) of the 35.5 s problem-context intro. */
const DRONE = [0, 420] as const;
const SHOULDER = [400, 730] as const;
const REVEAL = 710;

/* Where the Mac screen sits in the over-the-shoulder clip (px, 1920x1080),
   so the push-in lands on it. Adjust once the real clip is in place. */
const SHOULDER_SCREEN = { x: 1060, y: 470 };

/** Big white caption over footage, with a soft dark gradient for legibility. */
const FootageCaption: React.FC<{ lines: string[]; delay: number; out: number }> = ({ lines, delay, out }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [out - 18, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 120, bottom: 130, opacity: o, fontFamily }}>
      {lines.map((l, i) => (
        <BlurIn key={l} delay={delay + i * 22} duration={30}>
          <div
            style={{
              color: "#fff",
              fontSize: i === 0 ? 92 : 56,
              fontWeight: i === 0 ? 800 : 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              textShadow: "0 10px 40px rgba(0,0,0,0.55)",
              marginTop: i === 0 ? 0 : 14,
              maxWidth: 1250,
            }}
          >
            {l}
          </div>
        </BlurIn>
      ))}
    </div>
  );
};

/* Notification-style file cards stacking in (scattered data). */
const FILES = [
  { name: "LandCover_2024.shp", meta: "Shapefile · land cover", color: "#2E9E5B", glyph: "▦" },
  { name: "DEMNAS_clip.tif", meta: "GeoTIFF · elevation", color: "#0EA5A4", glyph: "⛰" },
  { name: "Jalan_RBI.geojson", meta: "GeoJSON · roads", color: "#E2483D", glyph: "⟋" },
  { name: "Sungai.gpkg", meta: "GeoPackage · rivers", color: "#3B9BF2", glyph: "≈" },
  { name: "SUTT_PLN.kml", meta: "KML · power lines", color: "#E6B428", glyph: "ϟ" },
];

const FileStack: React.FC<{ start: number; out: number }> = ({ start, out }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [out - 18, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", right: 110, top: 120, width: 560, opacity: o, fontFamily }}>
      {FILES.map((f, i) => {
        const d = start + i * 14;
        const p = interpolate(frame, [d, d + 22], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
        return (
          <div
            key={f.name}
            style={{
              position: "absolute",
              left: 0,
              top: i * 108,
              width: 560,
              opacity: p,
              translate: `0px ${(1 - p) * -60}px`,
              scale: 0.9 + 0.1 * p,
              filter: `blur(${(1 - p) * 10}px)`,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 24px",
              borderRadius: 26,
              background: "rgba(250,250,250,0.82)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.6), 0 24px 48px -16px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: f.color,
                color: "#fff",
                fontSize: 32,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {f.glyph}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1D1D1F" }}>{f.name}</div>
              <div style={{ fontSize: 22, color: "#6E6E73", marginTop: 2 }}>{f.meta}</div>
            </div>
            <div style={{ fontSize: 20, color: "#8E8E93", alignSelf: "flex-start" }}>now</div>
          </div>
        );
      })}
    </div>
  );
};

/* GeoWise app icon on a light macOS-like desktop, clicked open. */
const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.23,
      background: "linear-gradient(180deg, #FFFFFF 0%, #ECECEE 100%)",
      boxShadow: "0 10px 24px rgba(0,0,0,0.22), inset 0 -2px 4px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Img src={staticFile("logo-a.svg")} style={{ width: size * 0.62, height: size * 0.62 }} />
  </div>
);

const Desktop: React.FC<{ w: number; h: number; start: number }> = ({ w, h, start }) => {
  const frame = useCurrentFrame();
  const CLICK = start + 70;
  const t = interpolate(frame, [start + 20, CLICK - 4], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cx = interpolate(t, [0, 1], [w * 0.82, w * 0.5 + 6]);
  const cy = interpolate(t, [0, 1], [h * 0.85, h * 0.47]);
  const press = frame >= CLICK && frame < CLICK + 6 ? 0.9 : 1;
  const bounce = interpolate(frame, [CLICK + 6, CLICK + 14, CLICK + 22], [0, -14, 0], clamp);
  const open = interpolate(frame, [CLICK + 14, CLICK + 44], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const iconSize = w * 0.085;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(120% 120% at 30% 10%, #F7F7F5 0%, #DCE3EA 55%, #C9D3DD 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: w / 2 - iconSize / 2,
          top: h * 0.43 - iconSize / 2 + bounce,
          scale: press,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: w * 0.008,
        }}
      >
        <AppIcon size={iconSize} />
        <div style={{ fontFamily, fontSize: w * 0.014, fontWeight: 600, color: "#1D1D1F" }}>GeoWise</div>
      </div>
      {/* App window grows out of the icon */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: interpolate(open, [0, 0.25], [0, 1], clamp),
          clipPath: `inset(${interpolate(open, [0, 1], [43, 0])}% ${interpolate(open, [0, 1], [46, 0])}% ${interpolate(open, [0, 1], [50, 0])}% ${interpolate(open, [0, 1], [46, 0])}% round ${interpolate(open, [0, 1], [24, 0])}px)`,
        }}
      >
        <Img src={staticFile("stills/alloc.png")} style={{ width: w, height: h }} />
      </div>
      {open < 0.5 ? (
        <svg width={w * 0.026} height={w * 0.026} viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, scale: press }}>
          <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const LightIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Drone: slow aerial push-in.
  const droneScale = interpolate(frame, [DRONE[0], DRONE[1]], [1.0, 1.14]);
  // Shoulder: hold, then push into the Mac screen and wash to white.
  const push = interpolate(frame, [SHOULDER[1] - 70, SHOULDER[1]], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  const shoulderIn = interpolate(frame, [SHOULDER[0], SHOULDER[0] + 20], [0, 1], clamp);
  const wash = interpolate(frame, [SHOULDER[1] - 25, SHOULDER[1]], [0, 1], clamp);

  // Reveal: MacBook settles in.
  const macIn = interpolate(frame, [REVEAL, REVEAL + 50], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  const macW = 1240;
  const bezel = macW * 0.019;
  const sw = macW - bezel * 2;
  const sh = (sw * 982) / 1512;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1 · Drone over the open pit */}
      <Sequence name="Drone · open pit" from={DRONE[0]} durationInFrames={DRONE[1] - DRONE[0] + 20}>
        <AbsoluteFill style={{ scale: droneScale }}>
          <FootageSlot file="intro/drone.mp4" label="Drone · open-pit mine" />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)" }} />
        <FootageCaption lines={["Every mine eventually closes."]} delay={30} out={190} />
        <FootageCaption
          lines={["What comes next?", "Planning it means juggling scattered data."]}
          delay={200}
          out={DRONE[1]}
        />
        <FileStack start={235} out={DRONE[1]} />
      </Sequence>

      {/* 2 · Over the shoulder: engineer at the Mac */}
      <Sequence name="Over the shoulder" from={SHOULDER[0]} durationInFrames={SHOULDER[1] - SHOULDER[0] + 10}>
        <AbsoluteFill
          style={{
            opacity: shoulderIn,
            transformOrigin: `${SHOULDER_SCREEN.x}px ${SHOULDER_SCREEN.y}px`,
            scale: 1 + push * 3.2,
            filter: `blur(${push * 6}px)`,
          }}
        >
          <FootageSlot file="intro/shoulder.mp4" label="Over the shoulder · engineer at Mac" />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)", opacity: 1 - push }} />
        <FootageCaption
          lines={["Environmental engineers need", "a clear plan — not more layers."]}
          delay={30}
          out={SHOULDER[1] - SHOULDER[0] - 60}
        />
        <AbsoluteFill style={{ background: "#F3F2EF", opacity: wash }} />
      </Sequence>

      {/* 3 · Into the Mac → GeoWise opens */}
      <Sequence name="Mac · app reveal" from={REVEAL}>
        <Backdrop />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center" }}>
            <BlurIn delay={150} duration={36}>
              <SilverText size={84}>Meet GeoWise.</SilverText>
            </BlurIn>
          </div>
          <div
            style={{
              marginTop: interpolate(frame, [REVEAL + 140, REVEAL + 190], [0, 150], {
                ...clamp,
                easing: Easing.bezier(0.65, 0, 0.35, 1),
              }),
              opacity: macIn,
              scale: interpolate(frame, [REVEAL, REVEAL + 60, REVEAL + 140, REVEAL + 190], [1.25, 1, 1, 0.92], {
                ...clamp,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <MacBook width={macW}>
              <Desktop w={sw} h={sh} start={10} />
            </MacBook>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
