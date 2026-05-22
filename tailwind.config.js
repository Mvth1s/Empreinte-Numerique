/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#0a0a0f',
        'bg-2': '#111118',
        card:   '#0f0f17',
        'card-2': '#14141d',
        line:   '#1f1f2b',
        'line-2': '#2a2a38',
        fg:     '#f0f0f0',
        mute:   '#6d6d80',
        'mute-2': '#9a9aae',
        cyan:   { DEFAULT: '#00e5ff', dim: 'rgba(0,229,255,0.08)' },
        alert:  { DEFAULT: '#ff3b30', dim: 'rgba(255,59,48,0.10)' },
        yellow: '#ffd60a',
        green:  '#2ecc71',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        scan: 'scan 2.4s linear infinite',
        'pulse-glow': 'pulseGlow 2.2s ease-in-out infinite',
        blink: 'blink 1.6s ease-in-out infinite',
        'caret': 'caretBlink 1s steps(1) infinite',
      },
      keyframes: {
        scan: { '0%': { top: '-4px' }, '100%': { top: '100%' } },
        pulseGlow: {
          '0%,100%': { filter: 'drop-shadow(0 0 3px rgba(0,229,255,0.3))' },
          '50%':      { filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.9))' },
        },
        blink: { '50%': { opacity: '.25' } },
        caretBlink: { '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
}
