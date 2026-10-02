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
          bg: "#0B0F17",
          card: "#131926",
          hover: "#1C2536",
          border: "rgba(255, 255, 255, 0.08)"
        },
        brand: {
          primary: "#6366F1", // Indigo
          accent: "#8B5CF6",  // Violet
          teal: "#10B981"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Lora", "serif"]
      }
    },
  },
  plugins: [],
}
