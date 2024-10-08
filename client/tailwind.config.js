const { addDynamicIconSelectors } = require('@iconify/tailwind');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme_light': '#b7e4c7',
        'theme_semilight': '#95d5b2',
        'theme_normal': '#74c69d',
        'theme_semidark': '#40916c',
        'theme_dark': '#2d6a4f',
        'theme_ultradark': '#1b4332',
      },
      
    },
    screens: {
      'xs': '400px',
    },
  },
  plugins: [
    addDynamicIconSelectors(),
  ],
}