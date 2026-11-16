import { drawStillCaption, StillCaption } from "./introCaption";
import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Freeze, Sequence } from "remotion";
import { Video } from "@remotion/media";
import { fontFamily } from "../theme";
import { SITE_SHAPE } from "../siteShape";
import { APP, APP_CONTENT_H, CONTINUE_BTN, FILES, FileCard, Folder, FOLDER, cardRest, flightPose, HomeWithBoundary, MiningSiteForm, PlanCard, POPUP } from "./UploadParts";

/**
 * 0:13 → 0:22 of the light cut: the drone footage turns out to be a QuickTime window on a
 * macOS desktop. The cursor minimises it (genie into the dock), glides along the dock
 * (magnification + tooltips) to GeoWise, clicks it, and the app opens full-screen — then the
 * camera pulls back to the MacBook (handled by LightIntro).
 *
 * Everything here is drawn on a "screen canvas" the size of the Mac display at 1920 px wide
 * (1920 × 1247, the screenshots' aspect); a camera transform frames it.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const io = Easing.bezier(0.65, 0, 0.35, 1);

export const CANVAS = { w: 1920, h: 1247 };

/** Intro frames (30 fps) of each step. */
export const DESK = {
  start: 390, // drone fills the frame; zoom out begins
  zoomEnd: 440,
  cursorIn: 398,
  minimize: 448, // click on the yellow button
  genie: [452, 476] as const,
  toDock: [446, 476] as const, // camera eases down to the dock (dock in frame before the genie lands)
  hover: [494, 501, 508, 516] as const, // cursor over QuickTime, Safari, Maps, GeoWise (brisk)
  launch: 522, // click GeoWise
  winOpen: [526, 560] as const, // the GeoWise window grows out of its icon (welcome screen)
  toWide: [524, 572] as const, // camera eases out to frame the window and the folder
  meetVO: 534, // "Meet GeoWise…"
  scan: [677, 745] as const, // on "transforms spatial data": a scan sweeps across the welcome screen
  planCard: [744, 810, 826] as const, // on "smarter, data-driven mine reclamation plans": in, out start, out end
  permit: [1282, 1345] as const, // on "the mining permit areas": the green IUP area lights up
  title: [552, 814, 834] as const, // "Meet GeoWise." on the desktop: in, out start, out end
  continueClick: 828,
  popup: [832, 856] as const, // the Create a Mining Site sheet slides up
  typing: [924, 984] as const, // project name typed in, in view while the cards wait in the folder
  toFolder: [862, 890] as const, // camera onto the folder
  uploadVO: 878, // "Simply upload the data you already have…"
  folderClick: 880, // single click opens it
  folderOpen: [886, 906] as const,
  cardsRise: [892, 920] as const,
  // DEM and orthophoto fly to their fields on their words; the site boundary goes to step 2.
  flights: [
    [1008, 1036],
    [1066, 1092],
    [1146, 1176],
  ] as const,
  toField: [
    [996, 1024],
    [1054, 1080],
    [1112, 1140], // widen for the step change + the boundary drop
  ] as const,
  detect: [1040, 1072] as const, // IUP detected from the DEM as soon as it lands (BUMI SUKSESINDO)
  step2: [1124, 1144] as const, // on "site boundaries": the sheet moves on to Create a Site Boundary
  uploaded: [1174, 1188] as const, // the dropped shapefile is read: boundary drawn in yellow
  toIUP: [1188, 1216] as const, // camera follows the window to full screen
  highlight: [1219, 1292] as const, // on "automatically": the uploaded site is traced and lit up
  toSite: [1216, 1250] as const, // camera pushes in on the site while it lights up
  maximize: [1190, 1216] as const, // the app goes full-screen once the boundary is in (camera follows)
  pullBack: [1284, 1363] as const, // camera pulls back to the whole MacBook as the map appears
  end: 1363,
};

/* ---- QuickTime window ---- */
const WIN = { x: 360, y: 200, w: 1200, title: 52 };
const VIDEO_H = (WIN.w * 9) / 16;
const WIN_H = WIN.title + VIDEO_H;
/** The video area inside the window (canvas px); at DESK.start it exactly fills the frame. */
export const WINDOW_VIDEO = { x: WIN.x, y: WIN.y + WIN.title, w: WIN.w, h: VIDEO_H };

/* ---- Dock ---- */
type DockItem = { key: string; label: string; icon?: string };
const DOCK: (DockItem | "sep")[] = [
  { key: "finder", label: "Finder", icon: "dock/finder.png" },
  { key: "apps", label: "Apps", icon: "dock/apps.png" },
  { key: "quicktime", label: "QuickTime Player", icon: "dock/quicktime.png" },
  { key: "safari", label: "Safari", icon: "dock/safari.png" },
  { key: "maps", label: "Maps", icon: "dock/maps.png" },
  "sep",
  { key: "geowise", label: "GeoWise" },
];
const ICON = 92;
const GAP = 8;
const SEP_W = 18;
const DOCK_PAD = 12;
const DOCK_BOTTOM = CANVAS.h - 14;
const ICON_BOTTOM = DOCK_BOTTOM - DOCK_PAD;
const MAG = 0.6;
const SIGMA = 80;

/** Base (unmagnified) centre x of each dock entry. */
const BASE_X = (() => {
  const widths = DOCK.map((d) => (d === "sep" ? SEP_W : ICON));
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (DOCK.length - 1);
  let x = CANVAS.w / 2 - total / 2;
  return widths.map((w) => {
    const c = x + w / 2;
    x += w + GAP;
    return c;
  });
})();
const idx = (key: string) => DOCK.findIndex((d) => d !== "sep" && d.key === key);
export const DOCK_ICON_Y = ICON_BOTTOM - ICON / 2;
const QT_X = BASE_X[idx("quicktime")];
const GW_X = BASE_X[idx("geowise")];

/** Dock layout for a cursor x and magnification amount (0…1). */
const dockLayout = (cursorX: number, act: number) => {
  const sizes = DOCK.map((d, i) => (d === "sep" ? SEP_W : ICON * (1 + MAG * act * Math.exp(-((cursorX - BASE_X[i]) ** 2) / (2 * SIGMA * SIGMA)))));
  const total = sizes.reduce((a, b) => a + b, 0) + GAP * (DOCK.length - 1);
  let x = CANVAS.w / 2 - total / 2;
  const centers = sizes.map((w) => {
    const c = x + w / 2;
    x += w + GAP;
    return c;
  });
  return { sizes, centers, left: CANVAS.w / 2 - total / 2, total };
};

/* ---- Camera (canvas → frame) ---- */
type Cam = { s: number; tx: number; ty: number };
/** Video area fills the frame. */
const CAM_VIDEO: Cam = { s: 1920 / WINDOW_VIDEO.w, tx: -WINDOW_VIDEO.x * (1920 / WINDOW_VIDEO.w), ty: -WINDOW_VIDEO.y * (1920 / WINDOW_VIDEO.w) };
const CAM_DESK: Cam = { s: 1, tx: 0, ty: 0 };
const DOCK_S = 1.3;
const CAM_DOCK: Cam = { s: DOCK_S, tx: 960 - (CANVAS.w / 2) * DOCK_S, ty: 1080 - CANVAS.h * DOCK_S };

/** Camera centred on a canvas point (kept inside the canvas edges). */
const focus = (sc: number, fx: number, fy: number): Cam => ({
  s: sc,
  tx: Math.min(0, Math.max(1920 - CANVAS.w * sc, 960 - fx * sc)),
  ty: Math.min(0, Math.max(1080 - CANVAS.h * sc, 540 - fy * sc)),
});
const CAM_WIDE = focus(1.12, 1000, 560);
/** Slow push in toward the GeoWise window while "Meet GeoWise…" is read (no static hold). */
const CAM_PUSH = focus(1.34, APP.x + APP.w / 2, APP.y + (APP.title + APP_CONTENT_H) / 2);
const CAM_FOLDER = focus(1.7, 570, 540);
const CAM_FIELDS = [focus(1.6, 620, 560), focus(1.6, 620, 587), focus(1.22, 790, 620)];
/** The step-2 sheet once the app is full-screen (sheet image at 7–93 % of the screen height). */
const FULL_SHEET = (() => {
  const h = CANVAS.h * 0.86;
  const w = (h * SITE_SHAPE.w) / SITE_SHAPE.h;
  return { x: (CANVAS.w - w) / 2, y: CANVAS.h * 0.07, w, h };
})();
const CAM_IUP = focus(1.1, CANVAS.w / 2, FULL_SHEET.y + FULL_SHEET.h / 2);
/** The site in the full-screen sheet, canvas px. */
const SITE_CANVAS = { x: FULL_SHEET.x + (SITE_SHAPE.cx / SITE_SHAPE.w) * FULL_SHEET.w, y: FULL_SHEET.y + (SITE_SHAPE.cy / SITE_SHAPE.h) * FULL_SHEET.h };
const CAM_SITE = focus(1.55, SITE_CANVAS.x, SITE_CANVAS.y);

/** Straight zoom from a to b: about their shared fixed point (pure pan if the scale is equal). */
const zoomTo = (a: Cam, b: Cam, t: number): Cam => {
  if (Math.abs(a.s - b.s) < 1e-4) return { s: a.s, tx: lerp(a.tx, b.tx, t), ty: lerp(a.ty, b.ty, t) };
  const fx = (b.tx - a.tx) / (a.s - b.s);
  const fy = (b.ty - a.ty) / (a.s - b.s);
  const F = { x: a.s * fx + a.tx, y: a.s * fy + a.ty };
  const sc = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t));
  return { s: sc, tx: F.x - sc * fx, ty: F.y - sc * fy };
};

/** Camera at an intro frame; `end` is where the canvas must land (the MacBook's screen). */
export const desktopCamera = (frame: number, end: Cam): Cam => {
  const segs: [number, number, Cam, (t: number) => number][] = [
    [DESK.start, DESK.zoomEnd, CAM_DESK, Easing.bezier(0.55, 0, 0.3, 1)],
    [DESK.toDock[0], DESK.toDock[1], CAM_DOCK, io],
    [DESK.toWide[0], DESK.toWide[1], CAM_WIDE, io],
    [DESK.toWide[1], DESK.toFolder[0], CAM_PUSH, Easing.bezier(0.3, 0, 0.6, 1)],
    [DESK.toFolder[0], DESK.toFolder[1], CAM_FOLDER, io],
    ...DESK.toField.map((f, i) => [f[0], f[1], CAM_FIELDS[i], io] as [number, number, Cam, (t: number) => number]),
    [DESK.toIUP[0], DESK.toIUP[1], CAM_IUP, io],
    [DESK.toSite[0], DESK.toSite[1], CAM_SITE, io],
    [DESK.pullBack[0], DESK.pullBack[1], end, Easing.bezier(0.55, 0, 0.35, 1)],
  ];
  let cur = CAM_VIDEO;
  for (const [f0, f1, target, ease] of segs) {
    if (frame <= f0) return cur;
    if (frame >= f1) {
      cur = target;
      continue;
    }
    return zoomTo(cur, target, ease((frame - f0) / (f1 - f0)));
  }
  return cur;
};

/* ---- Pieces ---- */
const Wallpaper: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(60% 70% at 18% 22%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%), radial-gradient(55% 60% at 85% 30%, rgba(146,196,232,0.85) 0%, rgba(146,196,232,0) 70%), radial-gradient(70% 70% at 70% 95%, rgba(126,200,160,0.75) 0%, rgba(126,200,160,0) 70%), radial-gradient(60% 60% at 10% 90%, rgba(196,214,236,0.9) 0%, rgba(196,214,236,0) 70%), linear-gradient(160deg, #EEF3F7 0%, #D6E4EE 50%, #CFE3DA 100%)",
    }}
  />
);

const MenuBar: React.FC<{ app: string }> = ({ app }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: CANVAS.w,
      height: 36,
      display: "flex",
      alignItems: "center",
      gap: 26,
      padding: "0 22px",
      boxSizing: "border-box",
      background: "rgba(255,255,255,0.45)",
      backdropFilter: "blur(20px)",
      fontFamily,
      fontSize: 17,
      color: "#1D1D1F",
    }}
  >
    <svg width={18} height={20} viewBox="0 0 24 24" fill="#1D1D1F">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
    <span style={{ fontWeight: 700 }}>{app}</span>
    {["File", "Edit", "View", "Window", "Help"].map((m) => (
      <span key={m}>{m}</span>
    ))}
    <span style={{ marginLeft: "auto", fontWeight: 500 }}>Mon 9:41 AM</span>
  </div>
);

const WindowChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: WIN.w, height: WIN_H, borderRadius: 14, overflow: "hidden", background: "#1C1C1E" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: WIN.w, height: WIN.title, background: "linear-gradient(180deg,#3A3A3D,#2C2C2F)", display: "flex", alignItems: "center" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
        <div key={c} style={{ position: "absolute", left: 20 + i * 24, top: WIN.title / 2 - 7, width: 14, height: 14, borderRadius: 7, background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)" }} />
      ))}
      <div style={{ width: "100%", textAlign: "center", color: "rgba(255,255,255,0.75)", fontFamily, fontSize: 18, fontWeight: 600 }}>Tumpang Pitu — drone.mov</div>
    </div>
    <div style={{ position: "absolute", left: 0, top: WIN.title, width: WIN.w, height: VIDEO_H, overflow: "hidden" }}>{children}</div>
  </div>
);
/** Yellow (minimise) button, canvas px. */
const MIN_BTN = { x: WIN.x + 20 + 24 + 7, y: WIN.y + WIN.title / 2 };

/**
 * Genie (after the ui-layouts "mac-genie" scanline renderer): a snapshot of the window is drawn
 * one pixel row at a time onto a canvas. Every row is pulled towards the dock icon — bottom rows
 * first, top rows last — narrowing as it goes, so the window pours into the icon as one smooth
 * sheet (no slices or seams).
 */
const RES = 1.5; // canvas pixels per canvas-px (the camera zooms in to 1.3×)
const eioC = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eIn2 = (t: number) => t * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const useWindowSnapshot = () => {
  const [snap, setSnap] = React.useState<HTMLCanvasElement | null>(null);
  const [handle] = React.useState(() => delayRender("Genie window snapshot"));
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = WIN.w * RES;
      c.height = WIN_H * RES;
      const g = c.getContext("2d")!;
      g.scale(RES, RES);
      g.save();
      g.beginPath();
      g.roundRect(0, 0, WIN.w, WIN_H, 14);
      g.clip();
      g.fillStyle = "#1C1C1E";
      g.fillRect(0, 0, WIN.w, WIN_H);
      const tb = g.createLinearGradient(0, 0, 0, WIN.title);
      tb.addColorStop(0, "#3A3A3D");
      tb.addColorStop(1, "#2C2C2F");
      g.fillStyle = tb;
      g.fillRect(0, 0, WIN.w, WIN.title);
      ["#FF5F57", "#FEBC2E", "#28C840"].forEach((col, i) => {
        g.beginPath();
        g.arc(27 + i * 24, WIN.title / 2, 7, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
      });
      g.fillStyle = "rgba(255,255,255,0.75)";
      g.font = `600 18px ${fontFamily}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("Tumpang Pitu — drone.mov", WIN.w / 2, WIN.title / 2);
      g.drawImage(img, 0, WIN.title, WIN.w, VIDEO_H);
      drawStillCaption(g, 0, WIN.title, WIN.w);
      g.restore();
      setSnap(c);
      continueRender(handle);
    };
    img.onerror = () => continueRender(handle);
    img.src = staticFile("intro/window_still.jpg");
  }, [handle]);
  return snap;
};

const Genie: React.FC<{ p: number }> = ({ p }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const snap = useWindowSnapshot();
  React.useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !snap) return;
    const g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    g.setTransform(RES, 0, 0, RES, 0, 0);
    const rows = Math.round(WIN_H * RES);
    for (let i = 0; i < rows; i++) {
      const r = i / rows;
      const y = r * WIN_H;
      // Bottom rows start first (minimise).
      const xS = (1 - r) * 0.65;
      const xE = eioC(clamp01((p - xS) / (1 - xS)));
      const yS = (1 - r) * 0.2;
      const yE = eIn2(clamp01((p - yS) / (1 - yS)));
      const left = lerp(WIN.x, QT_X, xE);
      const right = lerp(WIN.x + WIN.w, QT_X, xE);
      const destY = lerp(WIN.y + y, DOCK_ICON_Y, yE);
      const rowW = right - left;
      if (rowW < 0.6) continue;
      g.drawImage(snap, 0, i, snap.width, 1, left, destY, rowW, 1 / RES + 0.35);
    }
  }, [p, snap]);
  return <canvas ref={ref} width={CANVAS.w * RES} height={CANVAS.h * RES} style={{ position: "absolute", left: 0, top: 0, width: CANVAS.w, height: CANVAS.h }} />;
};

const GeoWiseIcon: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      position: "absolute",
      left: size * 0.09,
      top: size * 0.09,
      width: size * 0.82,
      height: size * 0.82,
      borderRadius: size * 0.82 * 0.225,
      background: "linear-gradient(180deg, #FFFFFF 0%, #ECECEE 100%)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Img src={staticFile("logo-a.svg")} style={{ width: size * 0.82 * 0.66, height: size * 0.82 * 0.66 }} />
  </div>
);

const Cursor: React.FC<{ x: number; y: number; press: boolean; opacity: number }> = ({ x, y, press, opacity }) => (
  <svg width={34} height={34} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, opacity, scale: press ? 0.86 : 1, transformOrigin: "0 0", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))" }}>
    <path d="M4 2 L4 20 L9 15.5 L12.5 22 L15.5 20.6 L12.2 14.3 L19 14 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
);

const CONTINUE = { x: APP.x + APP.w * CONTINUE_BTN.x, y: APP.y + APP.title + APP_CONTENT_H * CONTINUE_BTN.y };

/** The MacBook display's notch and corner radius, in canvas px (MacBook.tsx proportions). */
const NOTCH = { w: CANVAS.w * 0.13, h: CANVAS.h * 0.032, r: CANVAS.w * 0.012, dot: CANVAS.w * 0.006 };
const SCREEN_RADIUS = ((0.034 * 0.45) / (1 - 2 * 0.019)) * CANVAS.w;

/** Cursor path (canvas px). */
const cursorAt = (frame: number) => {
  const H = DESK.hover;
  const keys: [number, number, number][] = [
    [DESK.cursorIn, 1560, 980],
    [DESK.minimize - 2, MIN_BTN.x - 4, MIN_BTN.y - 4],
    [DESK.minimize + 8, MIN_BTN.x - 4, MIN_BTN.y - 4],
    [H[0], QT_X, DOCK_ICON_Y], // follows the window down into its icon
    [H[1], BASE_X[idx("safari")], DOCK_ICON_Y],
    [H[2], BASE_X[idx("maps")], DOCK_ICON_Y],
    [H[3], GW_X, DOCK_ICON_Y],
    [DESK.launch + 8, GW_X, DOCK_ICON_Y],
    [DESK.launch + 60, 1330, 820],
    [DESK.continueClick - 26, 1330, 820],
    [DESK.continueClick - 3, CONTINUE.x, CONTINUE.y],
    [DESK.continueClick + 10, CONTINUE.x, CONTINUE.y],
    [DESK.folderClick - 3, FOLDER.cx + 8, FOLDER.cy + 10],
  ];
  const fs = keys.map((k) => k[0]);
  const e = Easing.inOut(Easing.sin);
  return {
    x: interpolate(frame, fs, keys.map((k) => k[1]), { ...clamp, easing: e }),
    y: interpolate(frame, fs, keys.map((k) => k[2]), { ...clamp, easing: e }),
  };
};

export const MacDesktop: React.FC<{ footage: React.ReactNode }> = ({ footage }) => {
  const frame = useCurrentFrame();
  const genie = interpolate(frame, [...DESK.genie], [0, 1], clamp);
  const minimized = frame >= DESK.minimize + 3;
  const cur = cursorAt(frame);
  const act = interpolate(frame, [DESK.hover[0] - 12, DESK.hover[0], DESK.launch + 6, DESK.launch + 22], [0, 1, 1, 0], { ...clamp, easing: io });
  const layout = dockLayout(cur.x, act);
  const launched = frame >= DESK.launch;
  // One bounce on launch (a second one read as a double click).
  const bounce = launched ? Math.sin(Math.min(1, (frame - DESK.launch) / 16) * Math.PI) * 30 : 0;
  const open = interpolate(frame, [...DESK.winOpen], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.9, 0.3, 1) });
  const max = interpolate(frame, [...DESK.maximize], [0, 1], { ...clamp, easing: io });
  const toMap = interpolate(frame, [...DESK.step2], [0, 1], { ...clamp, easing: io });
  const uploaded = interpolate(frame, [...DESK.uploaded], [0, 1], clamp);
  const popup = interpolate(frame, [...DESK.popup], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1) });
  const folderOpen = interpolate(frame, [...DESK.folderOpen], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.4, 0.64, 1) });
  const rise = interpolate(frame, [...DESK.cardsRise], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1) });
  const name = "Tumpang Pitu";
  const typedN = Math.floor(interpolate(frame, [...DESK.typing], [0, name.length], clamp));
  const filled = [0, 1, 2].map((i) => (i < 2 ? interpolate(frame, [DESK.flights[i][1] - 2, DESK.flights[i][1] + 10], [0, 1], clamp) : 0)) as [number, number, number];
  const form = {
    frame,
    typed: name.slice(0, typedN),
    caret: frame >= DESK.popup[1] && frame < DESK.typing[1] + 10 && Math.floor(frame / 8) % 2 === 0,
    filled,
    detecting: frame >= DESK.detect[0] && frame < DESK.detect[1] ? 1 : 0,
    detected: interpolate(frame, [DESK.detect[1], DESK.detect[1] + 12], [0, 1], clamp),
  };
  // GeoWise window rect: icon → window → full screen.
  const winRect = {
    x: lerp(APP.x, 0, max),
    y: lerp(APP.y, 0, max),
    w: lerp(APP.w, CANVAS.w, max),
    h: lerp(APP.title + APP_CONTENT_H, CANVAS.h, max),
  };
  const titleH = APP.title * (1 - max);
  const welcomeRate = 2.15 / ((DESK.popup[1] + 10 - DESK.winOpen[0]) / 30);
  const welcomeEnd = DESK.popup[1] + 10 - DESK.winOpen[0];
  const gwI = idx("geowise");
  const gwSize = layout.sizes[gwI];
  const from = { x: layout.centers[gwI] - gwSize / 2, y: ICON_BOTTOM - gwSize, w: gwSize, h: gwSize };
  const appX = lerp(from.x, winRect.x, open);
  const appY = lerp(from.y, winRect.y, open);
  const appW = lerp(from.w, winRect.w, open);
  const appH = lerp(from.h, winRect.h, open);
  const contentTop = titleH * (appH / (APP.title + APP_CONTENT_H));
  const hovered = DOCK.map((d, i) => (d === "sep" ? false : Math.abs(cur.x - layout.centers[i]) < layout.sizes[i] / 2 && Math.abs(cur.y - DOCK_ICON_Y) < 80));
  const cursorO = interpolate(frame, [DESK.cursorIn, DESK.cursorIn + 8, DESK.folderClick + 12, DESK.folderClick + 22], [0, 1, 1, 0], clamp);
  const scanP = interpolate(frame, [...DESK.scan], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1) });
  const cardIn = interpolate(frame, [DESK.planCard[0], DESK.planCard[0] + 22], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.3, 0.64, 1) });
  const cardOut = interpolate(frame, [DESK.planCard[1], DESK.planCard[2]], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const flying = DESK.flights.map(([f0, f1]) => (frame >= f0 && frame < f1 ? (frame - f0) / (f1 - f0) : -1));

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS.w, height: CANVAS.h, overflow: "hidden", fontFamily, borderRadius: SCREEN_RADIUS * max }}>
      <Wallpaper />
      <MenuBar app={launched ? "GeoWise" : "QuickTime Player"} />
      {/* Folder of site data on the desktop, its cards between back and front */}
      <Folder open={folderOpen}>
          {FILES.map((f, i) => {
            if (frame >= DESK.flights[i][0]) return null;
            const r0 = cardRest(i, rise);
            return (
              <div key={f.key} style={{ position: "absolute", left: r0.x - 50, top: r0.y - 62, rotate: `${r0.rot}deg`, opacity: rise > 0 ? 1 : 0 }}>
                <FileCard file={f} />
              </div>
            );
          })}
        </Folder>
      {/* QuickTime window (live footage), then the genie */}
      {!minimized ? (
        <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN_H, boxShadow: "0 40px 90px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.25)", borderRadius: 14 }}>
          <WindowChrome>
            {frame >= DESK.minimize ? (
              <div style={{ position: "relative", width: WIN.w, height: VIDEO_H }}>
                <Img src={staticFile("intro/window_still.jpg")} style={{ width: WIN.w, height: VIDEO_H }} />
                <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", scale: WIN.w / 1920 }}>
                  <StillCaption />
                </div>
              </div>
            ) : (
              footage
            )}
          </WindowChrome>
        </div>
      ) : genie < 1 ? (
        <Genie p={genie} />
      ) : null}
      {/* Dock */}
      <div
        style={{
          position: "absolute",
          left: layout.left - DOCK_PAD,
          top: DOCK_BOTTOM - (ICON + DOCK_PAD * 2),
          width: layout.total + DOCK_PAD * 2,
          height: ICON + DOCK_PAD * 2,
          borderRadius: 30,
          background: "rgba(255,255,255,0.42)",
          backdropFilter: "blur(24px) saturate(160%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 0 1px rgba(0,0,0,0.08), 0 18px 40px -16px rgba(0,0,0,0.3)",
        }}
      />
      {DOCK.map((d, i) => {
        const size = layout.sizes[i];
        const cx = layout.centers[i];
        if (d === "sep") {
          return <div key="sep" style={{ position: "absolute", left: cx - 1, top: ICON_BOTTOM - ICON + 10, width: 2, height: ICON - 20, background: "rgba(0,0,0,0.18)", borderRadius: 1 }} />;
        }
        const running = d.key === "finder" || d.key === "quicktime" || (d.key === "geowise" && launched);
        const lift = d.key === "geowise" ? bounce : 0;
        return (
          <React.Fragment key={d.key}>
            <div style={{ position: "absolute", left: cx - size / 2, top: ICON_BOTTOM - size - lift, width: size, height: size, opacity: d.key === "geowise" ? 1 - open * 0 : 1 }}>
              {d.icon ? <Img src={staticFile(d.icon)} style={{ width: size, height: size }} /> : <GeoWiseIcon size={size} />}
            </div>
            {running ? <div style={{ position: "absolute", left: cx - 3, top: DOCK_BOTTOM - 8, width: 6, height: 6, borderRadius: 3, background: "rgba(0,0,0,0.55)" }} /> : null}
            {hovered[i] && act > 0.6 && !launched ? (
              <div
                style={{
                  position: "absolute",
                  left: cx - 150,
                  width: 300,
                  top: ICON_BOTTOM - size - 54,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(40,40,44,0.82)", color: "#fff", fontSize: 18, fontWeight: 600, whiteSpace: "nowrap" }}>{d.label}</div>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      {/* GeoWise window: grows out of its icon, welcome screen → Create a Mining Site → map */}
      {open > 0 ? (
        <div
          style={{
            position: "absolute",
            left: appX,
            top: appY,
            width: appW,
            height: appH,
            borderRadius: lerp(22, lerp(12, 0, max), open),
            overflow: "hidden",
            opacity: interpolate(open, [0, 0.12], [0, 1], clamp),
            background: "#FFFFFF",
            boxShadow: `0 40px 90px -24px rgba(0,0,0,${0.45 * (1 - max)}), 0 0 0 1px rgba(0,0,0,${0.12 * (1 - max)})`,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: APP.w, height: APP.title + APP_CONTENT_H, transformOrigin: "0 0", scale: `${appW / APP.w} ${appH / (APP.title + APP_CONTENT_H)}` }}>
            {/* Title bar (collapses as the window goes full-screen) */}
            <div style={{ position: "absolute", left: 0, top: 0, width: APP.w, height: APP.title, background: "linear-gradient(180deg,#F2F0EE,#E8E5E2)", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", opacity: 1 - max }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                <div key={c} style={{ position: "absolute", left: 18 + i * 22, top: APP.title / 2 - 6.5, width: 13, height: 13, borderRadius: 7, background: c }} />
              ))}
              <div style={{ width: "100%", textAlign: "center", fontSize: 16, fontWeight: 600, color: "#4A4643" }}>GeoWise</div>
            </div>
            <div style={{ position: "absolute", left: 0, top: titleH, width: APP.w, height: APP_CONTENT_H + APP.title * max, overflow: "hidden" }}>
              <Sequence from={DESK.winOpen[0]} layout="none">
                <Freeze frame={welcomeEnd} active={(f) => f >= welcomeEnd}>
                  <Video src={staticFile("recordings/welcome.mp4")} muted playbackRate={welcomeRate} objectFit="cover" style={{ width: "100%", height: "100%" }} />
                </Freeze>
              </Sequence>
              {/* Scan sweep: spatial data being transformed */}
              {scanP > 0 && scanP < 1 ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${lerp(-30, 105, scanP)}%`,
                      width: "26%",
                      background: "linear-gradient(90deg, rgba(120,220,170,0) 0%, rgba(120,220,170,0.28) 70%, rgba(200,255,225,0.75) 97%, rgba(255,255,255,0) 100%)",
                      mixBlendMode: "screen",
                    }}
                  />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: `${lerp(-30, 105, scanP) + 26}%`, width: 2, background: "rgba(220,255,235,0.9)", boxShadow: "0 0 18px 4px rgba(61,220,132,0.7)" }} />
                </>
              ) : null}
              {/* Sheet */}
              {popup > 0 ? (
                <>
                  <div style={{ position: "absolute", inset: 0, background: `rgba(30,25,20,${0.22 * popup})` }} />
                  <div
                    style={{
                      position: "absolute",
                      left: POPUP.inset,
                      top: POPUP.inset,
                      width: APP.w - POPUP.inset * 2,
                      height: APP_CONTENT_H - POPUP.inset * 2,
                      borderRadius: 22,
                      background: "#F1ECE9",
                      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
                      translate: `0px ${(1 - popup) * 80}px`,
                      opacity: popup,
                      overflow: "hidden",
                    }}
                  >
                    <MiningSiteForm s={form} width={APP.w - POPUP.inset * 2} height={APP_CONTENT_H - POPUP.inset * 2} />
                  </div>
                </>
              ) : null}
              {/* The allocation map, once the site is set up */}
            </div>
          </div>
        </div>
      ) : null}
      {/* Home screen + Site Boundary sheet, laid out at the window content's real size (so it
          matches the MacBook screen exactly once full-screen) */}
      {toMap > 0 ? (
        <div style={{ position: "absolute", left: appX, top: appY + contentTop, width: appW, height: appH - contentTop, opacity: toMap, overflow: "hidden", borderRadius: `0 0 ${lerp(12, 0, max)}px ${lerp(12, 0, max)}px` }}>
          <HomeWithBoundary sheet={1} done={uploaded} glow={interpolate(frame, [...DESK.highlight], [0, 1], clamp)} permit={interpolate(frame, [...DESK.permit], [0, 1], clamp)} />
        </div>
      ) : null}
      {/* Once full-screen it is the MacBook's display: its notch and glass come into view as we pull back */}
      {max > 0 ? (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)", opacity: max }} />
          <div
            style={{
              position: "absolute",
              left: CANVAS.w / 2 - NOTCH.w / 2,
              top: -1,
              width: NOTCH.w,
              height: NOTCH.h,
              background: "#0B0B0D",
              borderBottomLeftRadius: NOTCH.r,
              borderBottomRightRadius: NOTCH.r,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: max,
            }}
          >
            <div style={{ width: NOTCH.dot, height: NOTCH.dot, borderRadius: "50%", background: "#1F2937", boxShadow: "inset 0 0 2px #3B82F6" }} />
          </div>
        </>
      ) : null}
      {/* "Reclamation plan" card floating over the window */}
      {cardIn > 0 && cardOut < 1 ? (
        <div style={{ position: "absolute", left: APP.x + APP.w - 400, top: APP.y + 470, opacity: Math.min(cardIn * 1.5, 1) * (1 - cardOut), translate: `${cardOut * 120}px ${(1 - cardIn) * 40}px`, scale: 0.85 + 0.15 * cardIn }}>
          <PlanCard />
        </div>
      ) : null}
      {/* Cards in flight, above everything */}
      {FILES.map((f, i) => {
        const p = flying[i];
        if (p < 0) return null;
        const pose = flightPose(i, p);
        return (
          <div key={f.key} style={{ position: "absolute", left: pose.x - 50, top: pose.y - 62, rotate: `${pose.rot}deg`, scale: pose.scale, opacity: pose.opacity }}>
            <FileCard file={f} style={{ boxShadow: "0 24px 40px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)" }} />
          </div>
        );
      })}
      <Cursor x={cur.x} y={cur.y} press={[DESK.minimize, DESK.launch, DESK.continueClick, DESK.folderClick].some((c) => frame >= c && frame < c + 4)} opacity={cursorO} />
    </div>
  );
};
