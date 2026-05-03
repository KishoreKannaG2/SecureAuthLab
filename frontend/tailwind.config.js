/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:      '#080c14',
          panel:   '#0d1420',
          border:  '#1a2535',
          accent:  '#00d4ff',
          green:   '#00ff88',
          red:     '#ff3b6b',
          yellow:  '#ffd060',
          text:    '#a8bbd4',
          bright:  '#e2ecf8',
        },
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'scan':        'scan 2s linear infinite',
        'blink':       'blink 1s step-end infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0 },
        },
        glow: {
          from: { boxShadow: '0 0 5px #00d4ff44' },
          to:   { boxShadow: '0 0 20px #00d4ff88, 0 0 40px #00d4ff22' },
        },
      },
    },
  },
  plugins: [],
}
