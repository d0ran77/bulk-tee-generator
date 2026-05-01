/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#e8e7e7',
        accent: '#f28d35',
        dark: '#1a1a1a',
        white: '#ffffff'
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #1a1a1a',
        'brutal-lg': '6px 6px 0px 0px #1a1a1a',
        'brutal-active': '1px 1px 0px 0px #1a1a1a',
      }
    },
  },
  plugins: [],
}