import React from "react";
import { AbsoluteFill, getStaticFiles, Img, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { fontFamily } from "./theme";

// MacBook Pro 14" display: 3024x1964 px = 1512x982 pt — the same aspect as the
// GeoWise recordings, so the full UI fits the screen with nothing cropped.
const SCREEN_ASPECT = 982 / 1512;

/**
 * Light MacBook Pro mockup. `width` is the lid width in px.
 * Children (or `src`) render inside the screen, uncropped.
 */
export const MacBook: React.FC<{
  width: number;
  src?: string;
  image?: string;
  trimBefore?: number;
  playbackRate?: number;
  children?: React.ReactNode;
  showBase?: boolean;
  style?: React.CSSProperties;
}> = ({ width, src, image, trimBefore, playbackRate, children, showBase = true, style }) => {
  const bezel = width * 0.019;
  const sw = width - bezel * 2;
  const sh = sw * SCREEN_ASPECT;
  const lidH = sh + bezel * 2.2;
  const radius = width * 0.034;
  const baseW = width * 1.13;
  const baseH = width * 0.028;
  return (
    <div style={{ position: "relative", width, height: lidH + (showBase ? baseH : 0), ...style }}>
      {/* Lid */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height: lidH,
          borderRadius: radius,
          background: "#0B0B0D",
          boxShadow: `0 0 0 ${Math.max(1.5, width * 0.0035)}px #C9CCD1, 0 0 0 ${Math.max(2.5, width * 0.0055)}px #9EA2A8, 0 ${width * 0.04}px ${width * 0.07}px -${width * 0.02}px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: bezel,
            top: bezel,
            width: sw,
            height: sh,
            borderRadius: radius * 0.45,
            overflow: "hidden",
            background: "#000",
          }}
        >
          {src ? (
            <Video
              src={staticFile(src)}
              trimBefore={trimBefore}
              playbackRate={playbackRate}
              muted
              style={{ width: sw, height: sh, objectFit: "fill" }}
            />
          ) : null}
          {image ? <Img src={staticFile(image)} style={{ width: sw, height: sh, objectFit: "fill" }} /> : null}
          {children}
          {/* Glass reflection */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)",
              pointerEvents: "none",
            }}
          />
        </div>
        {/* Notch with camera */}
        <div
          style={{
            position: "absolute",
            left: width / 2 - sw * 0.065,
            top: bezel - 1,
            width: sw * 0.13,
            height: sh * 0.032,
            background: "#0B0B0D",
            borderBottomLeftRadius: sw * 0.012,
            borderBottomRightRadius: sw * 0.012,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: sw * 0.006, height: sw * 0.006, borderRadius: "50%", background: "#1F2937", boxShadow: "inset 0 0 2px #3B82F6" }} />
        </div>
      </div>
      {/* Base */}
      {showBase ? (
        <div
          style={{
            position: "absolute",
            left: (width - baseW) / 2,
            top: lidH - 1,
            width: baseW,
            height: baseH,
            borderRadius: `${baseH * 0.25}px ${baseH * 0.25}px ${baseH * 1.4}px ${baseH * 1.4}px / ${baseH * 0.25}px ${baseH * 0.25}px ${baseH}px ${baseH}px`,
            background: "linear-gradient(180deg, #F2F3F5 0%, #D6D8DC 45%, #A9ADB3 100%)",
            boxShadow: `0 ${baseH * 0.9}px ${baseH * 1.6}px -${baseH * 0.4}px rgba(0,0,0,0.35), inset 0 1px 0 #fff`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: baseW / 2 - width * 0.075,
              top: 0,
              width: width * 0.15,
              height: baseH * 0.38,
              borderBottomLeftRadius: baseH * 0.5,
              borderBottomRightRadius: baseH * 0.5,
              background: "linear-gradient(180deg, #B9BCC1 0%, #D4D6DA 100%)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

/**
 * Full-bleed footage slot. Shows the clip if it exists in public/,
 * otherwise a labelled placeholder so the timeline still reads.
 */
export const FootageSlot: React.FC<{
  file: string;
  label: string;
  trimBefore?: number;
  style?: React.CSSProperties;
}> = ({ file, label, trimBefore, style }) => {
  const exists = getStaticFiles().some((f) => f.name === file);
  if (exists) {
    return (
      <Video
        src={staticFile(file)}
        trimBefore={trimBefore}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      />
    );
  }
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #3F3A33 0%, #6B6155 50%, #2E2B27 100%)",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        ...style,
      }}
    >
      <div
        style={{
          border: "4px dashed rgba(255,255,255,0.45)",
          borderRadius: 32,
          padding: "48px 64px",
          textAlign: "center",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em" }}>{label}</div>
        <div style={{ fontSize: 30, marginTop: 14, opacity: 0.75 }}>Drop clip at public/{file}</div>
      </div>
    </AbsoluteFill>
  );
};
