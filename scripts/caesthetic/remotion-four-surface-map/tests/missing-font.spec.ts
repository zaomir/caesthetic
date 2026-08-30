import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import os from "node:os";
import {resolve} from "node:path";
import goldFixture from "../src/four-surface-map.illustrative.json";

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

it("fails immediately when a required WOFF2 asset is missing", async () => {
  const serveUrl = await bundle({entryPoint: resolve(__dirname, "../src/missing-font-index.tsx")});
  const inputProps = {manifest: goldFixture, sceneId: "S01"};
  const startedAt = Date.now();

  await expect(
    (async () => {
      const composition = await selectComposition({serveUrl, id: "MissingFont", inputProps});
      await renderStill({
        composition,
        frame: 179,
        inputProps,
        output: resolve(__dirname, "../artifacts/review/missing-font-must-not-exist.png"),
        serveUrl,
        timeoutInMilliseconds: 15000,
      });
    })(),
  ).rejects.toThrow();

  expect(Date.now() - startedAt).toBeLessThan(15000);
});
