/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-teal': '#00D4AA',
        'terminal-bg': '#001a0f',
        'terminal-border': '#003d2b',
      },
      fontFamily: {
        'terminal': ['"MS UI Gothic"', 'monospace'],
      },
      spacing: {
        '7.5': '1.875rem',
        '15': '3.75rem',
        '25': '6.25rem',
        '30': '7.5rem',
        '70': '17.5rem',
        '95': '23.75rem',
      },
      height: {
        '25': '6.25rem',
      },
      width: {
        '30': '7.5rem',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'noise': 'noise 0.05s infinite linear',
        'scanlines': 'scanlines 0.1s linear infinite',
      },
      keyframes: {
        noise: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-10%, 5%)' },
          '30%': { transform: 'translate(5%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-10%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(-15%, 10%)' },
          '90%': { transform: 'translate(10%, 5%)' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 4px' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
        'rotate': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'counter-rotate': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(-180deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}