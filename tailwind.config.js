/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red/Black theme
        'blood-red': '#8B0000',
        'crimson': '#DC143C',
        'fire-red': '#FF0000',
        'dark-red': '#CC0000',
        'pitch-black': '#000000',
        'charcoal': '#1a1a1a',
        'slate': '#333333',
        'dim-gray': '#666666',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-in',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-red': 'linear-gradient(135deg, #FF0000 0%, #8B0000 100%)',
      },
    },
  },
  plugins: [],
}
