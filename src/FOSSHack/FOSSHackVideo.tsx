import {
  AbsoluteFill,
  Audio,
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

// Timing constants
const SCENE_SHORT = 45;
const SCENE_MEDIUM = 65;
const SCENE_LONG = 85;
const SCENE_STATS = 75;

// FOSS Hack Brand Colors
const BRAND = {
  black: "#0a0a0a",
  white: "#ffffff",
  gray: "#6b7280",
  lightGray: "#9ca3af",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  cyan: "#06b6d4",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  red: "#ef4444",
};

// Rainbow gradient
const RAINBOW_GRADIENT = "linear-gradient(90deg, #ef4444 0%, #f97316 17%, #eab308 33%, #22c55e 50%, #06b6d4 67%, #3b82f6 83%, #8b5cf6 100%)";

// ===== ANIMATION COMPONENTS =====

const Counter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  fontSize?: number;
}> = ({ value, prefix = "", suffix = "", color = BRAND.white, fontSize = 140 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  return (
    <div
      style={{
        fontSize,
        fontWeight: 900,
        fontFamily,
        color,
        textShadow: `0 0 60px ${color}60`,
      }}
    >
      {prefix}{displayValue.toLocaleString('en-IN')}{suffix}
    </div>
  );
};

// ===== SCENES =====

// Opening: FOSS HACK 2026
const Scene_Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hold for first 20 frames for thumbnail
  const holdFrames = 20;

  const titleProgress = spring({
    frame: Math.max(0, frame - holdFrames),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const yearProgress = spring({
    frame: Math.max(0, frame - holdFrames - 10),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const subtitleProgress = spring({
    frame: Math.max(0, frame - holdFrames - 20),
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const glowPulse = interpolate(frame % 50, [0, 25, 50], [0.3, 0.8, 0.3]);

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
        {/* India's Largest */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily,
            color: BRAND.orange,
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: frame < holdFrames ? 1 : interpolate(subtitleProgress, [0, 1], [0, 1]),
          }}
        >
          India's Largest FOSS Hackathon
        </div>

        {/* FOSS HACK */}
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            fontFamily,
            color: BRAND.white,
            letterSpacing: -4,
            filter: `drop-shadow(0 0 ${40 * glowPulse}px ${BRAND.white}40)`,
          }}
        >
          FOSS HACK
        </div>

        {/* 2026 */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            fontFamily,
            background: RAINBOW_GRADIENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 0 ${50 * glowPulse}px ${BRAND.purple}50)`,
          }}
        >
          2026
        </div>

        {/* March | Hybrid */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            marginTop: 15,
            opacity: frame < holdFrames ? 1 : interpolate(subtitleProgress, [0, 1], [0, 1]),
          }}
        >
          MARCH 2026 | HYBRID
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 6th Edition - More dramatic
const Scene_Edition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numProgress = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const glowPulse = interpolate(frame % 30, [0, 15, 30], [0.5, 1, 0.5]);

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            fontFamily,
            color: BRAND.orange,
            opacity: interpolate(numProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(numProgress, [0, 1], [0, 1])}) rotate(${interpolate(numProgress, [0, 1], [-10, 0])}deg)`,
            textShadow: `0 0 ${100 * glowPulse}px ${BRAND.orange}`,
          }}
        >
          6th
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(numProgress, [0, 1], [0, 1]),
          }}
        >
          Edition
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Bigger Than Ever
const Scene_BiggerThanEver: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Bigger", "Than", "Ever"];
  const colors = [BRAND.pink, BRAND.purple, BRAND.cyan];

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 30 }}>
        {words.map((word, i) => {
          const progress = spring({
            frame: frame - i * 8,
            fps,
            config: { damping: 10, stiffness: 200 },
          });
          return (
            <span
              key={word}
              style={{
                fontSize: 120,
                fontWeight: 900,
                fontFamily,
                color: colors[i],
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(progress, [0, 1], [80, 0])}px) scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
                textShadow: `0 0 50px ${colors[i]}60`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// LIVE Registration Stats - Participants
const Scene_LiveParticipants: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 25, [0, 12, 25], [0.5, 1, 0.5]);

  const labelProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: BRAND.green,
              boxShadow: `0 0 ${20 * glowPulse}px ${BRAND.green}`,
            }}
          />
          <span style={{ fontSize: 24, fontWeight: 600, fontFamily, color: BRAND.green }}>
            REGISTRATIONS LIVE
          </span>
        </div>

        <Counter value={538} suffix="+" color={BRAND.cyan} fontSize={180} />

        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          Participants
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          and counting...
        </div>
      </div>
    </AbsoluteFill>
  );
};

// LIVE Registration Stats - Teams
const Scene_LiveTeams: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 25, [0, 12, 25], [0.5, 1, 0.5]);

  const labelProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Counter value={329} suffix="+" color={BRAND.purple} fontSize={180} />

        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          Teams Registered
        </div>
      </div>
    </AbsoluteFill>
  );
};

// LIVE Registration Stats - Projects
const Scene_LiveProjects: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Counter value={21} suffix="+" color={BRAND.orange} fontSize={180} />

        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          Projects Created
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          Already building!
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Prize Pool - Dramatic
const Scene_PrizePool: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowPulse = interpolate(frame % 30, [0, 15, 30], [0.4, 1, 0.4]);

  const labelProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          Win Up To
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              fontFamily,
              color: BRAND.yellow,
            }}
          >
            ₹
          </span>
          <Counter value={5} color={BRAND.yellow} fontSize={200} />
          <span
            style={{
              fontSize: 100,
              fontWeight: 900,
              fontFamily,
              color: BRAND.yellow,
              textShadow: `0 0 ${60 * glowPulse}px ${BRAND.yellow}`,
            }}
          >
            LAKH
          </span>
        </div>

        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            fontFamily,
            color: BRAND.yellow,
            letterSpacing: 6,
            textShadow: `0 0 ${30 * glowPulse}px ${BRAND.yellow}`,
            opacity: interpolate(labelProgress, [0, 1], [0, 1]),
          }}
        >
          PRIZE POOL
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 10 Local Hosts
const Scene_LocalHosts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numProgress = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            fontFamily,
            color: BRAND.green,
            opacity: interpolate(numProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(numProgress, [0, 1], [0, 1])})`,
            textShadow: `0 0 80px ${BRAND.green}60`,
          }}
        >
          10+
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
          }}
        >
          Local Host Venues
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
          }}
        >
          Across India
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Virtual or In-Person
const Scene_HybridMode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const option1Progress = spring({ frame, fps, config: { damping: 12 } });
  const option2Progress = spring({ frame: frame - 12, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 35 }}>
        <div style={{ fontSize: 36, fontWeight: 500, fontFamily, color: BRAND.gray }}>
          Hack Your Way
        </div>
        <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              fontFamily,
              color: BRAND.cyan,
              opacity: interpolate(option1Progress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(option1Progress, [0, 1], [-60, 0])}px)`,
              textShadow: `0 0 40px ${BRAND.cyan}50`,
            }}
          >
            Virtual
          </div>
          <div style={{ fontSize: 50, fontWeight: 500, fontFamily, color: BRAND.gray }}>
            or
          </div>
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              fontFamily,
              color: BRAND.purple,
              opacity: interpolate(option2Progress, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(option2Progress, [0, 1], [60, 0])}px)`,
              textShadow: `0 0 40px ${BRAND.purple}50`,
            }}
          >
            In-Person
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Month Long - Not a Sprint
const Scene_MonthLong: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Progress = spring({ frame, fps, config: { damping: 12 } });
  const line2Progress = spring({ frame: frame - 15, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            fontFamily,
            color: BRAND.cyan,
            opacity: interpolate(line1Progress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(line1Progress, [0, 1], [40, 0])}px)`,
            textShadow: `0 0 50px ${BRAND.cyan}50`,
          }}
        >
          Month-Long
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
            opacity: interpolate(line2Progress, [0, 1], [0, 1]),
          }}
        >
          Not a Sprint
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(line2Progress, [0, 1], [0, 1]),
          }}
        >
          Build Thoughtfully. Ship Meaningfully.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Team Size
const Scene_TeamSize: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numProgress = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            fontFamily,
            color: BRAND.pink,
            opacity: interpolate(numProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(numProgress, [0, 1], [0, 1])})`,
            textShadow: `0 0 80px ${BRAND.pink}60`,
          }}
        >
          1-4
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            fontFamily,
            color: BRAND.white,
          }}
        >
          Members per Team
        </div>
      </div>
    </AbsoluteFill>
  );
};

// What Can You Build
const Scene_WhatToBuild: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["What", "Will", "You", "Build?"];
  const colors = [BRAND.white, BRAND.orange, BRAND.yellow, BRAND.green];

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 25 }}>
        {words.map((word, i) => {
          const progress = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 10, stiffness: 200 },
          });
          return (
            <span
              key={word}
              style={{
                fontSize: 110,
                fontWeight: 800,
                fontFamily,
                color: colors[i],
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`,
                textShadow: `0 0 40px ${colors[i]}50`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Build Options - Animated List
const Scene_BuildOptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const options = [
    { text: "New FOSS Projects", color: BRAND.green },
    { text: "Contribute to Open Source", color: BRAND.cyan },
    { text: "Partner Project Challenges", color: BRAND.purple },
    { text: "Design & Documentation", color: BRAND.orange },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 35, alignItems: "center" }}>
        {options.map((option, i) => {
          const progress = spring({
            frame: frame - i * 12,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          return (
            <div
              key={option.text}
              style={{
                fontSize: 60,
                fontWeight: 700,
                fontFamily,
                color: option.color,
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(progress, [0, 1], [-100, 0])}px)`,
                textShadow: `0 0 35px ${option.color}50`,
              }}
            >
              {option.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Timeline
const Scene_Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const events = [
    { date: "Feb 20", event: "Registrations Open", color: BRAND.green },
    { date: "Mar 1-31", event: "Create. Contribute. Hack.", color: BRAND.cyan },
    { date: "Mar 31", event: "Final Submissions", color: BRAND.orange },
    { date: "May 4", event: "Results Announced", color: BRAND.yellow },
  ];

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {events.map((item, i) => {
          const progress = spring({
            frame: frame - i * 15,
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          return (
            <div
              key={item.date}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 35,
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(progress, [0, 1], [-80, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  fontFamily,
                  color: item.color,
                  minWidth: 200,
                  textAlign: "right",
                }}
              >
                {item.date}
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  boxShadow: `0 0 25px ${item.color}`,
                }}
              />
              <div style={{ fontSize: 40, fontWeight: 500, fontFamily, color: BRAND.white }}>
                {item.event}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// FOSS License Required
const Scene_FOSSLicense: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 12 } });
  const checkProgress = spring({ frame: frame - 20, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {["Valid", "FOSS", "License"].map((word, i) => {
            const wordProgress = spring({
              frame: frame - i * 6,
              fps,
              config: { damping: 12, stiffness: 200 },
            });
            return (
              <span
                key={word}
                style={{
                  fontSize: 100,
                  fontWeight: 800,
                  fontFamily,
                  color: word === "FOSS" ? BRAND.green : BRAND.white,
                  opacity: interpolate(wordProgress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(wordProgress, [0, 1], [40, 0])}px)`,
                  textShadow: word === "FOSS" ? `0 0 50px ${BRAND.green}60` : "none",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
            opacity: interpolate(checkProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(checkProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: BRAND.green,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 24,
              color: BRAND.black,
              fontWeight: 900,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: 32, fontWeight: 500, fontFamily, color: BRAND.gray }}>
            Required for all projects
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// No Blockchain - Dramatic
const Scene_NoBlockchain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 10, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 25 }}>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            fontFamily,
            color: BRAND.red,
            opacity: interpolate(progress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
            textShadow: `0 0 50px ${BRAND.red}60`,
          }}
        >
          No Blockchain
        </div>
        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            fontFamily,
            color: BRAND.white,
          }}
        >
          Real Problems. Real Solutions.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Create. Contribute. Hack.
const Scene_CreateContributeHack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["Create.", "Contribute.", "Hack."];
  const colors = [BRAND.green, BRAND.cyan, BRAND.orange];

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
        {words.map((word, i) => {
          const progress = spring({
            frame: frame - i * 15,
            fps,
            config: { damping: 8, stiffness: 150 },
          });
          const glowPulse = interpolate((frame - i * 15) % 40, [0, 20, 40], [0.4, 1, 0.4]);
          return (
            <div
              key={word}
              style={{
                fontSize: 110,
                fontWeight: 900,
                fontFamily,
                color: colors[i],
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `scale(${interpolate(progress, [0, 1], [0.3, 1])}) translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
                textShadow: `0 0 ${60 * glowPulse}px ${colors[i]}`,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Final CTA
const Scene_FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const urlProgress = spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 120 } });
  const buttonProgress = spring({ frame: frame - 40, fps, config: { damping: 12 } });

  const glowPulse = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);

  return (
    <AbsoluteFill style={{ background: BRAND.black, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 35 }}>
        {/* FOSS HACK 2026 */}
        <div
          style={{
            opacity: interpolate(logoProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(logoProgress, [0, 1], [0.5, 1])})`,
          }}
        >
          <span
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontFamily,
              color: BRAND.white,
              letterSpacing: -2,
            }}
          >
            FOSS HACK{" "}
          </span>
          <span
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontFamily,
              background: RAINBOW_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            2026
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            fontFamily,
            color: BRAND.cyan,
            opacity: interpolate(urlProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(urlProgress, [0, 1], [30, 0])}px)`,
            textShadow: `0 0 ${35 * glowPulse}px ${BRAND.cyan}`,
          }}
        >
          fossunited.org/fosshack/2026
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            fontFamily,
            color: BRAND.gray,
            opacity: interpolate(urlProgress, [0, 1], [0, 1]),
          }}
        >
          March 1-31, 2026 | Hybrid
        </div>

        {/* Register Button */}
        <div
          style={{
            marginTop: 15,
            padding: "22px 70px",
            borderRadius: 100,
            background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.yellow})`,
            fontSize: 36,
            fontWeight: 700,
            fontFamily,
            color: BRAND.black,
            boxShadow: `0 0 ${50 * glowPulse}px ${BRAND.orange}80`,
            opacity: interpolate(buttonProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(buttonProgress, [0, 1], [0.8, 1])})`,
          }}
        >
          Register Now
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ===== MAIN COMPOSITION =====

export const FOSSHackVideo: React.FC = () => {
  const fastTransition = 8;
  const mediumTransition = 10;

  return (
    <>
      {/* Background Music */}
      <Audio src={staticFile("openalgo/music.mp3")} volume={1} startFrom={30} />

      <TransitionSeries>
        {/* Logo - FOSS HACK 2026 */}
        <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
          <Scene_Logo />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: mediumTransition })}
        />

        {/* 6th Edition */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_Edition />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Bigger Than Ever */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_BiggerThanEver />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Live Participants */}
        <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
          <Scene_LiveParticipants />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Live Teams */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_LiveTeams />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Live Projects */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_LiveProjects />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Prize Pool */}
        <TransitionSeries.Sequence durationInFrames={SCENE_STATS}>
          <Scene_PrizePool />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* 10 Local Hosts */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_LocalHosts />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Virtual or In-Person */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_HybridMode />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Month Long */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_MonthLong />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Team Size */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_TeamSize />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* What Will You Build */}
        <TransitionSeries.Sequence durationInFrames={SCENE_SHORT}>
          <Scene_WhatToBuild />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Build Options */}
        <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
          <Scene_BuildOptions />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: mediumTransition })}
        />

        {/* Timeline */}
        <TransitionSeries.Sequence durationInFrames={SCENE_LONG + 20}>
          <Scene_Timeline />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* FOSS License */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_FOSSLicense />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* No Blockchain */}
        <TransitionSeries.Sequence durationInFrames={SCENE_MEDIUM}>
          <Scene_NoBlockchain />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fastTransition })}
        />

        {/* Create. Contribute. Hack. */}
        <TransitionSeries.Sequence durationInFrames={SCENE_LONG}>
          <Scene_CreateContributeHack />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: mediumTransition })}
        />

        {/* Final CTA - Hold for 5 seconds */}
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene_FinalCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};

export default FOSSHackVideo;
