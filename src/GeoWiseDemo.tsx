import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill } from "remotion";
import { IntroScene, OutroScene } from "./scenes/IntroOutro";
import { LayersScene } from "./scenes/LayersScene";
import {
  AllocationScene,
  IntegratedScene,
  OneClickScene,
  ThreeDScene,
  VisionScene,
} from "./scenes/AppScenes";

/**
 * 90 s GeoWise demo (30 fps, 2700 frames).
 * Voice-over beats → scenes:
 *  1. "It brings together land cover, roads…"      → Layers
 *  2. "Every layer. Every factor…"                   → Integrated
 *  3. "And then, just one click."                    → OneClick
 *  4. "GeoWise generates an initial land-use…"       → Allocation
 *  5. "But the vision doesn't stop at a map."        → Vision
 *  6. "Explore your reclamation plan in 3D…"         → ThreeD
 */
export const GeoWiseDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#05080F" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={165}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="1 · Layers" durationInFrames={330}>
          <LayersScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="2 · Integrated analysis" durationInFrames={330}>
          <IntegratedScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="3 · One click" durationInFrames={180}>
          <OneClickScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="4 · Suitability map" durationInFrames={600}>
          <AllocationScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="5 · Beyond the map" durationInFrames={180}>
          <VisionScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="6 · 3D & species" durationInFrames={720}>
          <ThreeDScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={300}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
