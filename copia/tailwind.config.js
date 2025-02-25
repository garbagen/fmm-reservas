/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color (rich burgundy)
        'primary': {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f5cdd3',
          300: '#efa9b3',
          400: '#e77a8a',
          500: '#db5468',
          600: '#c73651',
          700: '#a62844',
          800: '#89233c',
          900: '#732137',
        },
        // Secondary color (warm gold)
        'secondary': {
          50: '#fdfbe9',
          100: '#fbf6c7',
          200: '#f7eb91',
          300: '#f2d85b',
          400: '#ecc233',
          500: '#dba31a',
          600: '#bd7d12',
          700: '#9a5913',
          800: '#804516',
          900: '#6c3a17',
        },
        // Neutral color (sophisticated gray)
        'neutral': {
          50: '#f8f9f9',
          100: '#f2f3f4',
          200: '#e5e7e8',
          300: '#cfd3d6',
          400: '#97a0a5',
          500: '#708088',
          600: '#57666f',
          700: '#48555c',
          800: '#3e484e',
          900: '#363e43',
        },
      },
    },
  },
  plugins: [],
}