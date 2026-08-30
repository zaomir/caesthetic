import React from "react";
import {Composition, registerRoot} from "remotion";
import goldFixture from "./four-surface-map.illustrative.json";
import {loadLocalFonts} from "./load-fonts";
import {ValidatedFourSurfaceMap} from "./ValidatedFourSurfaceMap";

loadLocalFonts({
  bold: "fonts/INTENTIONALLY-MISSING.woff2",
  mono: "fonts/IBMPlexMono-SemiBold.woff2",
});

const MissingFontRoot: React.FC = () => (
  <Composition
    id="MissingFont"
    component={ValidatedFourSurfaceMap}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={180}
    defaultProps={{manifest: goldFixture, sceneId: "S01"}}
  />
);

registerRoot(MissingFontRoot);
