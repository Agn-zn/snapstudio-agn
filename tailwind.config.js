/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDFAF6',
        blush: {
          50: '#FFF0F3',
          100: '#FFD6DE',
          200: '#FFB3C1',
          300: '#FF85A1',
          400: '#FF5C8D',
          500: '#FF3366',
        },
        lavender: {
          50: '#F5F0FF',
          100: '#EDE0FF',
          200: '#D5B8FF',
          300: '#B894FF',
          400: '#9B6DFF',
          500: '#7C4DFF',
        },
        sage: {
          50: '#F0F7F4',
          100: '#D4EAE1',
          200: '#A8D4C2',
          300: '#7BBFA4',
          400: '#4EA986',
          500: '#2D9368',
        },
        sand: {
          50: '#FDFAF5',
          100: '#F9F0DC',
          200: '#F0DDB4',
          300: '#E6C98C',
          400: '#D9B264',
          500: '#C89A3C',
        },
        charcoal: {
          800: '#2C2C2C',
          900: '#1A1A1A',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        fun: ['Pacifico', 'cursive'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out infinite 1s',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.97)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(0,0,0,0.06)',
        'medium': '0 8px 40px rgba(0,0,0,0.12)',
        'strong': '0 16px 60px rgba(0,0,0,0.18)',
        'glow-pink': '0 0 30px rgba(255,133,161,0.4)',
        'glow-lavender': '0 0 30px rgba(184,148,255,0.4)',
        'inner-soft': 'inset 0 2px 10px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
