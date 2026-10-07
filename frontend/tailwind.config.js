/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1128',
          800: '#101d42',
          700: '#1c2d5a',
          600: '#283d70',
        },
        primary: {
          DEFAULT: '#1d4ed8', // Royal Blue
          dark: '#1e40af',
          light: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}
