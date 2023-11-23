/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./client/index.html', './client/main.js', './client/test.html'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['autumn']
  },
  plugins: [require("daisyui")],
}

