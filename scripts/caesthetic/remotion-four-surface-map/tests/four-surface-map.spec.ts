import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import {mkdir, readFile} from "node:fs/promises";
import os from "node:os";
import {join, resolve} from "node:path";
import {toMatchImageSnapshot} from "jest-image-snapshot";
import goldFixture from "../src/four-surface-map.illustrative.json";

expect.extend({toMatchImageSnapshot});

jest.spyOn(os, "networkInterfaces").mockReturnValue({
  lo: [
    {
      address: "127.0.0.1",
      netmask: "255.0.0.0",
      family: "IPv4",
      mac: "00:00:00:00:00:00",
      internal: true,
      cidr: "127.0.0.1/8",
    },
  ],
});

const FORMAT_A_FRAMES = [0, 29, 30, 44, 45, 69, 70, 94, 95, 119, 120, 144, 145, 179];
const FORMAT_B_FRAMES = [199, 200, 229, 230, 379];

describe("FourSurfaceMap visual boundaries", () => {
  let serveUrl: string;
  const outputDir = resolve(__dirname, "../artifacts/review");

  const shiftedManifest = {
    ...goldFixture,
    output: {...goldFixture.output, duration_in_frames: 380},
    scenes: goldFixture.scenes.map((scene) => ({
      ...scene,
      start_frame: scene.start_frame + 200,
      end_frame: scene.end_frame + 200,
      timeline_cues: scene.timeline_cues.map((cue) => ({
        ...cue,
        at_frame: cue.at_frame + 200,
      })),
    })),
  };

  beforeAll(async () => {
    await mkdir(outputDir, {recursive: true});
    serveUrl = await bundle({entryPoint: resolve(__dirname, "../src/index.ts")});
  });

  it.each(FORMAT_A_FRAMES)("matches Format A frame %i", async (frame) => {
    const inputProps = {manifest: goldFixture, sceneId: "S01"};
    const composition = await selectComposition({serveUrl, id: "FourSurfaceMap", inputProps});
    const output = join(outputDir, `format-a-${frame}.png`);
    await renderStill({composition, frame, inputProps, output, serveUrl});
    expect(await readFile(output)).toMatchImageSnapshot({
      customSnapshotIdentifier: `four-surface-format-a-${frame}`,
      failureThreshold: 0,
      failureThresholdType: "pixel",
    });
  });

  it.each(FORMAT_B_FRAMES)("matches localized Format B frame %i", async (frame) => {
    const inputProps = {manifest: shiftedManifest, sceneId: "S01"};
    const composition = await selectComposition({
      serveUrl,
      id: "FourSurfaceMapHarness",
      inputProps,
    });
    const output = join(outputDir, `format-b-${frame}.png`);
    await renderStill({composition, frame, inputProps, output, serveUrl});
    expect(await readFile(output)).toMatchImageSnapshot({
      customSnapshotIdentifier: `four-surface-format-b-${frame}`,
      failureThreshold: 0,
      failureThresholdType: "pixel",
    });
  });

  it.each([
    [200, 0],
    [230, 30],
    [379, 179],
  ])("keeps Format B frame %i pixel-identical to local frame %i", async (global, local) => {
    const formatB = await readFile(join(outputDir, `format-b-${global}.png`));
    const formatA = await readFile(join(outputDir, `format-a-${local}.png`));
    expect(formatB.equals(formatA)).toBe(true);
  });

  it("fits the maximum-width headline fixture", async () => {
    const stressManifest = {
      ...goldFixture,
      scenes: goldFixture.scenes.map((scene) => ({...scene, headline: "W".repeat(32)})),
    };
    const inputProps = {manifest: stressManifest, sceneId: "S01"};
    const composition = await selectComposition({serveUrl, id: "FourSurfaceMap", inputProps});
    const output = join(outputDir, "headline-stress.png");
    await renderStill({composition, frame: 179, inputProps, output, serveUrl});
    expect(await readFile(output)).toMatchImageSnapshot({
      customSnapshotIdentifier: "four-surface-headline-32-wide-characters",
      failureThreshold: 0,
      failureThresholdType: "pixel",
    });
  });
});
