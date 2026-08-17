/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marino: {
          DEFAULT: '#0b1b35',
          2: '#122040',
        },
        azul: {
          DEFAULT: '#3d5afe',
          mid: '#4f6ef7',
          light: '#6b8cff',
          pale: '#e8ecff',
        },
        crema: '#f2f0eb',
        texto: {
          DEFAULT: '#1a1a2e',
          muted: '#5a6070',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 40px rgba(11,27,53,.09)',
        lg: '0 20px 64px rgba(11,27,53,.16)',
        glow: '0 0 30px rgba(61,90,254,.25)',
      },
    },
  },
  plugins: [],
}
