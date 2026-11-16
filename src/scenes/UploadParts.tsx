import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../theme";
import { SITE_PATH, SITE_SHAPE } from "../siteShape";
import { ZONE_MAP, ZONE_POLYGONS } from "../zoneMap";

/**
 * Pieces of the desktop upload beat (canvas px, see MacDesktop): a blue macOS folder holding
 * three site files, the cards that fly out of it, and a simplified "Create a Mining Site"
 * form (after the app's own sheet) whose fields fill in as each file lands.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---- GeoWise window (canvas px) ---- */
export const APP = { x: 660, y: 170, w: 1150, title: 44 };
/** The welcome recording is 1600 × 1004. */
export const APP_CONTENT_H = (APP.w * 1004) / 1600;
export const APP_H = APP.title + APP_CONTENT_H;
/** Continue button in the welcome screen (fraction of the content). */
export const CONTINUE_BTN = { x: 0.083, y: 0.651 };

/* ---- The form sheet: popup box inside the content, rows in popup px ---- */
export const POPUP = { inset: 24 };
const PX = 44; // horizontal padding
const ROW = { name: 158, dem: 262, ortho: 388, iup: 514 };
const FIELD_H = 58;
export const fieldCentre = (key: keyof typeof ROW) => ({
  x: APP.x + POPUP.inset + PX + 36,
  y: APP.y + APP.title + POPUP.inset + ROW[key] + FIELD_H / 2,
});

/* ---- Folder on the desktop ---- */
/** Left of the QuickTime window, so it is on the desktop from the start without overlapping it. */
export const FOLDER = { cx: 210, cy: 520, w: 180, h: 142 };

export type SiteFile = { key: "dem" | "ortho" | "iup"; name: string; size: string; ext: string; color: string; glyph: React.ReactNode };
const Mountain = <path d="M2 18 L8 9 L12 14 L15 10 L22 18 Z" fill="currentColor" />;
const Picture = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="10" r="2" fill="currentColor" />
    <path d="M4 18 L10 12 L14 16 L17 13 L20 17" fill="none" stroke="currentColor" strokeWidth="2" />
  </>
);
const Boundary = <path d="M4 6 L12 3 L20 7 L18 18 L9 21 L3 15 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeDasharray="3 2.5" />;
export const FILES: SiteFile[] = [
  { key: "dem", name: "DEM_TumpangPitu.tif", size: "48.2 MB", ext: "DEM", color: "#0EA5A4", glyph: Mountain },
  { key: "ortho", name: "Orthophoto_2025.tif", size: "212 MB", ext: "TIFF", color: "#3B82F6", glyph: Picture },
  { key: "iup", name: "site_1.shp", size: "314.52 ha", ext: "SITE", color: "#E0A800", glyph: Boundary },
];

/** A file as a paper card. */
export const FileCard: React.FC<{ file: SiteFile; style?: React.CSSProperties }> = ({ file, style }) => (
  <div
    style={{
      width: 100,
      height: 124,
      borderRadius: 10,
      background: "linear-gradient(180deg,#FFFFFF,#F4F4F2)",
      boxShadow: "0 10px 24px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontFamily,
      ...style,
    }}
  >
    <div style={{ width: 54, height: 54, borderRadius: 14, background: `${file.color}1F`, color: file.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={32} height={32} viewBox="0 0 24 24">
        {file.glyph}
      </svg>
    </div>
    <div style={{ fontSize: 15, fontWeight: 800, color: "#1D1D1F", letterSpacing: "0.02em" }}>{file.ext}</div>
  </div>
);

/** Card resting places inside the folder as it opens (fanned), canvas px. */
export const cardRest = (i: number, rise: number) => ({
  x: FOLDER.cx + (i - 1) * 46,
  y: FOLDER.cy - 10 - rise * 74 - (i === 1 ? 8 : 0) * rise,
  rot: (i - 1) * 9 * rise,
});

/** The folder, back + front; cards are drawn between them by the caller (children). */
export const Folder: React.FC<{ open: number; children?: React.ReactNode; label?: boolean }> = ({ open, children, label = true }) => {
  const { cx, cy, w, h } = FOLDER;
  return (
    <>
      {/* Back panel with tab */}
      <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2 - 16, width: w * 0.42, height: 30, borderRadius: "10px 12px 0 0", background: "linear-gradient(180deg,#5FAEF0,#4C9DE6)" }} />
      <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: "0 14px 14px 14px", background: "linear-gradient(180deg,#4C9DE6 0%,#3E8FDB 100%)", boxShadow: "0 18px 30px -14px rgba(0,0,0,0.35)" }} />
      {children}
      {/* Front panel: tilts open from its bottom edge */}
      <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2 + 18, width: w, height: h - 18, perspective: 700 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 14,
            transformOrigin: "50% 100%",
            transform: `rotateX(${-38 * open}deg)`,
            background: "linear-gradient(180deg,#8CCBFA 0%,#68B4F4 55%,#5AA8EF 100%)",
            boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.7), 0 -2px 10px rgba(0,0,0,0.08)",
          }}
        />
      </div>
      {label ? (
        <div style={{ position: "absolute", left: cx - 120, top: cy + h / 2 + 12, width: 240, textAlign: "center", fontFamily, fontSize: 19, fontWeight: 600, color: "#1D1D1F", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>Tumpang Pitu Data</div>
      ) : null}
    </>
  );
};

/* ---- The "Create a Mining Site" form ---- */
const Label: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", left: PX, top: y - 26, fontSize: 17, fontWeight: 700, color: "#3A3633" }}>{children}</div>
);
const Helper: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", left: PX, top: y + FIELD_H + 8, fontSize: 13, color: "#6E6762" }}>{children}</div>
);

const Field: React.FC<{ y: number; width: number; filled: number; children: React.ReactNode; right?: React.ReactNode }> = ({ y, width, filled, children, right }) => (
  <div
    style={{
      position: "absolute",
      left: PX,
      top: y,
      width,
      height: FIELD_H,
      borderRadius: FIELD_H / 2,
      boxSizing: "border-box",
      border: `1.5px solid ${filled > 0 ? `rgba(46,158,91,${0.25 + 0.45 * filled})` : "#DDD6D1"}`,
      background: filled > 0 ? `rgba(46,158,91,${0.06 * filled})` : "rgba(255,255,255,0.35)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 10px 0 22px",
      scale: 1 + 0.025 * Math.sin(Math.PI * Math.min(1, filled * 1.0)) * (filled < 1 ? 1 : 0),
    }}
  >
    {children}
    <div style={{ marginLeft: "auto" }}>{right}</div>
  </div>
);
const Browse: React.FC<{ done: boolean }> = ({ done }) => (
  <div style={{ padding: "9px 20px", borderRadius: 20, background: done ? "rgba(0,0,0,0.06)" : "#1D1A18", color: done ? "#3A3633" : "#fff", fontSize: 15, fontWeight: 600 }}>{done ? "Replace" : "Browse file"}</div>
);
const Check: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ width: 24, height: 24, borderRadius: 12, background: "#2E9E5B", display: "flex", alignItems: "center", justifyContent: "center", scale: p }}>
    <svg width={14} height={14} viewBox="0 0 24 24">
      <path d="M5 12.5 L10 17 L19 7" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
const Spinner: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={22} height={22} viewBox="0 0 24 24" style={{ rotate: `${frame * 14}deg` }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="3" />
    <path d="M12 3 A9 9 0 0 1 21 12" fill="none" stroke="#2E9E5B" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export type FormState = {
  frame: number;
  typed: string; // project name typed so far
  caret: boolean;
  filled: [number, number, number]; // 0 → 1 as DEM / Ortho land (third unused: the boundary goes to step 2)
  detecting: number; // 1 while the IUP is being detected from the DEM
  detected: number; // 0 → 1 once detected
};

export const MiningSiteForm: React.FC<{ s: FormState; width: number; height: number }> = ({ s, width, height }) => {
  const fw = width - PX * 2;
  const fileRow = (i: number) => {
    const f = FILES[i];
    const p = s.filled[i];
    return p > 0 ? (
      <>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${f.color}22`, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width={18} height={18} viewBox="0 0 24 24">
            {f.glyph}
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#2B2724", opacity: interpolate(p, [0.2, 0.7], [0, 1], clamp) }}>{f.name}</div>
        <div style={{ fontSize: 15, color: "#8A827C", opacity: interpolate(p, [0.4, 0.9], [0, 1], clamp) }}>{f.size}</div>
        <Check p={interpolate(p, [0.5, 1], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })} />
      </>
    ) : null;
  };
  const iupDone = s.detected > 0;
  return (
    <div style={{ position: "relative", width, height, fontFamily, color: "#3A3633" }}>
      <div style={{ position: "absolute", left: PX, top: 34, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: "#3A3633" }}>Create a Mining Site</div>
      <div style={{ position: "absolute", left: PX, top: 82, fontSize: 16, color: "#6E6762" }}>To prepare your post-mining landscape analysis, share a few project details.</div>
      <div style={{ position: "absolute", right: PX, top: 72, fontSize: 16, color: "#6E6762" }}>1 / 2 · Site details</div>

      <Label y={ROW.name}>Project Name *</Label>
      <Field y={ROW.name} width={fw} filled={0}>
        <svg width={22} height={22} viewBox="0 0 24 24" style={{ color: "#8A827C", flexShrink: 0 }}>
          <rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 9 H16 M8 13 H14" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <div style={{ fontSize: 17, color: s.typed ? "#2B2724" : "#9A928C", fontWeight: s.typed ? 600 : 400, display: "flex", alignItems: "center" }}>
          {s.typed || "Input your project or landscape name"}
          {s.caret ? <span style={{ display: "inline-block", width: 2, height: 22, background: "#2B2724", marginLeft: 2 }} /> : null}
        </div>
      </Field>

      <Label y={ROW.dem}>Digital Elevation Model *</Label>
      <Field y={ROW.dem} width={fw} filled={s.filled[0]} right={<Browse done={s.filled[0] > 0.5} />}>
        {s.filled[0] > 0 ? fileRow(0) : <div style={{ fontSize: 17, color: "#9A928C", paddingLeft: 44 }}>Choose a TIFF or GeoTIFF file</div>}
      </Field>
      <Helper y={ROW.dem}>Required. Upload a georeferenced DEM with a single elevation band to continue.</Helper>

      <Label y={ROW.ortho}>Orthophoto / Drone Imagery (Optional)</Label>
      <Field y={ROW.ortho} width={fw} filled={s.filled[1]} right={<Browse done={s.filled[1] > 0.5} />}>
        {s.filled[1] > 0 ? fileRow(1) : <div style={{ fontSize: 17, color: "#9A928C", paddingLeft: 44 }}>Choose a TIFF or GeoTIFF file</div>}
      </Field>
      <Helper y={ROW.ortho}>Optional. A standard basemap provides spatial context; upload an orthophoto for detailed imagery.</Helper>

      <Label y={ROW.iup}>Mining Licences / IUP (Izin Usaha Pertambangan) · Optional</Label>
      <Field y={ROW.iup} width={fw} filled={s.detected}>
        {iupDone ? (
          <>
            <Check p={interpolate(s.detected, [0, 0.6], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })} />
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1F7A45" }}>BUMI SUKSESINDO</div>
            <div style={{ fontSize: 15, color: "#5E7A68" }}>Batas IUP terdeteksi otomatis</div>
          </>
        ) : s.detecting > 0 ? (
          <>
            <Spinner frame={s.frame} />
            <div style={{ fontSize: 17, fontWeight: 600, color: "#2B2724" }}>Detecting IUP boundary…</div>
          </>
        ) : (
          <div style={{ fontSize: 16, color: "#8A827C" }}>Upload Orthophoto atau DEM untuk mendeteksi batas IUP secara otomatis.</div>
        )}
      </Field>

      <div
        style={{
          position: "absolute",
          right: PX,
          bottom: 26,
          padding: "11px 26px",
          borderRadius: 22,
          background: lerp(0, 1, s.detected) > 0.5 ? "#1D1A18" : "rgba(0,0,0,0.06)",
          color: s.detected > 0.5 ? "#fff" : "rgba(0,0,0,0.3)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Next →
      </div>
    </div>
  );
};

/** Card flight: rest place in the folder → the field's file icon, along an arc. */
/** Where the site-boundary file is dropped: the "Upload Shapefile" dialog of the step-2 sheet
 * (the sheet image sits at 7–93 % of the window content height, centred). */
const SHEET_H = APP_CONTENT_H * 0.86;
const SHEET_W = (SHEET_H * 1976) / 1454;
export const SHP_DROP = { x: APP.x + (APP.w - SHEET_W) / 2 + SHEET_W * 0.42, y: APP.y + APP.title + APP_CONTENT_H * 0.07 + SHEET_H * 0.81 };

export const flightPose = (i: number, p: number) => {
  const from = cardRest(i, 1);
  const to = i === 2 ? SHP_DROP : fieldCentre((["dem", "ortho"] as const)[i]);
  const e = Easing.bezier(0.55, 0, 0.25, 1)(p);
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e) - Math.sin(Math.PI * e) * 120,
    rot: lerp(from.rot, 0, e) + Math.sin(Math.PI * e) * 6,
    scale: lerp(1, 0.32, e),
    opacity: interpolate(p, [0.82, 1], [1, 0], clamp),
  };
};

/**
 * GeoWise home screen after the site is set up: the welcome (earth) page, dimmed, with the
 * "Create a Site Boundary" step (orthophoto + detected IUP boundary) as a sheet on top.
 * Sized in % so it fits any screen box (window content, full screen, the MacBook).
 */
/**
 * Highlight of the uploaded site (site_1.shp) for `p` 0 → 1: a bright line traces the
 * boundary, the site flashes and a ring ripples out, then the fill clears and the outline stays,
 * with a shimmer running along it.
 */
/** A short bright highlight travelling round an outline (pathLength 1). */
const Shimmer: React.FC<{ d: string; color: string; width: number; opacity: number; speed?: number; offset?: number }> = ({ d, color, width, opacity, speed = 0.012, offset = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="0.09 0.91"
      strokeDashoffset={-(frame * speed + offset)}
      strokeOpacity={opacity}
      style={{ filter: `drop-shadow(0 0 10px ${color})` }}
    />
  );
};

const SiteHighlight: React.FC<{ p: number }> = ({ p }) => {
  const draw = interpolate(p, [0, 0.42], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.3, 1) });
  const flash = interpolate(p, [0.38, 0.55, 1], [0, 1, 0], clamp);
  const fill = interpolate(p, [0.35, 0.55, 0.85], [0, 0.42, 0], clamp);
  const shimmer = interpolate(p, [0.5, 0.7], [0, 1], clamp);
  const ring = interpolate(p, [0.45, 0.9], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <svg viewBox={`0 0 ${SITE_SHAPE.w} ${SITE_SHAPE.h}`} style={{ position: "absolute", top: "7%", height: "86%", aspectRatio: "1976 / 1454", left: "50%", translate: "-50% 0px", overflow: "visible" }}>
      <path d={SITE_PATH} fill="#FFD43B" fillOpacity={fill} stroke="none" />
      {ring > 0 && ring < 1 ? (
        <path
          d={SITE_PATH}
          fill="none"
          stroke="#FFE066"
          strokeWidth={6}
          strokeOpacity={0.8 * (1 - ring)}
          style={{ transformOrigin: `${SITE_SHAPE.cx}px ${SITE_SHAPE.cy}px`, transformBox: "view-box", scale: 1 + 0.12 * ring }}
        />
      ) : null}
      {draw > 0 ? (
        <path
          d={SITE_PATH}
          pathLength={1}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={7 + 5 * flash}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${draw} 1`}
          strokeOpacity={interpolate(p, [0, 0.05, 0.75, 1], [0, 1, 1, 0.75], clamp)}
          style={{ filter: `drop-shadow(0 0 ${10 + 18 * flash}px rgba(255,212,59,0.95))` }}
        />
      ) : null}
      {shimmer > 0 ? <Shimmer d={SITE_PATH} color="#FFF6C2" width={11} opacity={shimmer} /> : null}
    </svg>
  );
};

/** The IUP permit area (green, dashed in the sheet), in stills/site_boundary_done.png px:
 * the region (clipped to the map, with the file card cut out) and its two dashed edges. */
const IUP_REGION = "M52.2 237.9 L803.3 237.9 L803.3 275.1 L1493.0 275.1 L1493.0 721.0 L1727.0 721.0 L1727.0 1292.4 L1174.8 1292.4 L1174.8 1331.5 L441.8 1331.5 L441.8 895.7 L326.3 895.7 L326.3 371.5 L52.2 371.5 Z M100.4 1086.5 H1883.6 V1267.3 H100.4 Z";
const IUP_EDGES = ["M803.3 237.9 L803.3 275.1 L1493.0 275.1 L1493.0 721.0 L1727.0 721.0 L1727.0 1292.4 L1174.8 1292.4 L1174.8 1331.5", "M52.2 371.5 L326.3 371.5 L326.3 895.7 L441.8 895.7 L441.8 1331.5"];
const MAP_CLIP = { x: 52.2, y: 237.9, w: 1877.6, h: 1093.6, r: 30 };

/** On "the mining permit areas": the green IUP area pulses and its dashed edge glows. */
const PermitHighlight: React.FC<{ p: number }> = ({ p }) => {
  const draw = interpolate(p, [0, 0.45], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.3, 1) });
  const fill = interpolate(p, [0.1, 0.45, 0.85], [0, 0.34, 0], clamp);
  const glow = interpolate(p, [0.3, 0.5, 1], [0, 1, 0.35], clamp);
  const shimmer = interpolate(p, [0.5, 0.7], [0, 1], clamp);
  return (
    <svg viewBox="0 0 1976 1454" style={{ position: "absolute", top: "7%", height: "86%", aspectRatio: "1976 / 1454", left: "50%", translate: "-50% 0px", overflow: "visible" }}>
      <defs>
        <clipPath id="iup-clip">
          <rect x={MAP_CLIP.x} y={MAP_CLIP.y} width={MAP_CLIP.w} height={MAP_CLIP.h} rx={MAP_CLIP.r} />
        </clipPath>
      </defs>
      <g clipPath="url(#iup-clip)">
        <path d={IUP_REGION} fillRule="evenodd" fill="#2E9E5B" fillOpacity={fill} />
        {IUP_EDGES.map((d) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="none"
            stroke="#3DDC84"
            strokeWidth={6 + 4 * glow}
            strokeLinejoin="round"
            strokeDasharray={`${draw} 1`}
            strokeOpacity={0.95}
            style={{ filter: `drop-shadow(0 0 ${6 + 14 * glow}px rgba(46,158,91,0.95))` }}
          />
        ))}
        {shimmer > 0 ? IUP_EDGES.map((d, i) => <Shimmer key={`s${d}`} d={d} color="#D9FFE8" width={10} opacity={shimmer} speed={0.016} offset={i * 0.5} />) : null}
      </g>
    </svg>
  );
};

export const HomeWithBoundary: React.FC<{ sheet?: number; done?: number; glow?: number; permit?: number }> = ({ sheet = 1, done = 1, glow = 1, permit = 1 }) => (
  <>
    <Img src={staticFile("stills/welcome_last.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, background: `rgba(30,25,20,${0.24 * sheet})` }} />
    {(["stills/site_boundary.png", "stills/site_boundary_done.png"] as const).map((src, k) => (
      <Img
        key={src}
        src={staticFile(src)}
        style={{
          position: "absolute",
          top: "7%",
          height: "86%",
          aspectRatio: "1976 / 1454",
          left: "50%",
          translate: `-50% ${(1 - sheet) * 40}px`,
          opacity: sheet * (k === 0 ? 1 : done),
          borderRadius: 22,
          boxShadow: k === 0 ? "0 30px 70px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)" : undefined,
        }}
      />
    ))}
    {done > 0.5 && permit > 0 ? <PermitHighlight p={permit} /> : null}
    {done > 0.5 && glow > 0 ? <SiteHighlight p={glow} /> : null}
  </>
);

/** "Reclamation plan" preview card: a mini zone map of the site and its total area. */
export const PlanCard: React.FC = () => (
  <div
    style={{
      width: 340,
      padding: 18,
      borderRadius: 22,
      background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,248,246,0.88))",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.7)",
      display: "flex",
      gap: 16,
      fontFamily,
      boxSizing: "border-box",
    }}
  >
    {/* The site, zones still unknown: a neutral outline with a question mark */}
    <div style={{ position: "relative", width: 96, height: 130, flexShrink: 0 }}>
      <svg width={96} height={130} viewBox={`0 0 ${ZONE_MAP.w} ${ZONE_MAP.h}`}>
        {ZONE_POLYGONS.map((z, i) => (
          <path key={i} d={z.d} fillRule="evenodd" fill="#E3E3E6" stroke="#B9B9BE" strokeWidth={14} strokeDasharray="34 24" strokeLinejoin="round" />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 800, color: "#8E8E93" }}>?</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6E6E73" }}>Reclamation plan</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#1D1D1F", letterSpacing: "-0.02em" }}>314.85 ha</div>
      {(
        [["Forestry"], ["Agriculture"], ["Recreation"]] as const
      ).map(([n]) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#3A3A3C" }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#C7C7CC" }} />
          {n}
          <span style={{ marginLeft: "auto", paddingLeft: 10, color: "#8E8E93" }}>? ha</span>
        </div>
      ))}
    </div>
  </div>
);
