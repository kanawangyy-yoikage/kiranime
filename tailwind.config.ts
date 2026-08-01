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
        midnight: '#0A0A0F',
        pearl: 'rgb(var(--pearl-rgb) / <alpha-value>)',
        noir: '#0A0A0F',
        ocean: '#E11D48',
        oceanAccent: {
          primary: '#E11D48',
          secondary: '#FB7185',
          light: '#FDA4AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: 'rgb(var(--surface-dark-rgb) / <alpha-value>)',
          card: 'rgb(var(--surface-card-rgb) / <alpha-value>)',
          hover: 'rgb(var(--surface-hover-rgb) / <alpha-value>)',
        },
        'bg-light': '#F6F6F7',
        'bg-dark': '#0A0A0F',
        'text-light': '#18181B',
        'text-dark': '#F4F4F5',
        primary: '#BE123C',
        accent: '#FB7185'
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
