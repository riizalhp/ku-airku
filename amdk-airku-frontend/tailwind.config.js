/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#0077B6',
        'brand-secondary': '#00B4D8',
        'brand-light': '#ADE8F4',
        'brand-background': '#F0F8FF',
        'brand-dark': '#03045E',
        'status-pending': '#FBBF24',
        'status-delivered': '#34D399',
        'status-failed': '#F87171',
      },
    },
  },
  plugins: [],
}