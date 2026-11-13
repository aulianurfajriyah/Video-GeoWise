import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill } from "remotion";
import { lightTheme, ThemeContext } from "./theme";
import { LightIntroScene } from "./scenes/LightIntro";
import { LayersScene } from "./scenes/LayersScene";
import {
  LightAllocationScene,
  LightIntegratedScene,
  LightMacFlip,
  MAC_FLIP_FRAMES,
  LightOneClickScene,
  LightOutroScene,
  LightThreeDScene,
  LightVisionScene,
} from "./scenes/LightScenes";

/**
 * Light (Mac) version — 2:00 at 30 fps (3600 frames).
 * 0:00–0:35  problem context (drone → over-the-shoulder → GeoWise opens on the Mac)
 * then the same six voice-over beats as the dark cut, every recording shown
 * full-screen inside a MacBook Pro frame (no UI cropping).
 */
export const GeoWiseDemoLight: React.FC = () => {
  return (
    <ThemeContext.Provider value={lightTheme}>
      <AbsoluteFill style={{ backgroundColor: "#F3F2EF" }}>
        <TransitionSeries>
          <TransitionSeries.Sequence name="0 · Problem context" durationInFrames={1065}>
            <LightIntroScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
          <TransitionSeries.Sequence name="1 · Layers" durationInFrames={330}>
            <LayersScene />
          </TransitionSeries.Sequence>
          {/* Hard cut: the One click scene opens on the Layers scene's last frame. */}
          <TransitionSeries.Sequence name="3 · One click" durationInFrames={250}>
            <LightOneClickScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
          <TransitionSeries.Sequence name="4 · Suitability map" durationInFrames={525}>
            <LightAllocationScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
          {/* Close the lid, turn the Mac around, open it on the next beat. */}
          <TransitionSeries.Sequence name="4→2 · Mac flip" durationInFrames={MAC_FLIP_FRAMES}>
            <LightMacFlip />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
          <TransitionSeries.Sequence name="2 · Integrated analysis" durationInFrames={261}>
            <LightIntegratedScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
          <TransitionSeries.Sequence name="5 · Beyond the map" durationInFrames={180}>
            <LightVisionScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
          <TransitionSeries.Sequence name="6 · 3D & species" durationInFrames={720}>
            <LightThreeDScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
          <TransitionSeries.Sequence name="Outro" durationInFrames={300}>
            <LightOutroScene />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
