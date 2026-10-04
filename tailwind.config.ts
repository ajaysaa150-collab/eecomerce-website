import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        cream: "#F5F5F0",
        foreground: "#1A1A1A",
        secondary: "#6B6B6B",
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
        },
        destructive: "#DC2626",
        success: "#16A34A",
        card: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        elevated: "0 4px 16px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.05)",
        floating: "0 12px 40px rgba(0,0,0,0.1)",
      },
      maxWidth: {
        container: "1440px",
      },
      letterSpacing: {
        label: "0.1em",
      },
      lineHeight: {
        heading: "1.2",
        body: "1.6",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "pulse-slow": "pulseSlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
