import {cancelRender, continueRender, delayRender, staticFile} from "remotion";

let fontLoadStarted = false;

type FontFiles = {
  bold: string;
  mono: string;
};

const DEFAULT_FONT_FILES: FontFiles = {
  bold: "fonts/IBMPlexSans-Bold.woff2",
  mono: "fonts/IBMPlexMono-SemiBold.woff2",
};

export const loadLocalFonts = (files: FontFiles = DEFAULT_FONT_FILES) => {
  if (typeof window === "undefined" || fontLoadStarted) return;
  fontLoadStarted = true;

  const handle = delayRender("Loading IBM Plex fonts for deterministic rendering");
  const fonts = [
    new FontFace(
      "IBM Plex Sans",
      `url('${staticFile(files.bold)}') format('woff2')`,
      {weight: "700"},
    ),
    new FontFace(
      "IBM Plex Mono",
      `url('${staticFile(files.mono)}') format('woff2')`,
      {weight: "600"},
    ),
  ];

  Promise.all(fonts.map((font) => font.load()))
    .then((loadedFonts) => {
      loadedFonts.forEach((font) => document.fonts.add(font));
      continueRender(handle);
    })
    .catch((cause: unknown) => {
      cancelRender(cause instanceof Error ? cause : new Error(String(cause)));
    });
};
