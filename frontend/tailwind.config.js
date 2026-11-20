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
        dark: {
          canvas: "#080C14",
          surface: "#0E1526",
          elevated: "#151E34",
          hover: "#1C2744",
          border: "rgba(255, 255, 255, 0.08)"
        },
        brand: {
          indigo: "#6366F1",
          teal: "#10B981",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"]
      }
    },
  },
  plugins: [],
}
