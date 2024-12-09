/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spectralify': {
          'coral': '#F96E46',    // Main action color
          'cyan': '#00E5FF',     // Footer background
          'yellow': '#F9C846',   // Secondary sections
          'pink': '#FFE3E3',     // Primary sections
          'gray': '#1A1A1A',
        },
      },
      fontSize: {
        'title': ['36px', {
          lineHeight: '1.2',
          fontWeight: '700',
        }],
        'body': ['15px', {
          lineHeight: '1.6',
          fontWeight: '400',
        }],
        'display': ['96px', {
          lineHeight: '1.1',
          fontWeight: '700',
        }],
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'button': '-8px 8px 0 rgb(0,0,0)',
        'nav': '-35px 0 0 rgb(0,0,0)',
        'content': '-8px 8px 0 rgb(0,0,0)',
      },
      borderRadius: {
        'content': '12px',
      },
      animation: {
        'hover': 'hover 0.2s ease-in-out',
      },
      keyframes: {
        hover: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}