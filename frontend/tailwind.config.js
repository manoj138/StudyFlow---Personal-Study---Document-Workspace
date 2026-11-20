/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          canvas: "#08090C",
          card: "#0E1015",
          elevated: "#141720",
          active: "#1C202C",
          hover: "rgba(255, 255, 255, 0.04)"
        },
        dark: {
          canvas: "#08090C",
          surface: "#0E1015",
          elevated: "#141720",
          active: "#1C202C",
          border: "rgba(255, 255, 255, 0.08)",
          specular: "rgba(255, 255, 255, 0.12)"
        },
        brand: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          emerald: "#10B981",
          teal: "#10B981",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"]
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.015em"
      },
      boxShadow: {
        specular: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 4px 16px -2px rgba(0, 0, 0, 0.6)",
        "specular-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 0 24px -4px rgba(99, 102, 241, 0.15)",
        "kbd-bevel": "0 1px 0 1px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
      }
    },
  },
  plugins: [],
}
