/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./client/index.html', './client/main.js'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

