/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        athena: {
          50: '#fdf4f7',
          100: '#fbe8f0',
          200: '#f7d3e3',
          300: '#f1b1cd',
          400: '#e782af',
          500: '#da5b90',
          600: '#c53c73',
          700: '#a52c5a',
          800: '#89274c',
          900: '#732442',
          950: '#430f23',
        },
        midnight: {
          800: '#16192b',
          900: '#0f111e',
          950: '#080911',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
