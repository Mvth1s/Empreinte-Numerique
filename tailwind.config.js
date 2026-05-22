/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#0f0f1a',
        's2': '#141428',
        border: '#1a1a2e',
        cyan: { DEFAULT: '#00e5ff', dim: 'rgba(0,229,255,0.12)' },
        alert: { DEFAULT: '#ff3b30', dim: 'rgba(255,59,48,0.12)' },
        'text-p': '#dde0f0',
        'text-s': '#6b6b90',
      },
      fontFamily: {
        mono: ['"Space Mono"', '"IBM Plex Mono"', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        scan: 'scan 2.4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        scan: {
          '0%': { top: '-4px' },
          '100%': { top: '100%' },
        },
        pulseGlow: {
          '0%,100%': { filter: 'drop-shadow(0 0 3px rgba(0,229,255,0.3))' },
          '50%': { filter: 'drop-shadow(0 0 14px rgba(0,229,255,0.9))' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
