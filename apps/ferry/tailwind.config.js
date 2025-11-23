const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { blackA, mauve, violet } = require('@radix-ui/colors');
const { join } = require('path');

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
      },
    },
  },
  plugins: [],
};
