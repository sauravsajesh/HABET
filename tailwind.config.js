/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./www/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        accent: '#FF0033',
        dim: '#666666', // Increased brightness for visibility
      },
      fontFamily: {
        mono: ['"Space Mono"', '"Courier Prime"', 'monospace'],
        dot: ['"DotGothic16"', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
      }
    },
  },
  plugins: [],
}
