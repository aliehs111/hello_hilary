/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // ← this line is required!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
