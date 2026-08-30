import React from "react";
import {Composition, registerRoot} from "remotion";
import {FourSurfaceMap} from "../src/FourSurfaceMap";
import goldFixture from "../src/four-surface-map.illustrative.json";

const SyntheticShadowRoot: React.FC = () => (
  <Composition
    id="SyntheticShadowFourSurfaceMap"
    component={FourSurfaceMap}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={180}
    defaultProps={{scene: goldFixture.scenes[0]}}
  />
);

registerRoot(SyntheticShadowRoot);
