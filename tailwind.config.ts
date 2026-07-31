import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#122C4F',
        pearl: 'rgb(var(--pearl-rgb) / <alpha-value>)',
        noir: '#0A0E16',
        ocean: '#5B88B2',
        oceanAccent: {
          primary: '#5B88B2',
          secondary: '#7BA3C9',
          light: '#A8C7FA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: 'rgb(var(--surface-dark-rgb) / <alpha-value>)',
          card: 'rgb(var(--surface-card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--surface-hover-rgb) / <alpha-value>)',
        },
        'bg-light': '#FBF9E4',
        'bg-dark': '#0A0E16',
        'text-light': '#122C4F',
        'text-dark': '#FBF9E4',
        primary: '#122C4F',
        accent: '#5B88B2'
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
