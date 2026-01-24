import { AbsoluteFill, Sequence, Series, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Audio } from "@remotion/media";
import { TimelineSchema } from "../lib/types";
import { FPS, INTRO_DURATION } from "../lib/constants";
import { loadFont } from "@remotion/google-fonts/BreeSerif";
import { Background } from "./Background";
import Subtitle from "./Subtitle";
import { getAudioPath } from "../lib/utils";

export const aiVideoSchema = z.object({
  timeline: TimelineSchema.nullable(),
});

const { fontFamily } = loadFont();

export const AIVideo: React.FC<z.infer<typeof aiVideoSchema>> = ({
  timeline,
}) => {
  if (!timeline) {
    throw new Error("Expected timeline to be fetched");
  }

  const { id, fps } = useVideoConfig();

  // Helper to convert ms to frames with intro offset
  const msToFrame = (ms: number) => Math.round((ms * fps) / 1000) + INTRO_DURATION;
  const msToDuration = (startMs: number, endMs: number) => Math.round(((endMs - startMs) * fps) / 1000);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {/* Intro Title */}
      <Sequence durationInFrames={INTRO_DURATION} premountFor={fps}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            display: "flex",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 120,
              lineHeight: "122px",
              width: "87%",
              color: "black",
              fontFamily,
              textTransform: "uppercase",
              backgroundColor: "yellow",
              paddingTop: 20,
              paddingBottom: 20,
              border: "10px solid black",
            }}
          >
            {timeline.shortTitle}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Background Images - Using Series for sequential playback */}
      <Sequence from={INTRO_DURATION}>
        <Series>
          {timeline.elements.map((element, index) => {
            const durationFrames = msToDuration(element.startMs, element.endMs);
            return (
              <Series.Sequence
                key={`bg-${index}`}
                durationInFrames={durationFrames}
                premountFor={fps}
              >
                <Background project={id} item={element} />
              </Series.Sequence>
            );
          })}
        </Series>
      </Sequence>

      {/* Subtitles - Using absolute positioning to sync with audio */}
      {timeline.text.map((element, index) => {
        const startFrame = msToFrame(element.startMs);
        const durationFrames = msToDuration(element.startMs, element.endMs);
        return (
          <Sequence
            key={`text-${index}`}
            from={startFrame}
            durationInFrames={Math.max(1, durationFrames)}
          >
            <Subtitle text={element.text} />
          </Sequence>
        );
      })}

      {/* Audio - Using absolute positioning to ensure sync */}
      {timeline.audio.map((element, index) => {
        const startFrame = msToFrame(element.startMs);
        const durationFrames = msToDuration(element.startMs, element.endMs);
        return (
          <Sequence
            key={`audio-${index}`}
            from={startFrame}
            durationInFrames={durationFrames}
            premountFor={fps}
          >
            <Audio src={staticFile(getAudioPath(id, element.audioUrl))} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
