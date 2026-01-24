import { staticFile } from "remotion";
import { BackgroundElement, Timeline } from "./types";
import { FPS, INTRO_DURATION } from "./constants";

export const loadTimelineFromFile = async (filename: string) => {
  const res = await fetch(staticFile(filename));
  const json = await res.json();
  const timeline = json as Timeline;
  timeline.elements.sort((a, b) => a.startMs - b.startMs);

  // Calculate total duration from the last element
  const lastElement = timeline.elements[timeline.elements.length - 1];
  const contentDurationMs = lastElement ? lastElement.endMs : 0;
  const contentDurationFrames = Math.ceil((contentDurationMs / 1000) * FPS);
  const lengthFrames = INTRO_DURATION + contentDurationFrames;

  return { timeline, lengthFrames };
};

export const calculateBlur = ({
  item,
  localMs,
}: {
  item: BackgroundElement;
  localMs: number;
}) => {
  const maxBlur = 1;
  const fadeMs = 1000;

  const startMs = item.startMs;
  const endMs = item.endMs;

  const { enterTransition } = item;
  const { exitTransition } = item;

  if (enterTransition === "blur" && localMs < fadeMs) {
    return (1 - localMs / fadeMs) * maxBlur;
  }

  if (exitTransition === "blur" && localMs > endMs - startMs - fadeMs) {
    return (1 - (endMs - startMs - localMs) / fadeMs) * maxBlur;
  }

  return 0;
};

export const getTimelinePath = (proj: string) =>
  `content/${proj}/timeline.json`;

export const getImagePath = (proj: string, uid: string) =>
  `content/${proj}/images/${uid}.png`;

export const getAudioPath = (proj: string, uid: string) =>
  `content/${proj}/audio/${uid}.mp3`;
