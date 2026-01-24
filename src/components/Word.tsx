import type React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { loadFont } from "@remotion/google-fonts/BreeSerif";

export const Word: React.FC<{
  enterProgress: number;
  text: string;
  stroke: boolean;
}> = ({ enterProgress, text, stroke }) => {
  const { fontFamily } = loadFont();
  const { width } = useVideoConfig();
  const desiredFontSize = 72;

  const fittedText = fitText({
    fontFamily,
    text,
    withinWidth: width * 0.85,
  });

  const fontSize = Math.min(desiredFontSize, fittedText.fontSize);

  // Karaoke style: bright yellow/gold with black stroke
  const textColor = stroke ? "black" : "#FFD700"; // Gold color for fill
  const strokeWidth = stroke ? "24px" : undefined;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        top: undefined,
        bottom: 80,
        height: 120,
      }}
    >
      <div
        style={{
          fontSize,
          color: textColor,
          WebkitTextStroke: stroke ? `${strokeWidth} black` : undefined,
          paintOrder: stroke ? "stroke fill" : undefined,
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.7, 1])),
            translateY(interpolate(enterProgress, [0, 1], [30, 0])),
          ]),
          fontFamily,
          textTransform: "uppercase",
          textAlign: "center",
          fontWeight: "bold",
          letterSpacing: "2px",
          textShadow: stroke
            ? "4px 4px 8px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.5)"
            : "2px 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
