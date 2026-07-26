/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#f7f6f5',
          100: '#eeebe8',
          200: '#ddd7d2',
          300: '#c6bdb5',
          400: '#aaa096',
          500: '#93877d',
          600: '#7b6f65',
          700: '#665b53',
          800: '#564c46',
          900: '#463f3a',
          950: '#26211e',
        },
        primary: {
          50: '#fcf4f2',
          100: '#f8e5e1',
          200: '#f1ccc4',
          300: '#e8a99d',
          400: '#dd7c69',
          500: '#d95c41',
          600: '#b94229',
          700: '#9a331f',
          800: '#802d1d',
          900: '#6b281b',
          950: '#39110b',
        },
        teal: {
          50: '#f4f6f3',
          100: '#e6eae4',
          200: '#cfd8cb',
          300: '#aebda8',
          400: '#84937c',
          500: '#6f7f67',
          600: '#566450',
          700: '#465141',
          800: '#3a4336',
          900: '#31382e',
          950: '#191e17',
        }
      }
    },
  },
  plugins: [],
}
