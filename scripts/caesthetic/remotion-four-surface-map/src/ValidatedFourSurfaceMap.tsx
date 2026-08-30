import React from "react";
import {FourSurfaceMap} from "./FourSurfaceMap";
import {
  RenderManifestSchema,
  type FourSurfaceMapScene,
} from "./render-manifest.schema";

export type RenderInputProps = {manifest: unknown; sceneId: string};

export const resolveRenderableScene = (
  manifest: unknown,
  sceneId: string,
): FourSurfaceMapScene => {
  const parsed = RenderManifestSchema.parse(manifest);
  if (parsed.render_purpose === "production") {
    throw new Error(
      "Production rendering is disabled until PUBLISHABLE evidence resolution succeeds",
    );
  }
  const scene = parsed.scenes.find(
    (item): item is FourSurfaceMapScene =>
      item.scene_id === sceneId && item.type === "four_surface_map",
  );
  if (!scene) {
    throw new Error(`Validated four_surface_map scene not found: ${sceneId}`);
  }
  return scene;
};

export const ValidatedFourSurfaceMap: React.FC<RenderInputProps> = ({manifest, sceneId}) => (
  <FourSurfaceMap scene={resolveRenderableScene(manifest, sceneId)} />
);
