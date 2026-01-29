import { Composition, getStaticFiles } from "remotion";
import { AIVideo, aiVideoSchema } from "./components/AIVideo";
import { OpenAlgoVideo } from "./OpenAlgo/OpenAlgoVideo";
import { FOSSHackVideo } from "./FOSSHack/FOSSHackVideo";
import { FPS, INTRO_DURATION } from "./lib/constants";
import { getTimelinePath, loadTimelineFromFile } from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();
  const timelines = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      {/* OpenAlgo Promo Video */}
      <Composition
        id="OpenAlgoPromo"
        component={OpenAlgoVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={2700}
      />

      {/* FOSS Hack 2026 Promo Video */}
      <Composition
        id="FOSSHack2026"
        component={FOSSHackVideo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={1200}
      />

      {/* Dynamic timeline-based videos */}
      {timelines.map((storyName) => (
        <Composition
          key={storyName}
          id={storyName}
          component={AIVideo}
          fps={FPS}
          width={1920}
          height={1080}
          schema={aiVideoSchema}
          defaultProps={{
            timeline: null,
          }}
          calculateMetadata={async ({ props }) => {
            const { lengthFrames, timeline } = await loadTimelineFromFile(
              getTimelinePath(storyName),
            );

            return {
              durationInFrames: lengthFrames + INTRO_DURATION,
              props: {
                ...props,
                timeline,
              },
            };
          }}
        />
      ))}
    </>
  );
};
