const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { blackA, mauve, violet } = require('@radix-ui/colors');
const { join } = require('path');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ...createGlobPatternsForDependencies(__dirname),
    join(__dirname, '../../libs/ui/src/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        ...blackA,
        ...mauve,
        ...violet,
        'island-direct': {
          DEFAULT: 'rgb(223, 99, 58)',
          light: 'rgb(223, 99, 58)',
          dark: 'rgb(200, 85, 45)',
        },
        'fullers': {
          DEFAULT: 'rgb(0, 150, 144)',
          light: 'rgb(0, 150, 144)',
          dark: 'rgb(0, 130, 124)',
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('vision-impaired', '.vision-impaired &');
    }),
  ],
};
