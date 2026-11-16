import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Backdrop } from "../components";
import { Video } from "@remotion/media";
import { MacBook } from "../MacBook";
import { CANVAS, DESK, desktopCamera, MacDesktop, WINDOW_VIDEO } from "./MacDesktop";
import { HomeWithBoundary } from "./UploadParts";
import { PIT_GRADE } from "../intro/pitGrade";
import { FootageCaptions } from "./introCaption";
import { EASE_OUT, fontFamily } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* Timing (frames @30fps) of the problem-context intro. */
const DRONE = [0, 540] as const;
/** The MacBook shot (GeoWise open) is fully on screen from here; the desktop sequence before
 * it pulls back into it. */
export const REVEAL = DESK.end;
/** Intro length: a short hold on the MacBook (the next line starts as it lands). */
export const INTRO_FRAMES = REVEAL + 80;
/** "Meet GeoWise…" starts as the GeoWise window opens on the desktop. */
export const MEET_VO_AT = DESK.meetVO;

/* The MacBook in the reveal shot, and its screen rect (frame px) once settled:
   1240 px lid, 150 px down, scaled 0.92 about its centre. */
const MAC_W = 1240;
const MAC_SCREEN = (() => {
  const bezel = MAC_W * 0.019;
  const sw = MAC_W - bezel * 2;
  const sh = (sw * 982) / 1512;
  const h = sh + bezel * 2.2 + MAC_W * 0.028;
  const top = (1080 - (h + 150)) / 2 + 150;
  const left = (1920 - MAC_W) / 2;
  const c = { x: 960, y: top + h / 2 };
  const k = 0.92;
  return { x: c.x + (left + bezel - c.x) * k, y: c.y + (top + bezel - c.y) * k, w: sw * k, h: sh * k };
})();
/** Camera for the desktop canvas when it sits exactly on the MacBook screen. */
const CAM_MAC = { s: MAC_SCREEN.w / CANVAS.w, tx: MAC_SCREEN.x, ty: MAC_SCREEN.y };

/* Drone footage: clips 1, 2 (reversed), 3 from /video, cut to 1080p30,
   cross-dissolved, each colour-graded per frame to one neutral white balance. */
const PIT_XFADE = 15;
const PIT_SHOTS = [
  { key: "s1", file: "intro/pit_s1.mp4", from: 0, len: 150 }, // 1 · pit beside the forested coastline
  { key: "s2", file: "intro/pit_s2.mp4", from: 135, len: 215 }, // 2 · reversed: forest and sky tilting down onto the quarry
  { key: "s3", file: "intro/pit_s3.mp4", from: 335, len: 225 }, // 3 · top-down, haul trucks on the bench road
] as const;

const PitShot: React.FC<{ shot: (typeof PIT_SHOTS)[number] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, "");
  const grade = PIT_GRADE[shot.key];
  const gn = grade[Math.min(grade.length - 1, Math.max(0, frame))];
  const o = shot.from === 0 ? 1 : interpolate(frame, [0, PIT_XFADE], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${gn.r} 0 0 0 0  0 ${gn.g} 0 0 0  0 0 ${gn.b} 0 0  0 0 0 1 0`} />
        </filter>
      </svg>
      <Video src={staticFile(shot.file)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: `url(#${id})` }} />
    </AbsoluteFill>
  );
};


/* Notification-style file cards stacking in (scattered data). */
const FILES = [
  { name: "Permukiman_Desa.shp", meta: "Shapefile · villages", color: "#D9653B", glyph: "⌂" },
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

export const LightIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Drone: slow aerial push-in (continues inside the QuickTime window).
  const droneScale = interpolate(frame, [DRONE[0], DRONE[1]], [1.0, 1.14]);
  // The captions are part of the footage, so they shrink and minimise with the window.
  const footage = (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: droneScale }}>
        {PIT_SHOTS.map((shot) => (
          <Sequence key={shot.key} from={shot.from} durationInFrames={shot.len} layout="none">
            <PitShot shot={shot} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <FootageCaptions />
    </AbsoluteFill>
  );

  // Desktop camera, and the reveal shot following it so the canvas lands on the Mac's screen.
  const cam = desktopCamera(frame, CAM_MAC);
  const m = (CANVAS.w * cam.s) / MAC_SCREEN.w;
  const macDrift = interpolate(frame, [REVEAL, INTRO_FRAMES], [0.92, 0.95], clamp);
  // The canvas matches the MacBook screen exactly at REVEAL (content, notch, corners): a hard cut.
  const canvasO = 1;
  const k = 1920 / WINDOW_VIDEO.w; // footage (1920 px) → window video size

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1 · Drone over the open pit (full frame until the zoom out) */}
      {frame < DESK.start + 2 ? footage : null}

      {/* 3 · MacBook with GeoWise open — under the canvas during the pull-back */}
      {frame >= DESK.pullBack[0] - 10 ? (
        <AbsoluteFill style={{ transformOrigin: "0 0", transform: frame < REVEAL ? `translate(${cam.tx - m * MAC_SCREEN.x}px, ${cam.ty - m * MAC_SCREEN.y}px) scale(${m})` : undefined }}>
          <Backdrop />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ marginTop: 150, scale: macDrift }}>
              <MacBook width={MAC_W}>
                <HomeWithBoundary />
              </MacBook>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 2 · The footage was a QuickTime window: minimise, dock, launch GeoWise */}
      {frame >= DESK.start && frame < REVEAL ? (
        <AbsoluteFill style={{ opacity: canvasO }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
            <MacDesktop
              footage={
                <div style={{ width: 1920, height: 1080, transformOrigin: "0 0", scale: 1 / k }}>
                  {footage}
                </div>
              }
            />
          </div>
        </AbsoluteFill>
      ) : null}

    </AbsoluteFill>
  );
};
