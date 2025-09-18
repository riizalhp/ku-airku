/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
          'brand-primary': '#0077B6', // A shade of blue
          'brand-secondary': '#00B4D8', // A lighter blue/cyan
          'brand-dark': '#03045E',    // A dark blue
          'brand-light': '#90E0EF',   // A very light blue
          'brand-background': '#F0F2F5', // A light grey for background
        }
      },
  },
  plugins: [],
}