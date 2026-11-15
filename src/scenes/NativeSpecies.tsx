import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { BlurIn } from "../components";
import { colors, EASE_OUT, fontFamily } from "../theme";
import { AGRI_SPOTS, FOREST_SPOTS, ZONE_MAP, ZONE_POLYGONS } from "../zoneMap";

/**
 * Left-hand panel on the 3D growth shot: the native species picked for each design zone.
 * Species tiles (same rounded-square style as the One-click parameters) pop in, then each
 * flies into its zone on a map of the site's allocation (tumpang-pitu-allocation.geojson)
 * and settles there as a marker.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Zone = "forestry" | "agriculture";
const ZONE_COLOR: Record<Zone | "recreation", string> = {
  forestry: colors.forestry,
  agriculture: colors.agriculture,
  recreation: colors.recreation,
};

/* ---- Species glyphs (100 × 100) ---- */
const Trunk: React.FC<{ w?: number; h?: number; c?: string }> = ({ w = 8, h = 34, c = "#7A5232" }) => (
  <rect x={50 - w / 2} y={92 - h} width={w} height={h} rx={w / 3} fill={c} />
);
const Sengon = () => (
  <>
    <Trunk h={44} w={6} />
    <ellipse cx={50} cy={40} rx={42} ry={15} fill="#5DBB63" />
    <ellipse cx={42} cy={33} rx={22} ry={9} fill="#7ED081" />
  </>
);
const Jati = () => (
  <>
    <Trunk h={36} w={11} />
    <circle cx={34} cy={44} r={20} fill="#3E8E47" />
    <circle cx={64} cy={42} r={22} fill="#4FA459" />
    <circle cx={50} cy={28} r={20} fill="#5DB868" />
  </>
);
const CemaraLaut = () => (
  <>
    <Trunk h={30} w={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M50 ${10 + i * 11} C ${36 - i * 3} ${22 + i * 11}, ${32 - i * 3} ${26 + i * 11}, ${30 - i * 3} ${30 + i * 11} M50 ${10 + i * 11} C ${64 + i * 3} ${22 + i * 11}, ${68 + i * 3} ${26 + i * 11}, ${70 + i * 3} ${30 + i * 11}`} stroke="#4C9A6A" strokeWidth={5} strokeLinecap="round" fill="none" />
    ))}
  </>
);
const Jabon = () => (
  <>
    <Trunk h={42} w={7} />
    <circle cx={50} cy={38} r={28} fill="#8CCB5E" />
    <circle cx={42} cy={30} r={12} fill="#A6DA7B" />
  </>
);
const Pinus = () => (
  <>
    <Trunk h={18} w={7} />
    <path d="M50 8 L74 42 L60 42 L80 70 L20 70 L40 42 L26 42 Z" fill="#2F7A4B" />
    <path d="M50 8 L62 25 L50 25 Z" fill="#3E9460" />
  </>
);
const Kakao = () => (
  <>
    <path d="M50 8 C 52 20, 50 30, 50 40" stroke="#5A7A3A" strokeWidth={4} fill="none" />
    <path d="M50 14 C 66 6, 82 14, 80 26 C 66 30, 56 24, 50 14 Z" fill="#6DB15A" />
    <ellipse cx={50} cy={64} rx={20} ry={28} fill="#C9792E" />
    {[-10, 0, 10].map((dx) => (
      <path key={dx} d={`M${50 + dx} 38 C ${50 + dx * 1.6} 60, ${50 + dx * 1.6} 70, ${50 + dx} 90`} stroke="#A75F1F" strokeWidth={2.5} fill="none" />
    ))}
  </>
);
const Karet = () => (
  <>
    <Trunk h={48} w={12} c="#8B6A4E" />
    <ellipse cx={50} cy={32} rx={34} ry={22} fill="#4F9E5A" />
    <path d="M44 66 L56 62" stroke="#E9E4D8" strokeWidth={3} />
    <path d="M56 62 L56 74" stroke="#F4F1EA" strokeWidth={3} />
    <rect x={51} y={74} width={12} height={9} rx={2} fill="#D7D2C6" />
  </>
);
const Gamal = () => (
  <>
    <Trunk h={30} w={6} />
    <ellipse cx={50} cy={46} rx={34} ry={22} fill="#6FB46B" />
    {[
      [32, 40],
      [52, 30],
      [68, 44],
      [44, 54],
      [60, 58],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={6} fill="#E58BB4" />
    ))}
  </>
);

type Species = { name: string; zone: Zone; Art: React.FC };
const SPECIES: Species[] = [
  { name: "Sengon", zone: "forestry", Art: Sengon },
  { name: "Jati", zone: "forestry", Art: Jati },
  { name: "Cemara Laut", zone: "forestry", Art: CemaraLaut },
  { name: "Jabon", zone: "forestry", Art: Jabon },
  { name: "Pinus", zone: "forestry", Art: Pinus },
  { name: "Kakao", zone: "agriculture", Art: Kakao },
  { name: "Karet", zone: "agriculture", Art: Karet },
  { name: "Gamal", zone: "agriculture", Art: Gamal },
];

/* ---- Layout (1920 × 1080) ---- */
const MAP = { left: 110, top: 330, w: 340, pad: 16 };
const MAP_K = MAP.w / ZONE_MAP.w;
const MAP_H = ZONE_MAP.h * MAP_K;
const TILE = 96;
const GRID = { x0: 560, dx: 150, y0: 400, dy: 150 };
/** Tile slots before the flight: two columns beside the map. */
const SLOT = (i: number) => ({ x: GRID.x0 + (i % 2) * GRID.dx, y: GRID.y0 + Math.floor(i / 2) * GRID.dy });

/** Scene frames (beat 6). */
export const SPECIES_TIMING = { copyIn: 52, tilesIn: 70, tileStep: 5, flyAt: 140, flyStep: 7, flyDur: 30 };

/** Frame each species lands in its zone. */
const landAt = (i: number) => SPECIES_TIMING.flyAt + i * SPECIES_TIMING.flyStep + SPECIES_TIMING.flyDur;
/** 0 → 1 → 0 over `len` frames after `at`. */
const bump = (frame: number, at: number, len: number) => (frame < at || frame > at + len ? 0 : Math.sin((Math.PI * (frame - at)) / len));

/**
 * Exit with follow-through: slides off towards its side while fading and softening, each part
 * a few frames after the one before (`order`), so the overlay peels away in sequence.
 */
export const Exit: React.FC<{ at: number; order: number; dir: -1 | 1; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  order,
  dir,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const e = interpolate(frame, [at + order * 5, at + order * 5 + 24], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  return (
    <div style={{ ...style, translate: `${dir * 240 * e}px 0px`, opacity: 1 - e, filter: e > 0.01 ? `blur(${e * 6}px)` : undefined }}>
      {children}
    </div>
  );
};

const spotFor = (i: number) => {
  const s = SPECIES[i];
  const idx = SPECIES.filter((x, j) => x.zone === s.zone && j < i).length;
  const [mx, my] = s.zone === "forestry" ? FOREST_SPOTS[idx] : AGRI_SPOTS[idx];
  return { x: MAP.left + MAP.pad + mx * MAP_K, y: MAP.top + MAP.pad + my * MAP_K };
};

const SpeciesTile: React.FC<{ s: Species; i: number }> = ({ s, i }) => {
  const frame = useCurrentFrame();
  const T = SPECIES_TIMING;
  const inAt = T.tilesIn + i * T.tileStep;
  const pop = interpolate(frame, [inAt, inAt + 22], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const popO = interpolate(frame, [inAt, inAt + 8], [0, 1], clamp);
  const flyStart = T.flyAt + i * T.flyStep;
  const fly = interpolate(frame, [flyStart, flyStart + T.flyDur], [0, 1], { ...clamp, easing: Easing.bezier(0.6, 0, 0.25, 1) });
  const slot = SLOT(i);
  const spot = spotFor(i);
  // Arc: lifts as it travels, lands on the spot.
  const x = lerp(slot.x, spot.x, fly);
  const y = lerp(slot.y, spot.y, fly) - Math.sin(Math.PI * fly) * 70;
  const float = Math.sin((frame + i * 13) / 20) * 5 * (1 - fly);
  const k = pop * lerp(1, 0.34, fly);
  const ring = ZONE_COLOR[s.zone];
  const labelO = popO * interpolate(fly, [0, 0.3], [1, 0], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - TILE / 2,
          top: y + float - TILE / 2,
          width: TILE,
          height: TILE,
          opacity: popO,
          scale: k,
          borderRadius: 24,
          background: "rgba(255,255,255,0.96)",
          boxShadow: `0 0 0 ${lerp(5, 9, fly)}px ${ring}${fly > 0.9 ? "FF" : "AA"}, 0 ${lerp(28, 8, fly)}px ${lerp(50, 14, fly)}px -${lerp(16, 4, fly)}px rgba(0,0,0,0.4)`,
          overflow: "hidden",
        }}
      >
        <svg width={TILE} height={TILE} viewBox="-8 -8 116 116">
          <s.Art />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: slot.x - 100,
          top: slot.y + float + TILE / 2 + 10,
          width: 200,
          opacity: labelO,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          color: "#fff",
          fontSize: 21,
          fontWeight: 700,
          whiteSpace: "nowrap",
          textShadow: "0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, background: ring, boxShadow: "0 0 0 2px rgba(255,255,255,0.85)" }} />
        {s.name}
      </div>
    </>
  );
};

export const NativeSpecies: React.FC<{ exitAt: number }> = ({ exitAt }) => {
  const frame = useCurrentFrame();
  const T = SPECIES_TIMING;
  const mapIn = interpolate(frame, [T.copyIn + 6, T.copyIn + 30], [0, 1], { ...clamp, easing: Easing.bezier(...EASE_OUT) });
  // Zones fill in as their species land, and pulse on every landing.
  const forestLit = interpolate(frame, [landAt(0) - 6, landAt(4)], [0, 1], clamp);
  const agriLit = interpolate(frame, [landAt(5) - 6, landAt(7)], [0, 1], clamp);
  const lit = { forestry: forestLit, agriculture: agriLit, recreation: 0 };
  const pulse = { forestry: 0, agriculture: 0, recreation: 0 };
  SPECIES.forEach((sp, i) => {
    pulse[sp.zone] = Math.max(pulse[sp.zone], bump(frame, landAt(i) - 2, 16));
  });
  const anyPulse = Math.max(pulse.forestry, pulse.agriculture);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily }}>
      {/* Copy */}
      <div style={{ position: "absolute", left: MAP.left, top: 170, width: 760 }}>
        <Exit at={exitAt} order={0} dir={-1}>
          <BlurIn delay={T.copyIn} duration={24}>
            <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 24, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Native species
            </div>
          </BlurIn>
        </Exit>
        <Exit at={exitAt} order={1} dir={-1}>
          <BlurIn delay={T.copyIn + 10}>
            <div style={{ marginTop: 12, color: "#fff", fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, textShadow: "0 3px 16px rgba(0,0,0,0.45)" }}>
              Picked for each design zone.
            </div>
          </BlurIn>
        </Exit>
      </div>
      {/* Site allocation map (no card) with the species flying in; they leave together */}
      <Exit at={exitAt} order={2} dir={-1} style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            left: MAP.left + MAP.pad,
            top: MAP.top + MAP.pad,
            width: MAP.w,
            height: MAP_H,
            opacity: mapIn,
            translate: `0px ${(1 - mapIn) * 30}px`,
            scale: 1 + 0.035 * anyPulse,
            filter: "drop-shadow(0 14px 26px rgba(0,0,0,0.4))",
          }}
        >
          <svg width={MAP.w} height={MAP_H} viewBox={`0 0 ${ZONE_MAP.w} ${ZONE_MAP.h}`} style={{ overflow: "visible" }}>
            {/* White halo so the zones read over the footage */}
            {ZONE_POLYGONS.map((p, i) => (
              <path key={`h${i}`} d={p.d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={16} strokeLinejoin="round" />
            ))}
            {ZONE_POLYGONS.map((p, i) => {
              const c = ZONE_COLOR[p.category];
              const pl = pulse[p.category];
              return (
                <path
                  key={i}
                  d={p.d}
                  fillRule="evenodd"
                  fill={c}
                  fillOpacity={0.5 + 0.35 * lit[p.category] + 0.15 * pl}
                  stroke={c}
                  strokeWidth={6 + 8 * pl}
                  strokeLinejoin="round"
                  style={{ filter: pl > 0.01 ? `drop-shadow(0 0 ${30 * pl}px ${c})` : undefined }}
                />
              );
            })}
            {/* Ripple from each landing spot */}
            {SPECIES.map((sp, i) => {
              const t = interpolate(frame, [landAt(i) - 2, landAt(i) + 22], [0, 1], clamp);
              if (t <= 0 || t >= 1) return null;
              const idx = SPECIES.filter((x, j) => x.zone === sp.zone && j < i).length;
              const [mx, my] = sp.zone === "forestry" ? FOREST_SPOTS[idx] : AGRI_SPOTS[idx];
              return <circle key={sp.name} cx={mx} cy={my} r={30 + 170 * t} fill="none" stroke="#fff" strokeOpacity={0.9 * (1 - t)} strokeWidth={10 * (1 - t) + 2} />;
            })}
          </svg>
        </div>
        {SPECIES.map((s, i) => (
          <SpeciesTile key={s.name} s={s} i={i} />
        ))}
      </Exit>
    </div>
  );
};
