import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flora: {
          cream: "var(--flora-cream)",
          ivory: "var(--flora-ivory-card)",
          blue: "var(--flora-dusty-blue)",
          slate: "var(--flora-slate-blue-deep)",
          navy: "var(--flora-navy)",
          blush: "var(--flora-blush)",
          rose: "var(--flora-rose-dust)",
          terracotta: "var(--flora-terracotta)",
          gold: "var(--flora-gold)",
          espresso: "var(--flora-espresso)",
          charcoal: "var(--flora-charcoal-text)",
          grey: "var(--flora-warm-grey)",
          line: "var(--flora-line)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(43, 32, 22, 0.10)",
        lift: "0 24px 70px rgba(27, 42, 63, 0.18)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
