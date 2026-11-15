import React from "react";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { fontFamily, lightTheme, ThemeContext } from "./theme";
import { INTRO_FRAMES, LightIntroScene } from "./scenes/LightIntro";
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
  outro: 300,
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
  // "Meet" lands on the title (intro frame 920).
  {
    file: "vo-2",
    from: 901,
    lines: [
      [0.85, 2.6, "Meet GeoWise,"],
      [2.85, 6.6, "a macOS application that transforms spatial data"],
      [6.6, 10.9, "into smarter, data-driven mine reclamation plans."],
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
        <VoiceOver />
        <Subtitles />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
