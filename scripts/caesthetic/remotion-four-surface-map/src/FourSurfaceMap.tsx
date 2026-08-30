import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from "remotion";
import {Globe, Search, Star, Users} from "lucide-react";
import type {FourSurfaceMapScene} from "./render-manifest.schema";

type TimelineCue = FourSurfaceMapScene["timeline_cues"][number];
type EventType = TimelineCue["event"];
type SurfaceId = NonNullable<TimelineCue["surface_id"]>;

type Props = {scene: FourSurfaceMapScene};

const TOKENS = {
  colors: {bg: "#F0EDE6", primary: "#0B2438", accent: "#7B244B"},
  fonts: {
    sans: '"IBM Plex Sans", sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },
  layout: {safeAreaPx: 120},
} as const;

const CANONICAL_SURFACES = [
  {id: "search", label: "SEARCH / GBP", icon: Search},
  {id: "website", label: "WEBSITE", icon: Globe},
  {id: "social", label: "SOCIAL", icon: Users},
  {id: "reputation", label: "REPUTATION / REVIEWS", icon: Star},
] as const;

const NODE_SIZE = 144;
const NODE_GAP = 60;
const SYSTEM_HEIGHT = NODE_SIZE * 4 + NODE_GAP * 3;
const FIRST_CENTER = NODE_SIZE / 2;
const LAST_CENTER = SYSTEM_HEIGHT - NODE_SIZE / 2;
const HEADLINE_WRAP_THRESHOLD = 24;

const splitHeadline = (headline: string): readonly string[] => {
  if (headline.length <= HEADLINE_WRAP_THRESHOLD) return [headline];

  const midpoint = Math.floor(headline.length / 2);
  const spaces = [...headline.matchAll(/ /g)].map((match) => match.index);
  const breakpoint = spaces.length
    ? spaces.reduce((closest, candidate) =>
        Math.abs(candidate - midpoint) < Math.abs(closest - midpoint) ? candidate : closest,
      )
    : midpoint;

  return [headline.slice(0, breakpoint).trim(), headline.slice(breakpoint).trim()].filter(Boolean);
};

export const FourSurfaceMap: React.FC<Props> = ({scene}) => {
  const localFrame = useCurrentFrame();

  const resolveCueOrThrow = (
    event: EventType,
    surfaceId?: SurfaceId,
  ): TimelineCue => {
    const cue = scene.timeline_cues.find(
      (item) =>
        item.event === event &&
        (surfaceId === undefined || item.surface_id === surfaceId),
    );
    if (!cue) {
      throw new Error(`Missing validated cue: ${event}:${surfaceId ?? "scene"}`);
    }
    return cue;
  };

  const getLocalCueFrame = (event: EventType, surfaceId?: SurfaceId) =>
    resolveCueOrThrow(event, surfaceId).at_frame - scene.start_frame;

  const getRevealProgress = (startFrame: number, duration = 15) =>
    interpolate(localFrame, [startFrame - 1, startFrame + duration - 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });

  const constraintFrame = getLocalCueFrame("binding_constraint_selected");
  const constraintProgress = getRevealProgress(constraintFrame, 10);
  const returnFrame = getLocalCueFrame("growth_score_returned");
  const returnProgress = getRevealProgress(returnFrame, 15);
  const headlineLines = splitHeadline(scene.headline);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.bg,
        color: TOKENS.colors.primary,
        fontFamily: TOKENS.fonts.sans,
        fontSynthesis: "none",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: `${TOKENS.layout.safeAreaPx}px 60px`,
        }}
      >
        <div
          style={{
            flex: "0 0 210px",
            marginBottom: 48,
            opacity: getRevealProgress(0, 10),
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 2,
              margin: "0 0 12px",
              textTransform: "uppercase",
            }}
          >
            {scene.practice_label}
          </h2>
          <h1
            data-headline
            style={{
              color: TOKENS.colors.primary,
              fontSize: headlineLines.length > 1 ? 56 : 72,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: "100%",
            }}
          >
            {headlineLines.map((line) => (
              <span key={line} style={{display: "block", whiteSpace: "nowrap"}}>
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div style={{display: "flex", flex: 1, flexDirection: "column", position: "relative"}}>
          <div
            style={{
              border: `2px solid ${TOKENS.colors.primary}`,
              bottom: -10,
              left: -30,
              opacity: 0.2,
              pointerEvents: "none",
              position: "absolute",
              right: -30,
              top: -30,
            }}
          >
            <div
              style={{
                backgroundColor: TOKENS.colors.bg,
                fontFamily: TOKENS.fonts.mono,
                fontSize: 18,
                fontWeight: 600,
                padding: "0 10px",
                position: "absolute",
                right: 40,
                top: -14,
              }}
            >
              ONE OWNER OF THE LOGIC
            </div>
          </div>

          <div style={{height: SYSTEM_HEIGHT, position: "relative"}}>
            <svg
              height={SYSTEM_HEIGHT}
              width={NODE_SIZE}
              style={{inset: 0, pointerEvents: "none", position: "absolute", zIndex: 0}}
            >
              <line
                x1={FIRST_CENTER}
                x2={FIRST_CENTER}
                y1={FIRST_CENTER}
                y2={LAST_CENTER}
                stroke={TOKENS.colors.primary}
                strokeDasharray="12 12"
                strokeWidth={4}
                opacity={0.3}
              />
            </svg>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: NODE_GAP,
                position: "relative",
                zIndex: 10,
              }}
            >
              {CANONICAL_SURFACES.map((surface) => {
                const startFrame = getLocalCueFrame("surface_introduced", surface.id);
                const progress = getRevealProgress(startFrame);
                const Icon = surface.icon;
                const isConstraint = scene.binding_constraint.surface_id === surface.id;
                const isConstraintActive = isConstraint && localFrame >= constraintFrame;

                return (
                  <div
                    key={surface.id}
                    data-surface-id={surface.id}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: 40,
                      opacity: progress,
                      transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        alignItems: "center",
                        backgroundColor: TOKENS.colors.bg,
                        border: `4px solid ${
                          isConstraintActive ? TOKENS.colors.accent : TOKENS.colors.primary
                        }`,
                        borderRadius: "50%",
                        boxSizing: "border-box",
                        display: "flex",
                        height: NODE_SIZE,
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                        width: NODE_SIZE,
                      }}
                    >
                      {isConstraint ? (
                        <div
                          data-constraint-overlay
                          style={{
                            background:
                              `repeating-linear-gradient(45deg, transparent, transparent 10px, ` +
                              `${TOKENS.colors.accent}1A 10px, ${TOKENS.colors.accent}1A 20px)`,
                            inset: 0,
                            opacity: constraintProgress,
                            pointerEvents: "none",
                            position: "absolute",
                          }}
                        />
                      ) : null}
                      <Icon
                        color={isConstraintActive ? TOKENS.colors.accent : TOKENS.colors.primary}
                        size={64}
                        strokeWidth={1.5}
                        style={{zIndex: 2}}
                      />
                    </div>

                    <div>
                      <h3 style={{fontSize: 42, fontWeight: 700, margin: 0}}>{surface.label}</h3>
                      {isConstraint && localFrame >= returnFrame ? (
                        <div
                          data-growth-score-return
                          style={{
                            color: TOKENS.colors.accent,
                            fontFamily: TOKENS.fonts.mono,
                            fontSize: 24,
                            fontWeight: 600,
                            marginTop: 12,
                            opacity: returnProgress,
                            transform: `translateX(${interpolate(
                              returnProgress,
                              [0, 1],
                              [-20, 0],
                            )}px)`,
                          }}
                        >
                          ↳ FIX FIRST. DO NOT FUND THE LEAK.
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {scene.mode === "illustrative" ? (
          <div
            data-epistemic-label
            style={{
              backgroundColor: TOKENS.colors.accent,
              color: TOKENS.colors.bg,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 1,
              marginTop: "auto",
              padding: 24,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {scene.evidence.public_label}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
