/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'border-red-500',
    'border-orange-500',
    'border-amber-500',
    'border-yellow-400',
    'border-lime-500',
    'border-green-500',
    'border-emerald-500',
    'border-teal-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}