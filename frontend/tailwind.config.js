/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5A0F4D',
          dark: '#3D0A33',
          light: '#7B2D6B',
        },
        accent: '#D4AF37',
        dark: {
          bg: '#1A1A2E',
          card: '#16213E',
          border: '#0F3460',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Space Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
