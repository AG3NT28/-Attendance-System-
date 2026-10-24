/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        righteous: ['Righteous', 'cursive', 'sans-serif'],
      },
      colors: {
        retro: {
          pink: '#ff3366',
          yellow: '#fbbf24',
          amber: '#f59e0b',
          purple: '#a855f7',
          cyan: '#06b6d4',
          lime: '#22c55e',
          dark: '#0c0c10',
          card: '#14141c',
          panel: '#1b1b26',
          border: '#2a2a3a',
        },
        carbon: {
          950: '#070709',
          900: '#0e0e13',
          850: '#14141c',
          800: '#1f1f2a',
          700: '#2d2d3d',
          600: '#4a4a5e',
          500: '#717188',
        },
        signal: {
          amber: '#fbbf24',
          orange: '#ff5a1f',
          citron: '#eab308',
          emerald: '#22c55e',
          crimson: '#ef4444',
          sky: '#38bdf8',
        },
        brand: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      boxShadow: {
        'brutal': '3px 3px 0px 0px #000000',
        'brutal-lg': '5px 5px 0px 0px #000000',
        'brutal-amber': '4px 4px 0px 0px #fbbf24',
        'brutal-pink': '4px 4px 0px 0px #ff3366',
        'brutal-purple': '4px 4px 0px 0px #a855f7',
      },
      backgroundImage: {
        'dot-matrix': 'radial-gradient(circle, #252536 1px, transparent 1px)',
        'checker-dark': 'repeating-conic-gradient(#111118 0% 25%, #181822 0% 50%)',
      },
      backgroundSize: {
        'dots-sm': '16px 16px',
        'checker-sm': '20px 20px',
      }
    },
  },
  plugins: [],
}
