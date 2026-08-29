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
        midnight: '#000000',
        pearl: 'rgb(var(--pearl-rgb) / <alpha-value>)',
        noir: '#000000',
        ocean: 'rgb(var(--primary-rgb) / <alpha-value>)',
        oceanAccent: {
          primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--accent-rgb) / <alpha-value>)',
          light: 'rgb(var(--primary-rgb) / <alpha-value>)',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: 'rgb(var(--surface-dark-rgb) / <alpha-value>)',
          card: 'rgb(var(--surface-card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--surface-hover-rgb) / <alpha-value>)',
        },
        'bg-light': '#F5F5F7',
        'bg-dark': '#000000',
        'text-light': '#1D1D1F',
        'text-dark': '#F5F5F7',
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-noto-jp)', 'var(--font-jakarta)', 'system-ui', 'sans-serif'],
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
