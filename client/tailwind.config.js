/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
  fontFamily: {
    open_sans: ['Open Sans', 'sans-serif'],
    playfair: ['Playfair Display', 'serif'],
    lato: ['Lato', 'sans-serif'],
    montserrat: ['Montserrat', 'sans-serif'],
    ubuntu: ['Ubuntu', 'sans-serif'],
  },
  animation: {
    wave: 'waveAnim 1s infinite ease-in-out',
    ripple: 'ripple 1.5s infinite ease-out',
  },
  keyframes: {
    waveAnim: {
      '0%, 100%': { height: '0.5rem' },
      '50%': { height: '1.5rem' },
    },
    ripple: {
      '0%': {
        transform: 'scale(0.9)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(1.6)',
        opacity: 0,
      },
    },
  },
}

  },
  plugins: [],
};
