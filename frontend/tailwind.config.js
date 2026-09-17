/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          50: '#f0f7fa',
          100: '#e0f0f5',
          200: '#b8dfeb',
          300: '#7bc3db',
          400: '#3ba3c7',
          500: '#0f4c75', // Deep Ocean Blue (Primary)
          600: '#0d3f62',
          700: '#0a324f',
          800: '#08253c',
          900: '#051829',
        },
        accent: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'wave-slow': 'waveSlow 12s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'satellite-orbit': 'satelliteOrbit 15s linear infinite',
        'beam-sweep': 'beamSweep 6s ease-in-out infinite alternate',
        'radar-pulse': 'radarPulse 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        waveSlow: {
          '0%, 100%': { transform: 'translateY(0px) scaleY(1)' },
          '50%': { transform: 'translateY(4px) scaleY(1.05)' },
        },
        satelliteOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        beamSweep: {
          '0%': { transform: 'rotate(-15deg)', opacity: 0.15 },
          '100%': { transform: 'rotate(15deg)', opacity: 0.4 },
        },
        radarPulse: {
          '0%': { transform: 'scale(0.8)', opacity: 0.5 },
          '100%': { transform: 'scale(2.2)', opacity: 0 },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
