import React from "react";
import { Img, staticFile } from "remotion";
import { fontFamily } from "../theme";

/**
 * Recreation of GeoWise's site form card at the boundary step
 * (SiteInputForm → SiteBoundaryView + SiteBoundaryUploadBar + footer).
 * Laid out in native points (880×552) and scaled up by `scale`.
 */
export const CARD_PT = { w: 880, h: 552 };
// "Start Analysis" capsule, in card points (right/bottom aligned like the SwiftUI footer, padding 20).
export const START_BTN_PT = { w: 140, h: 32, right: 20, bottom: 20 };

const secondary = "rgba(60,60,67,0.6)";
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.10), inset 0 0.5px 0 rgba(255,255,255,0.9)",
};

const Capsule: React.FC<{ children: React.ReactNode; prominent?: boolean; style?: React.CSSProperties }> = ({
  children,
  prominent = true,
  style,
}) => (
  <div
    style={{
      height: 28,
      padding: "0 14px",
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 12.5,
      fontWeight: 500,
      whiteSpace: "nowrap",
      ...(prominent
        ? { background: "#000", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.25)" }
        : { ...glass, color: "#1D1D1F" }),
      ...style,
    }}
  >
    {children}
  </div>
);

const Arrow: React.FC<{ color?: string; size?: number }> = ({ color = "#fff", size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

/** Map area of the allocation still, cropped to the site polygon (still pixels). */
const MAP_CROP = { x: 362, y: 112, w: 900, h: 1000 };
const SITE_CENTER = { x: 888, y: 640 };

const BoundaryMap: React.FC<{ w: number; h: number; reveal: number; revealOrigin: { x: number; y: number } }> = ({
  w,
  h,
  reveal,
  revealOrigin,
}) => {
  // Fit the site into the visible map above the upload bar.
  const s = 0.29;
  const cx = w / 2;
  const cy = (h - 86) / 2 + 4;
  const left = cx - SITE_CENTER.x * s;
  const top = cy - SITE_CENTER.y * s;
  // Soft edge so the cropped still melts into the flat basemap colour.
  const feather =
    "linear-gradient(to right, transparent 0, #000 3%, #000 97%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 3%, #000 97%, transparent 100%)";
  const crop = (filter: string, clip?: string) => (
    <div
      style={{
        position: "absolute",
        left: left + MAP_CROP.x * s,
        top: top + MAP_CROP.y * s,
        width: MAP_CROP.w * s,
        height: MAP_CROP.h * s,
        overflow: "hidden",
        WebkitMaskImage: feather,
        maskImage: feather,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
        clipPath: clip,
      }}
    >
      <Img
        src={staticFile("stills/alloc.png")}
        style={{
          position: "absolute",
          left: -MAP_CROP.x * s,
          top: -MAP_CROP.y * s,
          width: 1920 * s,
          height: 1246 * s,
          filter,
        }}
      />
    </div>
  );
  const r = Math.hypot(w, h) * reveal;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 16,
        overflow: "hidden",
        // Basemap tone of the still (#F3F4EA), neutral until the zones colour in.
        background: `rgb(243,${243 + reveal},${243 - 9 * reveal})`,
      }}
    >
      {/* Faint basemap streets */}
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke="#E4E2DC" strokeWidth={3} strokeLinecap="round">
          <path d={`M0 ${h * 0.22} C ${w * 0.2} ${h * 0.3}, ${w * 0.3} ${h * 0.1}, ${w * 0.45} ${h * 0.05}`} />
          <path d={`M${w * 0.7} 0 C ${w * 0.68} ${h * 0.3}, ${w * 0.85} ${h * 0.5}, ${w} ${h * 0.55}`} />
          <path d={`M0 ${h * 0.75} C ${w * 0.15} ${h * 0.7}, ${w * 0.25} ${h * 0.9}, ${w * 0.32} ${h}`} />
          <path d={`M${w * 0.78} ${h} C ${w * 0.8} ${h * 0.8}, ${w * 0.9} ${h * 0.75}, ${w} ${h * 0.8}`} />
        </g>
        <path
          d={`M${w * 0.9} 0 C ${w * 0.88} ${h * 0.2}, ${w * 0.95} ${h * 0.35}, ${w * 0.93} ${h * 0.6}`}
          stroke="#CFE0EE"
          strokeWidth={4}
          fill="none"
        />
      </svg>
      {/* Before analysis: just the site boundary (desaturated). */}
      {crop("grayscale(1)")}
      {/* After clicking: suitability zones spread out from the button. */}
      {reveal > 0 ? crop("none", `circle(${r}px at ${revealOrigin.x - (left + MAP_CROP.x * s)}px ${revealOrigin.y - (top + MAP_CROP.y * s)}px)`) : null}

      {/* Top-left map label */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          height: 26,
          padding: "0 10px",
          borderRadius: 13,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10.5,
          color: "#1D1D1F",
          ...glass,
        }}
      >
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth={2}>
          <circle cx={12} cy={12} r={9} />
          <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </svg>
        Peta standar
      </div>

      {/* Upload bar (SiteBoundaryUploadBar) */}
      <div
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 22,
          padding: 12,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...glass,
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.8} strokeLinejoin="round">
          <path d="M6 2.5h8l4.5 4.5v8" />
          <path d="M14 2.5V7h4.5" />
          <path d="M6 2.5v19h7" />
          <circle cx={18} cy={18.5} r={4.2} fill="#000" stroke="none" />
          <path d="M18 16.4v4.2M15.9 18.5h4.2" stroke="#fff" strokeWidth={1.6} />
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#1D1D1F" }}>Batas_Site_BumiSuksesindo.shp</div>
          <div style={{ fontSize: 10, color: "#000" }}>Cakupan Site: 314.85 ha · 1 poligon terdeteksi</div>
        </div>
        <Capsule>Replace</Capsule>
        <Capsule>Remove</Capsule>
      </div>
    </div>
  );
};

export const InputCard: React.FC<{
  scale: number;
  /** 0→1 colour reveal of the suitability zones on the map. */
  reveal: number;
  pressed?: boolean;
  /** false = the scene draws its own (morphing) Start Analysis button on top. */
  showButton?: boolean;
  style?: React.CSSProperties;
}> = ({ scale, reveal, pressed = false, showButton = true, style }) => {
  const mapW = CARD_PT.w - 64;
  const mapTop = 24 + 52 + 16;
  const mapH = CARD_PT.h - mapTop - 4 - 72;
  // Reveal grows from the map point nearest the Start Analysis button.
  const revealOrigin = { x: mapW * 0.86, y: mapH };
  return (
    <div style={{ width: CARD_PT.w * scale, height: CARD_PT.h * scale, ...style }}>
      <div
        style={{
          width: CARD_PT.w,
          height: CARD_PT.h,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          position: "relative",
          borderRadius: 18,
          fontFamily,
          color: "#1D1D1F",
          background: "rgba(250,250,250,0.92)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow: "0 0 0 0.5px rgba(0,0,0,0.10), 0 30px 70px -20px rgba(0,0,0,0.35), 0 10px 24px -12px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header row (SiteBoundaryView) */}
        <div style={{ position: "absolute", left: 32, right: 32, top: 24, display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...glass,
            }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>Create a Site Boundary</div>
            <div style={{ fontSize: 12, color: secondary }}>
              One last step: upload your site boundary or draw it directly on the map.
            </div>
          </div>
          {/* Boundary method picker */}
          <div
            style={{
              display: "flex",
              padding: 3,
              borderRadius: 16,
              background: "rgba(0,0,0,0.06)",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <div style={{ padding: "6px 14px", borderRadius: 13, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>Upload File</div>
            <div style={{ padding: "6px 14px", color: "#1D1D1F" }}>Draw Boundaries</div>
          </div>
        </div>

        {/* Map */}
        <div style={{ position: "absolute", left: 32, top: mapTop }}>
          <BoundaryMap w={mapW} h={mapH} reveal={reveal} revealOrigin={revealOrigin} />
        </div>

        {/* Footer: Start Analysis */}
        {showButton ? (
        <div
          style={{
            position: "absolute",
            right: START_BTN_PT.right,
            bottom: START_BTN_PT.bottom,
            width: START_BTN_PT.w,
            height: START_BTN_PT.h,
            borderRadius: START_BTN_PT.h / 2,
            background: "#000",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            scale: pressed ? 0.94 : 1,
            boxShadow: "0 3px 8px rgba(0,0,0,0.22), inset 0 0.5px 0 rgba(255,255,255,0.25)",
          }}
        >
          Start Analysis
          <Arrow />
        </div>
        ) : null}
      </div>
    </div>
  );
};
