import React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontFamily, lightTheme, ThemeContext } from "./theme";
import { INTRO_FRAMES, LightIntroScene, MEET_VO_AT } from "./scenes/LightIntro";
import { DESK } from "./scenes/MacDesktop";
import { LayersScene, LAYERS_VO_TIMING } from "./scenes/LayersScene";
import {
  LightAllocationScene,
  LightIntegratedScene,
  LightMacFlip,
  MAC_FLIP_FRAMES,
  LightOneClickScene,
  LightOutroScene,
  LightThreeDScene,
  LightVisionScene,
  THREED_FRAMES,
  VISION_FRAMES,
} from "./scenes/LightScenes";

/* Scene lengths and the fades between them (frames, 30 fps). */
const DUR = {
  intro: INTRO_FRAMES,
  layers: LAYERS_VO_TIMING.duration,
  oneClick: 250,
  suitability: 525,
  flip: MAC_FLIP_FRAMES,
  integrated: 254,
  vision: VISION_FRAMES,
  threeD: THREED_FRAMES,
  outro: 213, // trimmed so the cut is exactly 2:00
};
const FADE = { intro: 15, oneClick: 25, suitability: 0, flip: 8, integrated: 8, vision: 14, threeD: 24 };

/* Where each scene starts in the composition. */
const AT = (() => {
  const layers = DUR.intro - FADE.intro;
  const oneClick = layers + DUR.layers; // hard cut
  const suitability = oneClick + DUR.oneClick - FADE.oneClick;
  const flip = suitability + DUR.suitability - FADE.suitability;
  const integrated = flip + DUR.flip - FADE.flip;
  const vision = integrated + DUR.integrated - FADE.integrated;
  const threeD = vision + DUR.vision - FADE.vision;
  const outro = threeD + DUR.threeD - FADE.threeD;
  return { layers, oneClick, suitability, flip, integrated, vision, threeD, outro, end: outro + DUR.outro };
})();

/** Total length of the light cut (≈ 2:02 at 30 fps). */
export const GEOWISE_LIGHT_FRAMES = AT.end;

/**
 * Voice-over cues, each placed relative to its scene's start so retiming a scene moves its
 * line with it. Offsets line up a spoken word with what it names on screen (speech onsets
 * measured from the recordings).
 */
const s = (sec: number) => Math.round(sec * 30);
/** A subtitle phrase: start and end in seconds of the clip file (not the trimmed cue). */
type Line = [number, number, string];
type Cue = { file: string; from: number; trimBefore?: number; trimAfter?: number; lines: Line[] };
const VO: Cue[] = [
  // First sentence only; clip 2 is the cleaner take of "Meet GeoWise".
  {
    file: "vo-1",
    from: 50,
    trimAfter: s(11.4),
    lines: [
      [1.0, 4.1, "Every mine has an expiration date,"],
      [4.2, 7.7, "but when operations come to an end,"],
      [8.3, 11.0, "what should the post-mining land become?"],
    ],
  },
  // "Meet GeoWise…" as the GeoWise window opens on the desktop.
  {
    file: "vo-2",
    from: MEET_VO_AT,
    lines: [
      [0.85, 2.6, "Meet GeoWise,"],
      [2.85, 6.6, "a macOS application that transforms spatial data"],
      [6.6, 10.9, "into smarter, data-driven mine reclamation plans."],
    ],
  },
  // The site files fly into the form on their words.
  {
    file: "vo-3",
    from: DESK.uploadVO,
    lines: [
      [0.0, 4.6, "Simply upload the data you already have:"],
      [4.75, 8.3, "elevation models, aerial imagery,"],
      [8.35, 10.7, "and site boundaries."],
      [10.8, 13.4, "GeoWise automatically identifies"],
      [13.46, 16.1, "the mining permit areas within your site."],
    ],
  },
  // Each layer appears on its word.
  {
    file: "vo-4",
    from: AT.layers - 94,
    lines: [
      [0.4, 3.3, "It brings together"],
      [3.5, 6.9, "road, river, power line,"],
      [7.0, 10.5, "village, slope, elevation,"],
      [10.9, 14.4, "all aligned within a unified spatial grid."],
    ],
  },
  // "Click" on the click (scene frame 84).
  { file: "vo-5", from: AT.oneClick + 9, trimBefore: s(7.1), lines: [[7.2, 10.4, "And then, just one click."]] },
  {
    file: "vo-6",
    from: AT.suitability - 10,
    lines: [
      [1.0, 5.3, "GeoWise generates an initial land-use suitability map,"],
      [5.4, 9.9, "complete with area calculations for each recommended zone:"],
      [10.5, 13.3, "agriculture, forestry, recreation,"],
      [13.3, 16.3, "and industrial development."],
    ],
  },
  // On the captions.
  {
    file: "vo-5",
    from: AT.integrated - 25,
    trimAfter: s(7.0),
    lines: [
      [1.2, 4.3, "Every layer, every factor,"],
      [4.35, 6.95, "one integrated analysis."],
    ],
  },
  { file: "vo-7", from: AT.vision - 27, lines: [[1.2, 5.0, "But the vision doesn’t stop at the map."]] },
  // "Actual terrain" lands on the ground tilt.
  {
    file: "vo-8",
    from: AT.vision + 100,
    lines: [
      [1.0, 4.1, "Explore your reclamation plan in 3D,"],
      [4.15, 6.85, "projected onto your actual terrain,"],
      [6.9, 11.6, "with carefully selected native species for each design zone."],
    ],
  },
  {
    file: "vo-9",
    from: AT.threeD + 200,
    lines: [
      [0.65, 4.6, "See what your land could become 30 years from now."],
      [4.7, 6.4, "Starting today."],
    ],
  },
  // "GeoWise" on the wordmark.
  {
    file: "vo-10b",
    from: AT.outro - 43,
    trimAfter: s(6.1),
    lines: [
      [2.0, 3.4, "GeoWise."],
      [3.5, 6.1, "Mind your future mining site."],
    ],
  },
];

const VoiceOver: React.FC = () => (
  <>
    {VO.map((cue, i) => (
      <Sequence key={i} name={`VO · ${cue.file}`} from={cue.from} layout="none">
        <Audio src={staticFile(`voiceover/${cue.file}.m4a`)} trimBefore={cue.trimBefore} trimAfter={cue.trimAfter} />
      </Sequence>
    ))}
  </>
);

/** Every subtitle phrase in composition frames. */
const SUBTITLES = VO.flatMap((cue) =>
  cue.lines.map(([a, b, text]) => ({ from: cue.from + s(a) - (cue.trimBefore ?? 0), to: cue.from + s(b) - (cue.trimBefore ?? 0), text })),
);

/* ---------------- Sound design ---------------- */
/**
 * SFX (public/sfx). Natural recordings, CC0 from Freesound via Openverse: wind (klangfabrik),
 * gust (crashoverride6), forest = birds (VKProduktion) + leaves (Garuda1982), rumble (Kinoton,
 * low-passed), click (Masgame), whoosh (Kinoton), swish (qubodup), riser + rush (Henrythetrain),
 * pop (greenvwbeetle), thud (kyles), chime (Jofae). Synthesised: tick, plink, shimmer.
 * Each cue sits on its animation event, relative to its scene.
 */
type Sfx = { file: string; at: number; volume: number; len?: number; fadeIn?: number; fadeOut?: number };
const cue = (file: string, at: number, volume: number, extra: Partial<Sfx> = {}): Sfx => ({ file, at, volume, ...extra });
const SPECIES_LAND = (i: number) => 140 + i * 7 + 30; // NativeSpecies: flyAt + i·flyStep + flyDur
const SFX: Sfx[] = [
  // Intro: open pit — wind and distant machinery under the drone shots, gone once it's a desktop
  cue("wind", 0, 0.32, { len: DESK.start + 30, fadeIn: 30, fadeOut: 40 }),
  cue("rumble", 0, 0.22, { len: DESK.start + 30, fadeIn: 30, fadeOut: 40 }),
  cue("whoosh", 26, 0.35), // "Every mine eventually closes."
  cue("whoosh", 336, 0.3), // "What comes next?"
  // The footage is a QuickTime window: zoom out, minimise, genie, dock, launch GeoWise
  cue("whoosh", DESK.start - 2, 0.3),
  cue("click", DESK.minimize, 0.4),
  cue("swish", DESK.genie[0], 0.32),
  ...DESK.hover.slice(0, 3).map((f) => cue("tick", f, 0.1)),
  cue("click", DESK.launch, 0.42),
  cue("pop", DESK.winOpen[0], 0.38),
  // Upload: Continue, the sheet, typing, the folder, each file flying in and landing, detection
  cue("riser", DESK.scan[0] - 40, 0.12), // scan sweep
  cue("pop", DESK.planCard[0], 0.28), // reclamation plan card
  cue("swish", DESK.planCard[1], 0.18),
  cue("shimmer", DESK.permit[0], 0.3), // permit area lights up
  cue("click", DESK.continueClick, 0.38),
  cue("swish", DESK.popup[0], 0.22),
  ...Array.from({ length: 10 }, (_, i) => cue("tick", DESK.typing[0] + i * 3, 0.05)),
  cue("click", DESK.folderClick, 0.35),
  cue("whoosh", DESK.folderOpen[0], 0.18),
  ...DESK.flights.map(([f0]) => cue("swish", f0 + 2, 0.3)),
  ...DESK.flights.map(([, f1]) => cue("tick", f1, 0.22)),
  cue("chime", DESK.detect[1], 0.28), // BUMI SUKSESINDO detected
  cue("swish", DESK.step2[0], 0.25), // on to Create a Site Boundary
  cue("pop", DESK.uploaded[0], 0.3), // boundary read
  cue("shimmer", DESK.highlight[0], 0.4), // the site is traced …
  cue("plink", DESK.highlight[0] + 28, 0.3), // … and lights up
  cue("whoosh", DESK.toSite[0], 0.15),
  cue("whoosh", DESK.pullBack[0], 0.3),
  // Layers: a tick as each layer lands, a thud as the stack collapses
  ...[14, 44, 79, 118, 154, 186].map((f) => cue("tick", AT.layers + f, 0.25)),
  cue("whoosh", AT.layers + 233, 0.3),
  cue("thud", AT.layers + 270, 0.35),
  // One click
  cue("click", AT.oneClick + 84, 0.4),
  cue("swish", AT.oneClick + 86, 0.3),
  cue("chime", AT.oneClick + 118, 0.35),
  // Processing: spinner tick, scan sweep across the map, zones colour in, push into the map
  cue("tick", AT.oneClick + 162, 0.18),
  cue("riser", AT.oneClick + 123, 0.18), // builds through processing, peaks as the zones appear
  cue("shimmer", AT.oneClick + 190, 0.38),
  cue("whoosh", AT.oneClick + 204, 0.2),
  // Suitability map: camera push, a pop per zone card, the total
  cue("whoosh", AT.suitability + 24, 0.22),
  // A soft plink as each zone card pops out of the screen, a brighter chime for the site total,
  // then a whoosh as the camera pulls back to the wide shot (1:23–1:24).
  ...[80, 200, 352, 440].map((f) => cue("plink", AT.suitability + f, 0.16)),
  cue("chime", AT.suitability + 462, 0.22),
  cue("whoosh", AT.suitability + 488, 0.18),
  // Mac flip
  cue("whoosh", AT.flip + 4, 0.3),
  cue("whoosh", AT.flip + 40, 0.3),
  cue("tick", AT.flip + 88, 0.15),
  // Beyond the map: glass tab bar, click, slide, zoom into the pit and the dive
  cue("whoosh", AT.vision + 8, 0.25),
  cue("pop", AT.vision + 50, 0.45),
  cue("click", AT.vision + 84, 0.4),
  cue("swish", AT.vision + 86, 0.25),
  cue("riser", AT.vision + 102, 0.38),
  cue("rush", AT.vision + 165, 0.5),
  // 3D growth: forest comes alive; species tiles pop in and land; overlays whisk away; wind on the tilt up
  cue("forest", AT.threeD, 0.55, { len: 420, fadeIn: 60, fadeOut: 70 }),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => cue("tick", AT.threeD + 70 + i * 5, 0.14)),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => cue("plink", AT.threeD + SPECIES_LAND(i) - 1, 0.22)),
  cue("swish", AT.threeD + 315, 0.3),
  cue("swish", AT.threeD + 322, 0.25),
  cue("gust", AT.threeD + 325, 0.35, { len: 170, fadeIn: 20, fadeOut: 60 }),
  // End card
  cue("pop", AT.outro + 6, 0.4),
  cue("shimmer", AT.outro + 20, 0.45),
  cue("chime", AT.outro + 135, 0.35), // App Store badge
];

const SoundDesign: React.FC = () => (
  <>
    {SFX.map((c, i) => (
      <Sequence key={i} name={`SFX · ${c.file}`} from={c.at} durationInFrames={c.len} layout="none">
        <Audio
          src={staticFile(`sfx/${c.file}.m4a`)}
          volume={(f) =>
            c.len
              ? c.volume *
                interpolate(f, [0, c.fadeIn ?? 1, c.len - (c.fadeOut ?? 1), c.len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : c.volume
          }
        />
      </Sequence>
    ))}
  </>
);

/* ---------------- Music ---------------- */
/** "Green Technology" by The_Mountain (Pixabay 149931, Pixabay Content License: free to use,
 * no credit required). Loudness-normalised to −18 LUFS. Starts from the top (its quiet piano
 * intro sits under the opening) and fades out over the last 2 s. */
const MUSIC = { file: "music/green_technology.m4a", trimBefore: 0, full: 0.42, duck: 0.2 };
/** Speaking frames (each VO phrase, with a little lead-in and tail). */
const SPEAKING = SUBTITLES.map((l) => [l.from - 6, l.to + 8] as const);
/** Per-frame music level: dips while someone speaks, smoothed so it breathes rather than jumps. */
const MUSIC_ENV = (() => {
  const raw = Array.from({ length: GEOWISE_LIGHT_FRAMES }, (_, f) => (SPEAKING.some(([a, b]) => f >= a && f < b) ? MUSIC.duck : MUSIC.full));
  const R = 9; // ±0.3 s smoothing
  return raw.map((_, f) => {
    let sum = 0;
    let n = 0;
    for (let k = Math.max(0, f - R); k <= Math.min(raw.length - 1, f + R); k++) {
      sum += raw[k];
      n++;
    }
    const fade = interpolate(f, [0, 45, GEOWISE_LIGHT_FRAMES - 60, GEOWISE_LIGHT_FRAMES - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (sum / n) * fade;
  });
})();

const Music: React.FC = () => (
  <Audio src={staticFile(MUSIC.file)} trimBefore={MUSIC.trimBefore} volume={(f) => MUSIC_ENV[Math.min(f, MUSIC_ENV.length - 1)]} />
);

/** Burned-in subtitles: one phrase at a time, bottom centre, below the scenes' own captions. */
const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const line = SUBTITLES.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = interpolate(frame, [line.from, line.from + 4, line.to - 4, line.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 30, pointerEvents: "none" }}>
      <div
        style={{
          opacity: o,
          maxWidth: 1500,
          padding: "10px 24px",
          borderRadius: 14,
          background: "rgba(18,18,20,0.62)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#fff",
          fontFamily,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}
      >
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Light (Mac) version with voice-over.
 * Problem context (drone → over-the-shoulder → GeoWise opens on the Mac), then the product
 * beats, every recording shown full-screen inside a MacBook Pro frame.
 */
export const GeoWiseDemoLight: React.FC = () => {
  return (
    <ThemeContext.Provider value={lightTheme}>
      <AbsoluteFill style={{ backgroundColor: "#F3F2EF" }}>
        <TransitionSeries>
          <TransitionSeries.Sequence name="0 · Problem context" durationInFrames={DUR.intro}>
            <LightIntroScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.intro })} />
          <TransitionSeries.Sequence name="1 · Layers" durationInFrames={DUR.layers}>
            <LayersScene timing={LAYERS_VO_TIMING} />
          </TransitionSeries.Sequence>
          {/* Hard cut: the One click scene opens on the Layers scene's last frame. */}
          <TransitionSeries.Sequence name="3 · One click" durationInFrames={DUR.oneClick}>
            <LightOneClickScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.oneClick })} />
          <TransitionSeries.Sequence name="4 · Suitability map" durationInFrames={DUR.suitability}>
            <LightAllocationScene />
          </TransitionSeries.Sequence>
          {/* Hard cut: the flip starts on the suitability scene's last frame and carries its pull-back on. */}
          <TransitionSeries.Sequence name="4→2 · Mac flip" durationInFrames={DUR.flip}>
            <LightMacFlip />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.flip })} />
          <TransitionSeries.Sequence name="2 · Integrated analysis" durationInFrames={DUR.integrated}>
            <LightIntegratedScene />
          </TransitionSeries.Sequence>
          {/* Short fade: beat 5 opens on the same laptop, so only the text changes here. */}
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.integrated })} />
          <TransitionSeries.Sequence name="5 · Beyond the map" premountFor={60} durationInFrames={DUR.vision}>
            <LightVisionScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.vision })} />
          <TransitionSeries.Sequence name="6 · 3D & growth" premountFor={60} durationInFrames={DUR.threeD}>
            <LightThreeDScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE.threeD })} />
          <TransitionSeries.Sequence name="Outro" durationInFrames={DUR.outro}>
            <LightOutroScene />
          </TransitionSeries.Sequence>
        </TransitionSeries>
        <Music />
        <SoundDesign />
        <VoiceOver />
        <Subtitles />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
