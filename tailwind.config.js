/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./client/index.html', './client/main.js'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['autumn']
  },
  plugins: [require("daisyui")],
}

