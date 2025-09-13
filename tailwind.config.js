/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
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
      // Animations defined in CSS for consistency; Tailwind keys removed
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}