import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        medlink: {
          navy: "#0a0f1e",
          blue: "#0d1b3e",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          electric: "#3b82f6"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(6, 182, 212, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
