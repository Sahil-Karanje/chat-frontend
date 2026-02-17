/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          0: '#0a0b0d',
          1: '#0f1114',
          2: '#141619',
          3: '#1a1d21',
          4: '#1f2329',
          5: '#252b33',
        },
        accent: {
          DEFAULT: '#22c55e',
          dim: '#16a34a',
          glow: 'rgba(34,197,94,0.15)',
        },
        muted: '#4b5563',
        border: '#1f2733',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-6px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        popIn: {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.22s ease-out forwards',
        pulse_soft: 'pulse_soft 1.4s ease-in-out infinite',
        slideIn: 'slideIn 0.2s ease-out forwards',
        popIn: 'popIn 0.18s ease-out forwards',
      },
    },
  },
  plugins: [],
}
