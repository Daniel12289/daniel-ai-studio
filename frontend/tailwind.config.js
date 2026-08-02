/**
 * Design tokens — "Build Console" direction.
 * A dark, precise, engineering-tool aesthetic (not a generic SaaS gradient
 * page): deep graphite surfaces, a molten-amber accent standing in for
 * "generation/build" state, a cool cyan for AI/status signals, and a
 * monospace voice borrowed from the terminal for anything system-generated.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0D12", 50: "#0B0D12", 100: "#12141C" },
        surface: { DEFAULT: "#161923", hi: "#1F2330", line: "#2A2F3E" },
        amber: { DEFAULT: "#FFB020", dim: "#B87E1A" },
        cyan: { DEFAULT: "#4FD1C5", dim: "#2E8B82" },
        ash: { 50: "#E7E9EE", 300: "#A9AEBC", 500: "#8B90A0", 700: "#565B6B" },
        danger: "#FF5D5D",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px #2A2F3E, 0 8px 30px -8px rgba(255,176,32,0.15)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        scan: { "0%": { backgroundPosition: "0% 0%" }, "100%": { backgroundPosition: "0% 100%" } },
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
