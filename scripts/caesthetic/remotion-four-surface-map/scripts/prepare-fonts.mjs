import {createHash} from "node:crypto";
import {copyFile, mkdir, readFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destinationRoot = resolve(packageRoot, "public/fonts");

const assets = [
  {
    source: "node_modules/@ibm/plex-sans/fonts/complete/woff2/IBMPlexSans-Bold.woff2",
    destination: "IBMPlexSans-Bold.woff2",
    sha256: "fa7130d854a660b39a7fc9e6e0f2dc23dba5f1346e2adea3e1fe37b6d884133d",
  },
  {
    source: "node_modules/@ibm/plex-mono/fonts/complete/woff2/IBMPlexMono-SemiBold.woff2",
    destination: "IBMPlexMono-SemiBold.woff2",
    sha256: "6a825b4824c01cbb401e829e5a066a1818411bcb3538b5a5792c5ca9b82343c3",
  },
  {
    source: "node_modules/@ibm/plex-sans/LICENSE.txt",
    destination: "LICENSE-IBM-PLEX.txt",
    sha256: "7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da",
  },
];

await mkdir(destinationRoot, {recursive: true});

for (const asset of assets) {
  const source = resolve(packageRoot, asset.source);
  const bytes = await readFile(source);
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== asset.sha256) {
    throw new Error(`Font asset checksum mismatch: ${asset.source}`);
  }
  await copyFile(source, resolve(destinationRoot, asset.destination));
}
