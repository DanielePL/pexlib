/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5500',
          dark: '#CC4400',
          light: '#FF7733'
        },
        secondary: {
          DEFAULT: '#6B46C1',
          dark: '#553C9A',
          light: '#9F7AEA'
        },
        dark: {
          DEFAULT: '#111827',
          darker: '#0F172A',
          lighter: '#1F2937'
        }
      }
    },
  },
  plugins: [],
}