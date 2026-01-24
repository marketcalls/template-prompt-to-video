import z from "zod";
import * as fs from "fs";
import { fal } from "@fal-ai/client";

export interface CharacterAlignmentResponseModel {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const setFalKey = (key: string) => {
  fal.config({ credentials: key });
};

export const openaiStructuredCompletion = async <T>(
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt + "\n\nRespond with valid JSON only." }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);

  const data = await res.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
};

export const generateAiImage = async ({
  prompt,
  path: outputPath,
  onRetry,
}: {
  prompt: string;
  path: string;
  onRetry: (attempt: number) => void;
}) => {
  const maxRetries = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  // Add comic style prefix to prompt
  const styledPrompt = `Comic book illustration style, vibrant colors, bold outlines, dynamic poses, expressive characters, graphic novel aesthetic. No text or speech bubbles. ${prompt}`;

  while (attempt < maxRetries) {
    try {
      const result = await fal.subscribe("fal-ai/flux-2-pro", {
        input: {
          prompt: styledPrompt,
          image_size: "landscape_16_9",
          safety_tolerance: "2",
          output_format: "png",
        },
      });

      const imageUrl = result.data.images[0].url;
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(outputPath, buffer as Uint8Array);
      return;
    } catch (error) {
      lastError = new Error(
        `Fal.ai error (attempt ${attempt + 1}): ${error instanceof Error ? error.message : String(error)}`,
      );
      attempt++;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      onRetry(attempt);
    }
  }

  throw lastError!;
};

export const getGenerateStoryPrompt = (title: string, topic: string) => {
  const prompt = `Write an engaging educational story with title [${title}] (its topic is [${topic}]).
   You must follow best practices for great storytelling.
   The script must be 15-20 sentences long for a detailed explainer video.
   Story events can be from anywhere in the world, but text must be translated into English language.
   Result result without any formatting and title, as one continuous text.
   Skip new lines.

   IMPORTANT RULES:
   - Do NOT use hyphens (-) or em-dashes (—) anywhere in the text
   - Do NOT use ellipsis (...)
   - Use simple punctuation only: periods, commas, question marks, exclamation marks
   - Write complete sentences without breaking words

   Return your response as JSON in this exact format:
   {"text": "your story text here"}`;

  return prompt;
};

export const getGenerateImageDescriptionPrompt = (storyText: string) => {
  const prompt = `You are given story text.
  Generate (in English) 10-15 image descriptions for this story.
  Story sentences must be in the same order as in the story and their content must be preserved.
  Each image must match 1-2 sentences from the story.

  IMPORTANT - COMIC BOOK STYLE WITH CHARACTERS:
  - Style: Vibrant comic book illustration, graphic novel aesthetic
  - Include expressive human characters with dynamic poses
  - Use bold colors, strong outlines, and dramatic lighting
  - Show action scenes and emotional expressions
  - Characters should be stylized like modern comic books or anime
  - Backgrounds should complement the action
  - NO text, speech bubbles, or UI elements in images
  - NO realistic photography style
  - Think: Marvel comics, anime, or graphic novel panels

  Return your response as JSON in this exact format:
  {"result": [{"text": "sentence from story", "imageDescription": "comic style image description with characters"}]}

  <story>
  ${storyText}
  </story>`;

  return prompt;
};

export const generateVoice = async (
  text: string,
  outputPath: string,
): Promise<CharacterAlignmentResponseModel> => {
  const result = await fal.subscribe("fal-ai/elevenlabs/tts/eleven-v3", {
    input: {
      text,
      voice: "Brian",
      stability: 0.5,
      similarity_boost: 0.75,
      speed: 1,
    },
  });

  const audioUrl = result.data.audio.url;
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer as Uint8Array);

  // Generate estimated timestamps based on audio duration and text length
  const audioData = result.data.audio as { url: string; duration?: number };
  const audioDurationSeconds = audioData.duration || text.length * 0.06;
  const characters = text.split("");
  const timePerChar = audioDurationSeconds / characters.length;

  const characterStartTimesSeconds: number[] = [];
  const characterEndTimesSeconds: number[] = [];

  for (let i = 0; i < characters.length; i++) {
    characterStartTimesSeconds.push(i * timePerChar);
    characterEndTimesSeconds.push((i + 1) * timePerChar);
  }

  return {
    characters,
    characterStartTimesSeconds,
    characterEndTimesSeconds,
  };
};
