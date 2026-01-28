/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'truth-green': '#10b981',
        'warning-yellow': '#f59e0b',
        'false-red': '#ef4444',
        'gray-750': '#2d3748',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
