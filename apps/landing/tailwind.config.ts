import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'museum-gold': {
          50: '#FBF6EC',
          100: '#F5E9CC',
          200: '#EDDA9E',
          300: '#E3C76E',
          400: '#D4A853',
          500: '#C49230',
          600: '#A57625',
          700: '#7D591C',
          800: '#563D14',
          900: '#33240C',
          DEFAULT: '#D4A853',
        },
        'deep-blue': {
          50: '#E8ECF2',
          100: '#C5CDD9',
          200: '#9AABC0',
          300: '#6E89A7',
          400: '#496E93',
          500: '#2B5380',
          600: '#1B365D',
          700: '#152B4B',
          800: '#0F1F36',
          900: '#091322',
          DEFAULT: '#1B365D',
        },
        'warm-white': {
          DEFAULT: '#FFF8F0',
          50: '#FFFDFB',
          100: '#FFF8F0',
          200: '#FFF0DE',
          300: '#FFE5C4',
        },
        'terracotta': {
          DEFAULT: '#C45A3C',
          light: '#E07A5F',
          dark: '#9E3A22',
        },
        'silk-green': {
          DEFAULT: '#2D6A4F',
          light: '#40916C',
          dark: '#1B4332',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'islamic-pattern': "url('/patterns/islamic-geo.svg')",
        'hero-gradient':
          'linear-gradient(135deg, #1B365D 0%, #2B5380 40%, #496E93 100%)',
        'gold-gradient':
          'linear-gradient(135deg, #D4A853 0%, #E3C76E 50%, #D4A853 100%)',
        'warm-gradient':
          'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;
