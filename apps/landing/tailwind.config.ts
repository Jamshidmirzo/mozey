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
        canvas: '#F1EBDF',
        surface: '#FFFFFF',
        'surface-alt': '#FAF6EE',
        sand: '#E7E1D5',
        ink: '#1E1813',
        ink2: '#736A5C',
        ink3: '#A99F8E',
        primary: '#155E7A',
        'primary-ink': '#FFFFFF',
        gold: '#9C6F22',
        heart: '#B0452E',
        // region colors
        'r-samarkand': '#0E4D66',
        'r-samarkand-light': '#3E9DBC',
        'r-bukhara': '#0F5E58',
        'r-bukhara-light': '#2FA398',
        'r-khiva': '#7A4E1B',
        'r-khiva-light': '#C79A4E',
        'r-tashkent': '#2C3A47',
        'r-tashkent-light': '#6E8398',
        'r-nukus': '#7A3322',
        'r-nukus-light': '#C26A4C',
        // keep old colors for backward compat
        'museum-gold': {
          50: '#FBF6EC',
          100: '#F5E9CC',
          200: '#EDDA9E',
          300: '#E3C76E',
          400: '#D4A853',
          DEFAULT: '#D4A853',
        },
        'deep-blue': {
          DEFAULT: '#1B365D',
        },
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Newsreader', 'Georgia', '"Times New Roman"', 'serif'],
        ui: [
          '-apple-system',
          '"SF Pro Text"',
          'system-ui',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
        sans: ['-apple-system', '"SF Pro Text"', 'system-ui', '"Segoe UI"', 'sans-serif'],
        display: ['var(--font-newsreader)', 'Newsreader', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'sheet-up': 'sheetUp 420ms cubic-bezier(.2,.85,.2,1) forwards',
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
        sheetUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
