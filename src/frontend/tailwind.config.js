/** @type {import('tailwindcss').Config} */
export default {
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        teal: {
          DEFAULT: "oklch(var(--color-teal) / <alpha-value>)",
          light: "oklch(var(--color-teal-light) / <alpha-value>)",
          dark: "oklch(var(--color-teal-dark) / <alpha-value>)",
        },
        navy: "oklch(var(--color-navy) / <alpha-value>)",
        wonderpurple: "oklch(var(--color-wonderpurple) / <alpha-value>)",
        wonderyellow: "oklch(var(--color-wonderyellow) / <alpha-value>)",
        wondergreen: "oklch(var(--color-wondergreen) / <alpha-value>)",
        wonderblue: "oklch(var(--color-wonderblue) / <alpha-value>)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "3rem",
      },
      boxShadow: {
        wonder: "0 10px 40px 0 oklch(0.5 0.1 200 / 0.18)",
        card: "0 8px 32px 0 oklch(0.3 0.05 240 / 0.14)",
        glow: "0 0 24px 4px oklch(0.72 0.14 192 / 0.35)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-8deg) scale(1.1)" },
          "50%": { transform: "rotate(8deg) scale(1.25)" },
        },
        bounce_in: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "80%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 12px 2px oklch(0.72 0.14 192 / 0.4)" },
          "50%": { boxShadow: "0 0 28px 8px oklch(0.72 0.14 192 / 0.65)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.6s ease-in-out",
        bounce_in: "bounce_in 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
