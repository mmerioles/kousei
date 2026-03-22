/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f7fb",
        ink: "#1f2937",
        accent: "#1f75cb",
        line: "#d5d9e3",
        panel: "#ffffff"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      boxShadow: {
        panel: "0 10px 24px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: [],
};
