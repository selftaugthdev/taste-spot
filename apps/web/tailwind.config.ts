import type { Config } from "tailwindcss";

/**
 * Brand colors come from CSS variables set per-site in globals.css (see the
 * `:root` / `.dark` blocks, populated from sites/<id>/config.ts theme values).
 * Score colors are fixed design tokens, deliberately NOT derived from the
 * brand palette, so 🟩🟨🟧🟥 feedback reads the same on every site regardless
 * of brand hue.
 */
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity("--color-brand"),
          foreground: withOpacity("--color-brand-foreground"),
        },
        accent: withOpacity("--color-accent"),
        background: withOpacity("--color-background"),
        foreground: withOpacity("--color-foreground"),
        surface: withOpacity("--color-surface"),
        border: withOpacity("--color-border"),
        muted: withOpacity("--color-muted"),
        score: {
          great: withOpacity("--color-score-great"),
          good: withOpacity("--color-score-good"),
          ok: withOpacity("--color-score-ok"),
          poor: withOpacity("--color-score-poor"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
