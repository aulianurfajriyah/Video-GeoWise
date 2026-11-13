import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, BlurIn, Logo, SilverText, WipeIn } from "../components";
import { colors, fontFamily } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div
          style={{
            scale: interpolate(frame, [4, 34], [0.6, 1], {
              ...clamp,
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            }),
            opacity: interpolate(frame, [4, 18], [0, 1], clamp),
            rotate: `${interpolate(frame, [4, 40], [-12, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}deg`,
          }}
        >
          <Logo size={150} />
        </div>
        <BlurIn delay={18} duration={44}>
          <SilverText size={168}>GeoWise</SilverText>
        </BlurIn>
        <WipeIn delay={56} duration={40}>
          <div style={{ color: colors.muted, fontSize: 46, fontWeight: 500, fontStyle: "italic" }}>
            A new future for every site.
          </div>
        </WipeIn>
      </div>
    </AbsoluteFill>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            scale: interpolate(frame, [6, 36], [0.6, 1], {
              ...clamp,
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            }),
            opacity: interpolate(frame, [6, 20], [0, 1], clamp),
          }}
        >
          <Logo size={130} />
        </div>
        <BlurIn delay={20} duration={44}>
          <SilverText size={150}>GeoWise</SilverText>
        </BlurIn>
        <WipeIn delay={58} duration={40}>
          <SilverText size={62} weight={700} style={{ letterSpacing: "-0.02em" }}>
            Mind your future mining site.
          </SilverText>
        </WipeIn>
        <BlurIn delay={100} duration={36}>
          <div
            style={{
              marginTop: 24,
              color: colors.muted,
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Land-use suitability · 3D reclamation planning
          </div>
        </BlurIn>
      </div>
    </AbsoluteFill>
  );
};
