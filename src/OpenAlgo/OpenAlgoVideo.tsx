import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// Timing (frames at 30fps) - SLOWED DOWN for readability
const WORD_DELAY = 4;
const SCENE_SHORT = 40;   // ~1.3s
const SCENE_MEDIUM = 60;  // ~2s
const SCENE_LONG = 80;    // ~2.7s
const SCENE_IMAGE = 90;   // ~3s
const SCENE_STATS = 70;   // ~2.3s for stats to be readable

// OpenAlgo Brand Colors (from website & dashboard)
const BRAND = {
  // Rainbow gradient colors (left to right from headline)
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  // UI colors
  dark: "#0a0a0a",
  darkBlue: "#0f172a",
  gray: "#6b7280",
  white: "#ffffff",
};

// Scene background schemes
const SLIDES = {
  dark: { bg: "#0a0a0a", text: "#ffffff" },
  purple: { bg: "#1a0a2e", text: "#8b5cf6" },
  blue: { bg: "#0a1628", text: "#3b82f6" },
  green: { bg: "#052e16", text: "#22c55e" },
  orange: { bg: "#2d1600", text: "#f97316" },
  pink: { bg: "#2d0a1e", text: "#ec4899" },
  cyan: { bg: "#042f2e", text: "#06b6d4" },
  yellow: { bg: "#2d2600", text: "#eab308" },
  darkBlue: { bg: "#0f172a", text: "#ffffff" },
};

// OpenAlgo rainbow gradient (matches website headline)
const RAINBOW_GRADIENT = "linear-gradient(90deg, #ef4444 0%, #f97316 17%, #eab308 33%, #22c55e 50%, #06b6d4 67%, #3b82f6 83%, #8b5cf6 100%)";

// ===== ANIMATION COMPONENTS =====

const AnimatedWords: React.FC<{
  words: string[];
  colors?: string[];
  fontSize?: number;
  stagger?: number;
}> = ({ words, colors, fontSize = 100, stagger = WORD_DELAY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "0 24px",
        maxWidth: 1400,
        padding: "0 60px",
      }}
    >
      {words.map((word, i) => {
        const delay = i * stagger;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12, stiffness: 200 },
        });

        const y = interpolate(progress, [0, 1], [80, 0]);
        const opacity = interpolate(progress, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });
        const scale = interpolate(progress, [0, 1], [0.7, 1]);
        const color = colors ? colors[i % colors.length] : "#ffffff";

        return (
          <span
            key={`${word}-${i}`}
            style={{
              fontSize,
              fontWeight: 800,
              fontFamily,
              color,
              transform: `translateY(${y}px) scale(${scale})`,
              opacity,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const PopWord: React.FC<{
  text: string;
  color?: string;
  fontSize?: number;
  delay?: number;
}> = ({ text, color = "#ffffff", fontSize = 120, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  const scale = interpolate(progress, [0, 1], [0, 1]);
  const rotate = interpolate(progress, [0, 1], [-10, 0]);

  return (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        fontFamily,
        color,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        textShadow: `0 0 60px ${color}40`,
      }}
    >
      {text}
    </div>
  );
};

const Counter: React.FC<{
  value: number;
  suffix?: string;
  color?: string;
  fontSize?: number;
}> = ({ value, suffix = "", color = "#ffffff", fontSize = 140 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  return (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        fontFamily,
        color,
        textShadow: `0 0 80px ${color}60`,
      }}
    >
      {displayValue.toLocaleString()}{suffix}
    </div>
  );
};

const SlideLabel: React.FC<{
  text: string;
  color?: string;
}> = ({ text, color = "#888888" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  return (
    <div
      style={{
        fontSize: 28,
        fontWeight: 500,
        fontFamily,
        color,
        letterSpacing: 6,
        textTransform: "uppercase",
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ===== CODE EDITOR COMPONENT =====

// Syntax highlighting colors
const SYNTAX = {
  keyword: "#c678dd",     // purple - from, import, if, etc.
  function: "#61afef",    // blue - function names
  string: "#98c379",      // green - strings
  comment: "#5c6370",     // gray - comments
  variable: "#e06c75",    // red - variables
  number: "#d19a66",      // orange - numbers
  operator: "#56b6c2",    // cyan - operators
  text: "#abb2bf",        // default text
  bracket: "#ffd700",     // gold - brackets
};

// Python code tokens for syntax highlighting
interface CodeToken {
  text: string;
  color: string;
}

const pythonCodeLines: CodeToken[][] = [
  [
    { text: "from", color: SYNTAX.keyword },
    { text: " openalgo ", color: SYNTAX.text },
    { text: "import", color: SYNTAX.keyword },
    { text: " api", color: SYNTAX.function },
  ],
  [],
  [
    { text: "# Initialize the OpenAlgo client", color: SYNTAX.comment },
  ],
  [
    { text: "client", color: SYNTAX.variable },
    { text: " = ", color: SYNTAX.operator },
    { text: "api", color: SYNTAX.function },
    { text: "(", color: SYNTAX.bracket },
  ],
  [
    { text: "    api_key", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: "'your_api_key'", color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    host", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: "'http://127.0.0.1:5000'", color: SYNTAX.string },
  ],
  [
    { text: ")", color: SYNTAX.bracket },
  ],
  [],
  [
    { text: "# Place a market order", color: SYNTAX.comment },
  ],
  [
    { text: "response", color: SYNTAX.variable },
    { text: " = ", color: SYNTAX.operator },
    { text: "client", color: SYNTAX.variable },
    { text: ".", color: SYNTAX.text },
    { text: "placeorder", color: SYNTAX.function },
    { text: "(", color: SYNTAX.bracket },
  ],
  [
    { text: "    strategy", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"Python"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    symbol", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"NHPC"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    action", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"BUY"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    exchange", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"NSE"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    price_type", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"MARKET"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    product", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: '"MIS"', color: SYNTAX.string },
    { text: ",", color: SYNTAX.text },
  ],
  [
    { text: "    quantity", color: SYNTAX.variable },
    { text: "=", color: SYNTAX.operator },
    { text: "1", color: SYNTAX.number },
  ],
  [
    { text: ")", color: SYNTAX.bracket },
  ],
  [],
  [
    { text: "print", color: SYNTAX.function },
    { text: "(", color: SYNTAX.bracket },
    { text: "response", color: SYNTAX.variable },
    { text: ")", color: SYNTAX.bracket },
  ],
];

// macOS Code Editor with 3D perspective - LARGE ~92% screen
const MacOSCodeEditor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const monoFont = "JetBrains Mono, Fira Code, Monaco, Consolas, monospace";

  // Entry animation - no 3D rotation, just fade/scale
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(entryProgress, [0, 1], [0.95, 1]);
  const opacity = interpolate(entryProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typing animation - characters per frame
  const charsPerFrame = 3;
  const totalChars = pythonCodeLines.reduce(
    (sum, line) => sum + line.reduce((s, token) => s + token.text.length, 0) + 1,
    0
  );
  const typedChars = Math.min(frame * charsPerFrame, totalChars);

  // Calculate which characters to show
  let charCount = 0;
  const visibleLines: CodeToken[][] = [];

  for (const line of pythonCodeLines) {
    const visibleTokens: CodeToken[] = [];
    for (const token of line) {
      if (charCount >= typedChars) break;
      const remainingChars = typedChars - charCount;
      if (remainingChars >= token.text.length) {
        visibleTokens.push(token);
        charCount += token.text.length;
      } else {
        visibleTokens.push({
          text: token.text.slice(0, remainingChars),
          color: token.color,
        });
        charCount += remainingChars;
      }
    }
    visibleLines.push(visibleTokens);
    charCount += 1; // newline
    if (charCount >= typedChars) break;
  }

  // Response animation (appears after code is typed)
  const codeTypingDuration = totalChars / charsPerFrame;
  const responseDelay = codeTypingDuration + 20;
  const responseProgress = spring({
    frame: frame - responseDelay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const responseScale = interpolate(responseProgress, [0, 1], [0.9, 1]);
  const responseOpacity = interpolate(responseProgress, [0, 1], [0, 1]);

  // Glow pulse for response
  const glowPulse = interpolate(
    (frame - responseDelay) % 40,
    [0, 20, 40],
    [0.5, 1, 0.5]
  );

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0 && frame < codeTypingDuration;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* macOS Window - LARGE */}
      <div
        style={{
          width: 1760,
          backgroundColor: "#1e1e1e",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 100px rgba(0,0,0,0.6), 0 0 80px rgba(139, 92, 246, 0.3)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 50,
            backgroundColor: "#323233",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 10,
          }}
        >
          {/* Traffic lights */}
          <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
          <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#27ca3f" }} />
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#8b8b8b",
              fontSize: 18,
              fontFamily: monoFont,
            }}
          >
            openalgo_trade.py - Python
          </div>
        </div>

        {/* Code area - LARGE */}
        <div
          style={{
            padding: "30px 40px",
            minHeight: 700,
            fontFamily: monoFont,
            fontSize: 24,
            lineHeight: 1.7,
          }}
        >
          {visibleLines.map((line, lineIndex) => (
            <div key={lineIndex} style={{ display: "flex", minHeight: 41 }}>
              {/* Line number */}
              <span
                style={{
                  color: "#5c6370",
                  width: 50,
                  textAlign: "right",
                  marginRight: 30,
                  userSelect: "none",
                }}
              >
                {lineIndex + 1}
              </span>
              {/* Code tokens */}
              <span>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={{ color: token.color }}>
                    {token.text}
                  </span>
                ))}
                {/* Cursor at end of current line */}
                {lineIndex === visibleLines.length - 1 && cursorVisible && (
                  <span
                    style={{
                      backgroundColor: "#528bff",
                      width: 3,
                      height: 28,
                      display: "inline-block",
                      marginLeft: 2,
                    }}
                  />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Response Output - Inside the window */}
        {frame > responseDelay && (
          <div
            style={{
              margin: "0 40px 30px 40px",
              padding: "20px 30px",
              backgroundColor: "#0d1117",
              borderRadius: 12,
              border: `3px solid ${BRAND.green}`,
              boxShadow: `0 0 ${50 * glowPulse}px ${BRAND.green}80`,
              transform: `scale(${responseScale})`,
              opacity: responseOpacity,
              fontFamily: monoFont,
            }}
          >
            <div style={{ color: "#5c6370", fontSize: 18, marginBottom: 12 }}>
              Output:
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 28 }}>
              <span style={{ color: SYNTAX.bracket }}>{"{"}</span>
              <span style={{ color: SYNTAX.string }}>'orderid'</span>
              <span style={{ color: SYNTAX.text }}>:</span>
              <span style={{ color: SYNTAX.string }}>'250408000989443'</span>
              <span style={{ color: SYNTAX.text }}>,</span>
              <span style={{ color: SYNTAX.string }}>'status'</span>
              <span style={{ color: SYNTAX.text }}>:</span>
              <span
                style={{
                  color: BRAND.green,
                  fontWeight: 700,
                  textShadow: `0 0 ${25 * glowPulse}px ${BRAND.green}`,
                }}
              >
                'success'
              </span>
              <span style={{ color: SYNTAX.bracket }}>{"}"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Code Editor Scene
const Scene_CodeEditor: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MacOSCodeEditor />
    </AbsoluteFill>
  );
};

// ===== IMAGE EFFECT COMPONENTS =====

// 3D Perspective Laptop Frame with Image - FULL SCREEN, NO CUTOFF
const LaptopFrame: React.FC<{
  imageSrc: string;
  delay?: number;
}> = ({ imageSrc, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const openProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const lidRotation = interpolate(openProgress, [0, 1], [-90, 0]);
  const screenOpacity = interpolate(openProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
  });

  return (
    <div style={{ position: "relative", perspective: 2000 }}>
      {/* Screen/Lid - FULL SIZE */}
      <div
        style={{
          width: 1800,
          height: 1012,
          backgroundColor: "#0a0a0a",
          borderRadius: "12px 12px 0 0",
          border: "3px solid #333",
          overflow: "hidden",
          transformOrigin: "bottom center",
          transform: `rotateX(${lidRotation}deg)`,
          boxShadow: "0 -15px 80px rgba(139, 92, 246, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Screen content with image - CONTAIN to show full image */}
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: screenOpacity,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0a0a0a",
          }}
        >
          <Img
            src={imageSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* Base - Minimal */}
      <div
        style={{
          width: 1860,
          height: 12,
          backgroundColor: "#222",
          borderRadius: "0 0 6px 6px",
          marginLeft: -30,
          border: "2px solid #333",
          borderTop: "none",
        }}
      />
    </div>
  );
};

// Floating Image with Glow Effect - LARGE ~92% screen
const FloatingImage: React.FC<{
  imageSrc: string;
  glowColor?: string;
}> = ({ imageSrc, glowColor = "#a855f7" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scale = interpolate(entryProgress, [0, 1], [0.9, 1]);
  const opacity = interpolate(entryProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Float animation - subtle
  const floatY = interpolate(
    frame % 90,
    [0, 45, 90],
    [0, -8, 0]
  );

  // Glow pulse
  const glowIntensity = interpolate(
    frame % 50,
    [0, 25, 50],
    [0.3, 0.7, 0.3]
  );

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${floatY}px)`,
        opacity,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 20px 100px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
      }}
    >
      <Img
        src={imageSrc}
        style={{
          width: 1760,
          height: 990,
          objectFit: "contain",
          borderRadius: 16,
          border: `2px solid ${glowColor}40`,
          backgroundColor: "#0a0a0a",
        }}
      />
    </div>
  );
};

// 3D Card Rotate Effect - LARGE ~92% screen
const Card3D: React.FC<{
  imageSrc: string;
}> = ({ imageSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotateProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const rotateY = interpolate(rotateProgress, [0, 1], [90, 0]);
  const opacity = interpolate(rotateProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        perspective: 2000,
      }}
    >
      <div
        style={{
          transform: `rotateY(${rotateY}deg)`,
          opacity,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: 1760,
            height: 990,
            objectFit: "contain",
            backgroundColor: "#0a0a0a",
          }}
        />
      </div>
    </div>
  );
};

// Glitch Effect Image - LARGE ~92% screen
const GlitchImage: React.FC<{
  imageSrc: string;
}> = ({ imageSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  const scale = interpolate(entryProgress, [0, 1], [0.95, 1]);
  const opacity = interpolate(entryProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glitch offsets (random-looking based on frame)
  const glitchFrame = Math.floor(frame / 4) % 12;
  const redOffset = glitchFrame === 3 || glitchFrame === 8 ? 10 : 0;
  const blueOffset = glitchFrame === 3 || glitchFrame === 8 ? -10 : 0;

  return (
    <div
      style={{
        position: "relative",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Red channel */}
      <Img
        src={imageSrc}
        style={{
          width: 1760,
          height: 990,
          objectFit: "contain",
          borderRadius: 12,
          position: "absolute",
          mixBlendMode: "screen",
          filter: "grayscale(100%) brightness(0.5)",
          opacity: redOffset ? 0.5 : 0,
          transform: `translateX(${redOffset}px)`,
          backgroundColor: "#0a0a0a",
        }}
      />
      {/* Main image */}
      <Img
        src={imageSrc}
        style={{
          width: 1760,
          height: 990,
          objectFit: "contain",
          borderRadius: 12,
          boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
          backgroundColor: "#0a0a0a",
        }}
      />
      {/* Blue channel */}
      <Img
        src={imageSrc}
        style={{
          width: 1760,
          height: 990,
          objectFit: "contain",
          borderRadius: 12,
          position: "absolute",
          top: 0,
          left: 0,
          mixBlendMode: "screen",
          filter: "grayscale(100%) brightness(0.5)",
          opacity: blueOffset ? 0.5 : 0,
          transform: `translateX(${blueOffset}px)`,
          backgroundColor: "#0a0a0a",
        }}
      />
    </div>
  );
};

// ===== SCENES =====

// Logo Image Reveal with 3D rotation
const Scene_LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotateProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scale = interpolate(rotateProgress, [0, 1], [0.3, 1]);
  const rotateY = interpolate(rotateProgress, [0, 1], [180, 0]);
  const opacity = interpolate(rotateProgress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.3, 0.8, 0.3]);

  return (
    <AbsoluteFill
      style={{
        background: BRAND.white,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          perspective: 1000,
        }}
      >
        <div
          style={{
            transform: `scale(${scale}) rotateY(${rotateY}deg)`,
            opacity,
            filter: `drop-shadow(0 0 ${60 * glowPulse}px rgba(139, 92, 246, 0.5))`,
          }}
        >
          <Img
            src={staticFile("openalgo/logo.png")}
            style={{
              width: 400,
              height: 400,
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_Logo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["Open", "Algo"]} colors={[BRAND.purple, BRAND.green]} fontSize={180} stagger={8} />
    </AbsoluteFill>
  );
};

// Toggle Switch Component - Stays on Manual, then switches to Auto
const ToggleSwitch: React.FC<{ toggleDelay?: number }> = ({ toggleDelay = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation for the toggle itself
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Toggle animation - starts AFTER toggleDelay (stays on Manual first)
  const toggleProgress = spring({
    frame: frame - toggleDelay,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const knobPosition = interpolate(toggleProgress, [0, 1], [6, 122], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Track color changes when toggle happens
  const isAuto = toggleProgress > 0.5;

  // Glow effect when activated
  const glowIntensity = interpolate(toggleProgress, [0.7, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity: interpolate(entryProgress, [0, 1], [0, 1]),
        transform: `scale(${interpolate(entryProgress, [0, 1], [0.8, 1])})`,
      }}
    >
      {/* Labels */}
      <div style={{ display: "flex", gap: 100, fontSize: 32, fontWeight: 600, fontFamily }}>
        <span
          style={{
            color: isAuto ? BRAND.gray : BRAND.white,
            textShadow: !isAuto ? "0 0 20px rgba(255,255,255,0.3)" : "none",
          }}
        >
          Manual
        </span>
        <span
          style={{
            color: isAuto ? BRAND.purple : BRAND.gray,
            textShadow: isAuto ? `0 0 30px ${BRAND.purple}` : "none",
          }}
        >
          Auto
        </span>
      </div>

      {/* Toggle Track */}
      <div
        style={{
          width: 200,
          height: 76,
          borderRadius: 50,
          backgroundColor: isAuto ? BRAND.purple : "#374151",
          padding: 0,
          boxShadow: isAuto
            ? `0 0 ${50 * glowIntensity}px ${BRAND.purple}80, 0 4px 20px rgba(0,0,0,0.3)`
            : "0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {/* Knob */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            backgroundColor: BRAND.white,
            position: "absolute",
            left: knobPosition,
            top: 4,
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          }}
        />
      </div>
    </div>
  );
};

const Scene_Enabled: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing: Toggle stays on Manual for 15 frames (0.5 sec), then animates to Auto quickly
  const toggleDelay = 15;
  // Text appears AFTER toggle switches (toggle animation takes ~12 frames now)
  const textDelay = toggleDelay + 15;
  // ENABLED appears after text
  const enabledDelay = textDelay + 10;

  // Text animations - delayed until after toggle switches
  const textProgress = spring({
    frame: frame - textDelay,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const enabledProgress = spring({
    frame: frame - enabledDelay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const glowPulse = interpolate((frame - enabledDelay) % 30, [0, 15, 30], [0.5, 1, 0.5]);

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        {/* Toggle Switch - stays on Manual for 1 second then switches */}
        <ToggleSwitch toggleDelay={toggleDelay} />

        {/* Algo Trading Text - appears after toggle switches */}
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <span
            style={{
              fontSize: 100,
              fontWeight: 800,
              fontFamily,
              color: BRAND.purple,
              opacity: interpolate(textProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(textProgress, [0, 1], [40, 0])}px)`,
            }}
          >
            Algo
          </span>
          <span
            style={{
              fontSize: 100,
              fontWeight: 800,
              fontFamily,
              color: BRAND.white,
              opacity: interpolate(textProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(textProgress, [0, 1], [40, 0])}px)`,
            }}
          >
            Trading
          </span>
        </div>

        {/* ENABLED Text - appears after "Algo Trading" */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            fontFamily,
            color: BRAND.purple,
            opacity: interpolate(enabledProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(enabledProgress, [0, 1], [0.5, 1])})`,
            textShadow: `0 0 ${40 * glowPulse}px ${BRAND.purple}`,
          }}
        >
          ENABLED
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Combined: Your Personal Algo Trading Platform
const Scene_PersonalPlatform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = ["Your", "Personal"];
  const line1Colors = [BRAND.red, BRAND.orange];

  const line2 = ["Algo", "Trading", "Platform"];
  const line2Colors = [BRAND.yellow, BRAND.green, BRAND.cyan];

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Line 1: Your Personal */}
        <div style={{ display: "flex", gap: 24 }}>
          {line1.map((word, i) => {
            const progress = spring({
              frame: frame - i * 5,
              fps,
              config: { damping: 12, stiffness: 200 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 120,
                  fontWeight: 800,
                  fontFamily,
                  color: line1Colors[i],
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px) scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
                  textShadow: `0 0 40px ${line1Colors[i]}60`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Line 2: Algo Trading Platform */}
        <div style={{ display: "flex", gap: 24 }}>
          {line2.map((word, i) => {
            const progress = spring({
              frame: frame - 12 - i * 5,
              fps,
              config: { damping: 12, stiffness: 200 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 120,
                  fontWeight: 800,
                  fontFamily,
                  color: line2Colors[i],
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px) scale(${interpolate(progress, [0, 1], [0.7, 1])})`,
                  textShadow: `0 0 40px ${line2Colors[i]}60`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Website screenshot in laptop
const Scene_WebsiteLaptop: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <LaptopFrame imageSrc={staticFile("openalgo/website.png")} delay={5} />
    </AbsoluteFill>
  );
};

// Website with floating glow
const Scene_WebsiteFloat: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${SLIDES.purple.bg} 0%, ${SLIDES.blue.bg} 100%)`, justifyContent: "center", alignItems: "center" }}>
      <FloatingImage imageSrc={staticFile("openalgo/website.png")} glowColor={BRAND.purple} />
    </AbsoluteFill>
  );
};

// Website with 3D card rotate
const Scene_Website3D: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <Card3D imageSrc={staticFile("openalgo/website.png")} />
    </AbsoluteFill>
  );
};

// Dashboard/SDK screenshot with glitch
const Scene_DashboardGlitch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <GlitchImage imageSrc={staticFile("openalgo/dashboard.png")} />
    </AbsoluteFill>
  );
};

const Scene_Downloads: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.cyan.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Counter value={75000} suffix="+" color={BRAND.cyan} fontSize={160} />
        <SlideLabel text="Downloads" color={BRAND.cyan} />
      </div>
    </AbsoluteFill>
  );
};

const Scene_OpenSource: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.green.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Counter value={100} suffix="%" color={BRAND.green} fontSize={180} />
        <SlideLabel text="Open Source" color={BRAND.green} />
      </div>
    </AbsoluteFill>
  );
};

const Scene_Stars: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.yellow.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Counter value={1100} suffix="+" color={BRAND.yellow} fontSize={160} />
        <SlideLabel text="GitHub Stars" color={BRAND.yellow} />
      </div>
    </AbsoluteFill>
  );
};

const Scene_SDKs: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.purple.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <PopWord text="6" color={BRAND.purple} fontSize={200} delay={0} />
        <AnimatedWords words={["Official", "SDKs"]} colors={[BRAND.white, BRAND.purple]} fontSize={80} stagger={5} />
      </div>
    </AbsoluteFill>
  );
};

// SDK Title Scene - "Built for Developers"
const Scene_SDKTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const subtitleProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily,
            color: BRAND.purple,
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
            textShadow: `0 0 60px ${BRAND.purple}80`,
          }}
        >
          Built for Developers
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          Code in your favorite language
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_SDKList: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords
        words={["Python", "Node.js", "Java", ".NET", "Go", "Rust"]}
        colors={[BRAND.yellow, BRAND.green, BRAND.orange, BRAND.blue, BRAND.cyan, BRAND.pink]}
        fontSize={80}
        stagger={5}
      />
    </AbsoluteFill>
  );
};

const Scene_Integrations: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.purple.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <PopWord text="25+" color={BRAND.purple} fontSize={180} delay={0} />
        <SlideLabel text="Broker Integrations" color={BRAND.purple} />
      </div>
    </AbsoluteFill>
  );
};

// Integration Title Scene - "Trade from Your Platform"
const Scene_IntegrationTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const subtitleProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            fontFamily,
            color: BRAND.purple,
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
            textShadow: `0 0 60px ${BRAND.purple}80`,
          }}
        >
          Trade from Your Platform
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          Connect with your favorite trading tools
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_IntegrationList: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords
        words={["TradingView", "Amibroker", "MetaTrader", "ChartInk", "Excel", "N8N"]}
        colors={[BRAND.blue, BRAND.purple, BRAND.green, BRAND.orange, BRAND.cyan, BRAND.yellow]}
        fontSize={70}
        stagger={4}
      />
    </AbsoluteFill>
  );
};

const Scene_NoCode: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.purple.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["No-Code", "Strategies"]} colors={[BRAND.purple, BRAND.white]} fontSize={120} stagger={8} />
    </AbsoluteFill>
  );
};

const Scene_Telegram: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.blue.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["Telegram", "Alerts"]} colors={[BRAND.blue, BRAND.cyan]} fontSize={120} stagger={8} />
    </AbsoluteFill>
  );
};

const Scene_ZeroCoding: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.green.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["Zero", "Coding", "Effort"]} colors={[BRAND.green, BRAND.cyan, BRAND.white]} fontSize={110} stagger={5} />
    </AbsoluteFill>
  );
};

const Scene_Community: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.orange.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["Community", "Driven"]} colors={[BRAND.orange, BRAND.white]} fontSize={120} stagger={8} />
    </AbsoluteFill>
  );
};

// ===== HOSTING & PLATFORM SCENES =====

const Scene_HostYourDomain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const domainProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 70,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
          }}
        >
          Host on Your Own Domain
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily,
            color: BRAND.cyan,
            opacity: interpolate(domainProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(domainProgress, [0, 1], [0.5, 1])})`,
            textShadow: `0 0 ${60 * glowPulse}px ${BRAND.cyan}`,
          }}
        >
          yourdomain.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_RunAnywhere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const devices = ["Desktop", "Laptop", "Server"];

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(spring({ frame, fps, config: { damping: 15 } }), [0, 1], [0, 1]),
          }}
        >
          Run Anywhere
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          {devices.map((device, i) => {
            const progress = spring({
              frame: frame - i * 8,
              fps,
              config: { damping: 12, stiffness: 150 },
            });
            return (
              <div
                key={device}
                style={{
                  fontSize: 70,
                  fontWeight: 800,
                  fontFamily,
                  color: [BRAND.purple, BRAND.cyan, BRAND.green][i],
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px) scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
                }}
              >
                {device}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_CrossPlatform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = [
    { name: "Windows", color: BRAND.blue },
    { name: "macOS", color: BRAND.white },
    { name: "Linux", color: BRAND.orange },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            fontFamily,
            color: BRAND.gray,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
          }}
        >
          Cross Platform
        </div>
        <div style={{ display: "flex", gap: 80 }}>
          {platforms.map((platform, i) => {
            const progress = spring({
              frame: frame - i * 6,
              fps,
              config: { damping: 12, stiffness: 180 },
            });
            return (
              <div
                key={platform.name}
                style={{
                  fontSize: 80,
                  fontWeight: 800,
                  fontFamily,
                  color: platform.color,
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(progress, [0, 1], [0, 1])}) rotate(${interpolate(progress, [0, 1], [-10, 0])}deg)`,
                  textShadow: `0 0 40px ${platform.color}50`,
                }}
              >
                {platform.name}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_EveryDevice: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const options = [
    { name: "Raspberry Pi", color: BRAND.pink },
    { name: "Docker", color: BRAND.blue },
    { name: "VPS", color: BRAND.cyan },
    { name: "Cloud", color: BRAND.purple },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
          }}
        >
          Deploy Anywhere
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px 60px", maxWidth: 1200 }}>
          {options.map((option, i) => {
            const progress = spring({
              frame: frame - i * 5,
              fps,
              config: { damping: 12, stiffness: 200 },
            });
            return (
              <div
                key={option.name}
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  fontFamily,
                  color: option.color,
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
                  textShadow: `0 0 30px ${option.color}60`,
                }}
              >
                {option.name}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== LIVE/SANDBOX MODE SCENES =====

const Scene_LiveSandboxToggle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entry animation
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Toggle animation - starts at Sandbox, switches to Live
  const sandboxDelay = 25;
  const liveDelay = 55;

  const sandboxProgress = spring({
    frame: frame - sandboxDelay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const liveProgress = spring({
    frame: frame - liveDelay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Switch position (track: 220px, knob: 70px, padding: 5px each side)
  const switchProgress = spring({
    frame: frame - liveDelay,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const switchPosition = interpolate(switchProgress, [0, 1], [0, 140]);
  const isLive = switchProgress > 0.5;

  // Glow effect
  const glowPulse = interpolate((frame - liveDelay) % 30, [0, 15, 30], [0.5, 1, 0.5]);

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
          opacity: interpolate(entryProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(entryProgress, [0, 1], [0.9, 1])})`,
        }}
      >
        {/* Title */}
        <div style={{ fontSize: 48, fontWeight: 600, fontFamily, color: BRAND.gray }}>
          Choose Your Mode
        </div>

        {/* Toggle Container */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* Sandbox Mode */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
              opacity: interpolate(sandboxProgress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(sandboxProgress, [0, 1], [-50, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                fontFamily,
                color: isLive ? BRAND.gray : BRAND.orange,
                textShadow: !isLive ? `0 0 40px ${BRAND.orange}80` : "none",
                transition: "color 0.3s",
              }}
            >
              Sandbox
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, fontFamily, color: BRAND.gray }}>
              Test Strategies
            </div>
          </div>

          {/* Toggle Switch */}
          <div
            style={{
              width: 220,
              height: 80,
              borderRadius: 50,
              backgroundColor: isLive ? BRAND.green : BRAND.orange,
              position: "relative",
              boxShadow: isLive
                ? `0 0 ${50 * glowPulse}px ${BRAND.green}80`
                : `0 0 30px ${BRAND.orange}50`,
              transition: "background-color 0.3s",
            }}
          >
            {/* Knob */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundColor: BRAND.white,
                position: "absolute",
                left: 5 + switchPosition,
                top: 5,
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            />
          </div>

          {/* Live Mode */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
              opacity: interpolate(liveProgress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(liveProgress, [0, 1], [50, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                fontFamily,
                color: isLive ? BRAND.green : BRAND.gray,
                textShadow: isLive ? `0 0 40px ${BRAND.green}80` : "none",
                transition: "color 0.3s",
              }}
            >
              Live
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, fontFamily, color: BRAND.gray }}>
              Real Trading
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily,
            color: isLive ? BRAND.green : BRAND.orange,
            opacity: interpolate(switchProgress, [0, 0.8, 1], [1, 0.5, 1]),
            textShadow: isLive ? `0 0 30px ${BRAND.green}` : `0 0 30px ${BRAND.orange}`,
          }}
        >
          {isLive ? "Trading with Real Money" : "Safe Testing Environment"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_LivePNL: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // PNL animation - starts negative, goes positive
  const pnlValues = [
    { frame: 0, value: 0 },
    { frame: 15, value: -2340 },
    { frame: 30, value: -1250 },
    { frame: 45, value: 890 },
    { frame: 60, value: 3420 },
    { frame: 75, value: 5670 },
    { frame: 90, value: 8450 },
    { frame: 105, value: 12340 },
    { frame: 120, value: 15680 },
  ];

  // Find current PNL value based on frame
  let currentPNL = 0;
  for (let i = 0; i < pnlValues.length - 1; i++) {
    if (frame >= pnlValues[i].frame && frame < pnlValues[i + 1].frame) {
      const progress = (frame - pnlValues[i].frame) / (pnlValues[i + 1].frame - pnlValues[i].frame);
      currentPNL = interpolate(progress, [0, 1], [pnlValues[i].value, pnlValues[i + 1].value]);
      break;
    }
  }
  if (frame >= pnlValues[pnlValues.length - 1].frame) {
    currentPNL = pnlValues[pnlValues.length - 1].value;
  }

  const isPositive = currentPNL >= 0;
  const pnlColor = isPositive ? BRAND.green : BRAND.red;
  const displayPNL = Math.abs(Math.round(currentPNL)).toLocaleString();

  // Entry animation
  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Glow pulse
  const glowPulse = interpolate(frame % 25, [0, 12, 25], [0.5, 1, 0.5]);

  // Shake effect on value change
  const shake = frame > 30 ? Math.sin(frame * 0.5) * (frame < 50 ? 2 : 0) : 0;

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          opacity: interpolate(entryProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(entryProgress, [0, 1], [0.9, 1])})`,
        }}
      >
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: BRAND.green,
              boxShadow: `0 0 ${20 * glowPulse}px ${BRAND.green}`,
              animation: "pulse 1s infinite",
            }}
          />
          <div style={{ fontSize: 36, fontWeight: 600, fontFamily, color: BRAND.gray }}>
            LIVE INTRADAY MTM
          </div>
        </div>

        {/* PNL Display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            padding: "40px 80px",
            backgroundColor: "#111",
            borderRadius: 20,
            border: `3px solid ${pnlColor}40`,
            boxShadow: `0 0 ${60 * glowPulse}px ${pnlColor}30`,
            transform: `translateX(${shake}px)`,
          }}
        >
          {/* PNL Value */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              fontFamily,
              color: pnlColor,
              textShadow: `0 0 ${50 * glowPulse}px ${pnlColor}`,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontSize: 80, marginRight: 10 }}>{isPositive ? "+" : "-"}</span>
            <span style={{ fontSize: 70, marginRight: 5 }}>₹</span>
            {displayPNL}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              fontFamily,
              color: pnlColor,
              letterSpacing: 4,
            }}
          >
            {isPositive ? "PROFIT" : "LOSS"}
          </div>
        </div>

        {/* Real-time indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            fontSize: 28,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: BRAND.cyan,
              boxShadow: `0 0 ${15 * glowPulse}px ${BRAND.cyan}`,
            }}
          />
          Real-time P&L Tracking
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== FEATURE SCENES =====

const Scene_PythonStrategies: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const subtitleProgress = spring({ frame: frame - 15, fps, config: { damping: 15, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            fontFamily,
            color: BRAND.yellow,
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
            textShadow: `0 0 50px ${BRAND.yellow}60`,
          }}
        >
          Your Python Strategies
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          Host & Manage Inside OpenAlgo
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_StrategyBuilder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.5, 1, 0.5]);

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
          }}
        >
          For Non-Developers
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Visual", "Strategy", "Builder"].map((word, i) => {
            const progress = spring({
              frame: frame - 10 - i * 5,
              fps,
              config: { damping: 12, stiffness: 150 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 90,
                  fontWeight: 900,
                  fontFamily,
                  color: [BRAND.green, BRAND.cyan, BRAND.purple][i],
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
                  textShadow: `0 0 ${40 * glowPulse}px ${[BRAND.green, BRAND.cyan, BRAND.purple][i]}60`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily,
            color: BRAND.orange,
            opacity: interpolate(spring({ frame: frame - 30, fps }), [0, 1], [0, 1]),
          }}
        >
          N8N-Style Drag & Drop
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_APIs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 30, [0, 15, 30], [0.5, 1, 0.5]);

  return (
    <AbsoluteFill style={{ background: SLIDES.blue.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <PopWord text="40+" color={BRAND.blue} fontSize={200} delay={0} />
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily,
            color: BRAND.cyan,
            opacity: interpolate(spring({ frame: frame - 15, fps }), [0, 1], [0, 1]),
            textShadow: `0 0 ${30 * glowPulse}px ${BRAND.cyan}`,
          }}
        >
          Powerful APIs
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(spring({ frame: frame - 25, fps }), [0, 1], [0, 1]),
          }}
        >
          Build Your Own Trading Platform
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_CommonStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { label: "Common API", color: BRAND.purple },
    { label: "Common Websockets", color: BRAND.cyan },
    { label: "Common Symbols", color: BRAND.green },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
          }}
        >
          One Unified Stack
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
          {items.map((item, i) => {
            const progress = spring({
              frame: frame - 15 - i * 8,
              fps,
              config: { damping: 12, stiffness: 150 },
            });
            return (
              <div
                key={item.label}
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  fontFamily,
                  color: item.color,
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(progress, [0, 1], [-100, 0])}px)`,
                  textShadow: `0 0 30px ${item.color}50`,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_BuildOnTop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
          }}
        >
          Build Your Platform
        </div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily,
            background: RAINBOW_GRADIENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            opacity: interpolate(spring({ frame: frame - 10, fps }), [0, 1], [0, 1]),
            transform: `scale(${interpolate(spring({ frame: frame - 10, fps }), [0, 1], [0.8, 1])})`,
            filter: `drop-shadow(0 0 ${50 * glowPulse}px ${BRAND.purple}50)`,
          }}
        >
          On Top of OpenAlgo
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== AI & RETAIL TRADER SCENES =====

const Scene_AIDriven: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            fontFamily,
            color: BRAND.purple,
            opacity: interpolate(titleProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(titleProgress, [0, 1], [0.5, 1])})`,
            textShadow: `0 0 ${80 * glowPulse}px ${BRAND.purple}`,
          }}
        >
          100%
        </div>
        <div
          style={{
            fontSize: 70,
            fontWeight: 800,
            fontFamily,
            background: `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.purple})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          AI Driven Development
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_AIStrategies: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Build", "Trading", "Strategies"];
  const colors = [BRAND.green, BRAND.cyan, BRAND.purple];

  const subtitleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ display: "flex", gap: 24 }}>
          {words.map((word, i) => {
            const progress = spring({
              frame: frame - i * 6,
              fps,
              config: { damping: 12, stiffness: 180 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 90,
                  fontWeight: 800,
                  fontFamily,
                  color: colors[i],
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px)`,
                  textShadow: `0 0 40px ${colors[i]}60`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.orange,
            opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
          }}
        >
          Using AI Tools
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_StaticIP: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 30, [0, 15, 30], [0.5, 1, 0.5]);

  const checkProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            fontFamily,
            color: BRAND.cyan,
            opacity: interpolate(spring({ frame, fps }), [0, 1], [0, 1]),
            transform: `translateY(${interpolate(spring({ frame, fps }), [0, 1], [40, 0])}px)`,
            textShadow: `0 0 50px ${BRAND.cyan}60`,
          }}
        >
          Static IP Compliance
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(checkProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(checkProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: BRAND.green,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 0 ${30 * glowPulse}px ${BRAND.green}`,
            }}
          >
            <span style={{ fontSize: 36, color: BRAND.white }}>✓</span>
          </div>
          <span style={{ fontSize: 40, fontWeight: 600, fontFamily, color: BRAND.gray }}>
            Broker Ready
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_RetailTraders: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  const line1Progress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const line2Progress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  const line3Progress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(line1Progress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line1Progress, [0, 1], [30, 0])}px)`,
          }}
        >
          Designed for
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            fontFamily,
            color: BRAND.green,
            opacity: interpolate(line2Progress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(line2Progress, [0, 1], [0.8, 1])})`,
            textShadow: `0 0 ${50 * glowPulse}px ${BRAND.green}60`,
          }}
        >
          Retail Traders
        </div>
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(line3Progress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line3Progress, [0, 1], [20, 0])}px)`,
          }}
        >
          to Compete with{" "}
          <span style={{ color: BRAND.purple, textShadow: `0 0 30px ${BRAND.purple}` }}>
            Institutions
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== PHILOSOPHY SCENES =====

const Scene_PhilosophyTitle: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <AnimatedWords words={["Our", "Philosophy"]} colors={[BRAND.white, BRAND.purple]} fontSize={140} stagger={8} />
    </AbsoluteFill>
  );
};

const Scene_PhilosophyQuote1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Your", "trading", "system", "should", "be", "yours."];

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, padding: "0 100px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 16px" }}>
          {words.map((word, i) => {
            const progress = spring({
              frame: frame - i * 3,
              fps,
              config: { damping: 15, stiffness: 200 },
            });
            const isHighlight = word === "yours.";
            return (
              <span
                key={i}
                style={{
                  fontSize: 80,
                  fontWeight: isHighlight ? 900 : 700,
                  fontFamily,
                  color: isHighlight ? BRAND.purple : BRAND.white,
                  opacity: interpolate(progress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
                  textShadow: isHighlight ? `0 0 40px ${BRAND.purple}99` : "none",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene_PhilosophyQuote2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = [
    { text: "Not hosted on someone else's server.", delay: 0 },
    { text: "Not dependent on a vendor's uptime.", delay: 12 },
    { text: "Not subject to arbitrary limits or fees.", delay: 24 },
  ];

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {lines.map((line, i) => {
          const progress = spring({
            frame: frame - line.delay,
            fps,
            config: { damping: 15, stiffness: 150 },
          });
          return (
            <div
              key={i}
              style={{
                fontSize: 48,
                fontWeight: 500,
                fontFamily,
                color: "#9ca3af",
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene_PhilosophyStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { value: "Zero", label: "Data Collection", color: BRAND.cyan, delay: 0 },
    { value: "100%", label: "Open Source", color: BRAND.green, delay: 10 },
    { value: "Forever", label: "Free & Open", color: BRAND.purple, delay: 20 },
  ];

  return (
    <AbsoluteFill style={{ background: SLIDES.dark.bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 100 }}>
        {stats.map((stat, i) => {
          const progress = spring({
            frame: frame - stat.delay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          const scale = interpolate(progress, [0, 1], [0.5, 1]);
          const opacity = interpolate(progress, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  fontFamily,
                  color: stat.color,
                  textShadow: `0 0 40px ${stat.color}60`,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  fontFamily,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene_YourTerms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phrases = [
    { words: ["Your", "Terms."], colors: [BRAND.white, BRAND.purple] },
    { words: ["Your", "Rules."], colors: [BRAND.white, BRAND.green] },
    { words: ["Your", "Control."], colors: [BRAND.white, BRAND.cyan] },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.dark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 50 }}>
        {phrases.map((phrase, phraseIndex) => (
          <div key={phraseIndex} style={{ display: "flex", gap: 16 }}>
            {phrase.words.map((word, wordIndex) => {
              const delay = phraseIndex * 8 + wordIndex * 4;
              const progress = spring({
                frame: frame - delay,
                fps,
                config: { damping: 12, stiffness: 200 },
              });
              return (
                <span
                  key={word}
                  style={{
                    fontSize: 80,
                    fontWeight: 800,
                    fontFamily,
                    color: phrase.colors[wordIndex],
                    opacity: interpolate(progress, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px) scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ===== FINAL CTA SCREEN =====

const Scene_FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const monoFont = "JetBrains Mono, Fira Code, Monaco, Consolas, monospace";

  // Main URL animation
  const urlProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const urlScale = interpolate(urlProgress, [0, 1], [0.3, 1]);
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  // Subtext animation
  const subtextProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const subtextY = interpolate(subtextProgress, [0, 1], [60, 0]);
  const subtextOpacity = interpolate(subtextProgress, [0, 1], [0, 1]);

  // Glow pulse
  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  // Terminal typing animation
  const terminalDelay = 45;
  const gitCommand = "git clone https://github.com/marketcalls/openalgo";
  const charsPerFrame = 1.5;
  const typedChars = Math.min(Math.floor((frame - terminalDelay) * charsPerFrame), gitCommand.length);
  const visibleCommand = frame > terminalDelay ? gitCommand.slice(0, Math.max(0, typedChars)) : "";

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Terminal entry animation
  const terminalProgress = spring({
    frame: frame - terminalDelay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${SLIDES.darkBlue.bg} 0%, ${BRAND.dark} 70%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        {/* Big openalgo.in text with rainbow gradient */}
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            fontFamily,
            background: RAINBOW_GRADIENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: `scale(${urlScale})`,
            opacity: urlOpacity,
            filter: `drop-shadow(0 0 ${80 * glowPulse}px ${BRAND.purple}66)`,
            letterSpacing: -4,
          }}
        >
          openalgo.in
        </div>

        {/* Subtext - matches website tagline style */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            transform: `translateY(${subtextY}px)`,
            opacity: subtextOpacity,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              fontFamily,
              color: BRAND.white,
              letterSpacing: 2,
            }}
          >
            Your Personal Algo Trading Platform
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              fontFamily,
              color: BRAND.gray,
              letterSpacing: 4,
            }}
          >
            100% Open Source | Forever Free
          </div>
        </div>

        {/* Terminal with git clone command */}
        <div
          style={{
            marginTop: 20,
            opacity: interpolate(terminalProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(terminalProgress, [0, 1], [30, 0])}px)`,
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: 12,
              padding: "20px 40px",
              border: `2px solid ${BRAND.purple}40`,
              boxShadow: `0 0 ${40 * glowPulse}px ${BRAND.purple}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Terminal prompt */}
              <span
                style={{
                  fontSize: 32,
                  fontFamily: monoFont,
                  color: BRAND.green,
                  fontWeight: 600,
                }}
              >
                $
              </span>
              {/* Command text */}
              <span
                style={{
                  fontSize: 32,
                  fontFamily: monoFont,
                  color: BRAND.white,
                }}
              >
                {visibleCommand}
              </span>
              {/* Blinking cursor */}
              {cursorVisible && (
                <span
                  style={{
                    width: 3,
                    height: 36,
                    backgroundColor: BRAND.green,
                    display: "inline-block",
                    marginLeft: 2,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== MAIN COMPOSITION =====

export const OpenAlgoVideo: React.FC = () => {
  const fastTransition = 12;    // Slowed down
  const mediumTransition = 15;  // Slowed down

  return (
    <>
      {/* Background Music */}
      <Audio src={staticFile("openalgo/music.mp3")} volume={1} startFrom={30} />

      <TransitionSeries>
      {/* Logo Text */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_Logo />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Algo Trading Enabled */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_Enabled />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Your Personal Algo Trading Platform - Combined & Longer */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG + 20}>
        <Scene_PersonalPlatform />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Host on Your Domain */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_HostYourDomain />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Run Anywhere - Desktop, Laptop, Server */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_RunAnywhere />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Cross Platform - Windows, macOS, Linux */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_CrossPlatform />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Deploy Anywhere - Raspberry Pi, Docker, VPS, Cloud */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_EveryDevice />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* 75,000+ Downloads */}
      <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
        <Scene_Downloads />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* 100% Open Source */}
      <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
        <Scene_OpenSource />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* 1100+ Stars */}
      <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
        <Scene_Stars />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* 6 Official SDKs */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_SDKs />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* SDK Title - Built for Developers */}
      <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
        <Scene_SDKTitle />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* SDK List */}
      <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
        <Scene_SDKList />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Python Code Editor */}
      <TransitionSeries.Sequence durationInFrames={180}>
        <Scene_CodeEditor />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Website 3D */}
      <TransitionSeries.Sequence durationInFrames={SCENE_IMAGE}>
        <Scene_Website3D />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* 25+ Broker Integrations */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_Integrations />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Integration Title - Trade from Your Platform */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_IntegrationTitle />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Integration List */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_IntegrationList />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Your Python Strategies */}
      <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
        <Scene_PythonStrategies />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Live/Sandbox Mode Toggle */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG + 30}>
        <Scene_LiveSandboxToggle />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Live Intraday PNL Animation */}
      <TransitionSeries.Sequence durationInFrames={140}>
        <Scene_LivePNL />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Visual Strategy Builder - N8N Style */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_StrategyBuilder />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* 40+ APIs */}
      <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
        <Scene_APIs />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Common Stack - API, Websockets, Symbols */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_CommonStack />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Build On Top of OpenAlgo */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_BuildOnTop />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* 100% AI Driven Development */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_AIDriven />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Build Trading Strategies Using AI Tools */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_AIStrategies />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Static IP Compliance */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_StaticIP />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Designed for Retail Traders */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG + 20}>
        <Scene_RetailTraders />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* No-Code Strategies */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_NoCode />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Telegram Alerts */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_Telegram />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Dashboard with Glitch */}
      <TransitionSeries.Sequence durationInFrames={SCENE_IMAGE}>
        <Scene_DashboardGlitch />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* Zero Coding Effort */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_ZeroCoding />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Community Driven */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_Community />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* ===== PHILOSOPHY SECTION ===== */}

      {/* Our Philosophy Title */}
      <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
        <Scene_PhilosophyTitle />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Your trading system should be yours */}
      <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM + 10}>
        <Scene_PhilosophyQuote1 />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Not hosted, not dependent, not subject */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_PhilosophyQuote2 />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Your Terms, Your Rules, Your Control */}
      <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
        <Scene_YourTerms />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: fastTransition })}
      />

      {/* Zero, 100%, Forever Stats */}
      <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
        <Scene_PhilosophyStats />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: mediumTransition })}
      />

      {/* ===== FINAL CTA ===== */}

      {/* Big openalgo.in with git clone command - hold for 5 seconds at end */}
      <TransitionSeries.Sequence durationInFrames={250}>
        <Scene_FinalCTA />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    </>
  );
};

export default OpenAlgoVideo;
