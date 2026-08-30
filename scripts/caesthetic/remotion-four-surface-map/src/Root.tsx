import React from "react";
import {Composition, Sequence} from "remotion";
import goldFixture from "./four-surface-map.illustrative.json";
import {loadLocalFonts} from "./load-fonts";
import {
  type RenderInputProps,
  ValidatedFourSurfaceMap,
} from "./ValidatedFourSurfaceMap";

loadLocalFonts();

export const shiftManifest = (offset: number) => ({
  ...goldFixture,
  output: {
    ...goldFixture.output,
    duration_in_frames: goldFixture.output.duration_in_frames + offset,
  },
  scenes: goldFixture.scenes.map((scene) => ({
    ...scene,
    start_frame: scene.start_frame + offset,
    end_frame: scene.end_frame + offset,
    timeline_cues: scene.timeline_cues.map((cue) => ({
      ...cue,
      at_frame: cue.at_frame + offset,
    })),
  })),
});

const harnessManifest = shiftManifest(200);

const HarnessWrapper: React.FC<RenderInputProps> = (props) => (
  <Sequence from={200} durationInFrames={180}>
    <ValidatedFourSurfaceMap {...props} />
  </Sequence>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FourSurfaceMap"
      component={ValidatedFourSurfaceMap}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={180}
      defaultProps={{manifest: goldFixture, sceneId: "S01"}}
    />
    <Composition
      id="FourSurfaceMapHarness"
      component={HarnessWrapper}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={380}
      defaultProps={{manifest: harnessManifest, sceneId: "S01"}}
    />
  </>
);
