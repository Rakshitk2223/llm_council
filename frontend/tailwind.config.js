/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", "[data-theme=\"dark\"]"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-light": "var(--color-primary-light)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "surface-glass": "var(--color-surface-glass)",
        text: "var(--color-text-primary)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        "border-light": "var(--color-border-light)",
        alpha: "var(--color-alpha)",
        beta: "var(--color-beta)",
        gamma: "var(--color-gamma)",
        senator: "var(--color-senator)",
        "glow-alpha": "var(--color-glow-alpha)",
        "glow-beta": "var(--color-glow-beta)",
        "glow-gamma": "var(--color-glow-gamma)",
        "glow-senator": "var(--color-glow-senator)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        glass: "var(--shadow-glass)",
        "glow-alpha": "0 0 20px var(--color-glow-alpha)",
        "glow-beta": "0 0 20px var(--color-glow-beta)",
        "glow-gamma": "0 0 20px var(--color-glow-gamma)",
        "glow-senator": "0 0 30px var(--color-glow-senator)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      width: {
        sidebar: "var(--sidebar-width)",
      },
      height: {
        input: "var(--input-height)",
      },
      backdropBlur: {
        glass: "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
