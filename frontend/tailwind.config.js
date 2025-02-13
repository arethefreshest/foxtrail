/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #e879f9 0%, #d946ef 100%)',
        'surface-gradient': 'linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)',
      },
      animation: {
        'y2k-hover': 'y2k-hover 0.3s ease-in-out',
      },
      keyframes: {
        'y2k-hover': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
} 