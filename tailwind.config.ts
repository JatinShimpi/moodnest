import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0C0E",
        "bg-elevated": "#111216",
        panel: "#17181C",
        "panel-hover": "#1D1E23",
        border: {
          DEFAULT: "#262832",
          subtle: "#1E1F25",
        },
        text: {
          DEFAULT: "#E6E6E9",
          muted: "#8A8D96",
          faint: "#5B5E68",
        },
        accent: {
          DEFAULT: "#6E56CF",
          hover: "#7C64E0",
        },
        danger: "#E5484D",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
} satisfies Config;
