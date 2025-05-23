import { addDynamicIconSelectors } from '@iconify/tailwind';

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
      screens: {
        semiMd: "850px",
        Base: "720px",
        semiBase: "610px",
        semiSm: "510px",
        xs: "400px",
        xxs: "300px",
      },
      keyframes: {
        'teams-curtain': {
          '0%': { opacity: 0, transform: 'translateY(-20%) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'teams-curtain': 'teams-curtain 0.35s ease-out forwards',
      },
    },
  },
  plugins: [
    addDynamicIconSelectors(),
  ],
};
