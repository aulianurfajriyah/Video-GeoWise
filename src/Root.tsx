import { Composition } from "remotion";
import { GeoWiseDemo } from "./GeoWiseDemo";
import { GEOWISE_LIGHT_FRAMES, GeoWiseDemoLight } from "./GeoWiseDemoLight";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeoWiseDemo"
        component={GeoWiseDemo}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GeoWiseDemoLight"
        component={GeoWiseDemoLight}
        durationInFrames={GEOWISE_LIGHT_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
