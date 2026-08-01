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
        midnight: '#09090B',
        pearl: 'rgb(var(--pearl-rgb) / <alpha-value>)',
        noir: '#09090B',
        ocean: '#DC2626',
        oceanAccent: {
          primary: '#DC2626',
          secondary: '#F87171',
          light: '#FCA5A5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: 'rgb(var(--surface-dark-rgb) / <alpha-value>)',
          card: 'rgb(var(--surface-card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--surface-hover-rgb) / <alpha-value>)',
        },
        'bg-light': '#E4E4E7',
        'bg-dark': '#09090B',
        'text-light': '#27272A',
        'text-dark': '#FAFAFA',
        primary: '#DC2626',
        accent: '#F87171'
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
