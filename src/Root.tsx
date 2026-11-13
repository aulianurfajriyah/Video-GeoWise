import { Composition } from "remotion";
import { GeoWiseDemo } from "./GeoWiseDemo";
import { GeoWiseDemoLight } from "./GeoWiseDemoLight";

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
        durationInFrames={3720}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
