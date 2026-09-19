/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#fff5f7',
          100: '#ffe3eb',
          200: '#ffccd9',
          300: '#ffa2ba',
          400: '#fc6892',
          500: '#f43f75',
          600: '#e11d59',
          700: '#be1244',
          800: '#9e123c',
          900: '#851437',
        },
        caramel: {
          50: '#fdf8f4',
          100: '#f9eee5',
          200: '#f3dcce',
          300: '#eac4ae',
          400: '#dda285',
          500: '#cb7b55',
          600: '#bc6340',
          700: '#9c4d33',
          800: '#7f3f2d',
          900: '#683628',
        }
      },
      fontFamily: {
        sans: ['Kantumruy Pro', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
