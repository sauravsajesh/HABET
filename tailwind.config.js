/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./www/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        accent: '#FF0033',
        dim: '#333333',
      },
      fontFamily: {
        mono: ['"Courier Prime"', '"DM Mono"', '"Space Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
      }
    },
  },
  plugins: [],
}
