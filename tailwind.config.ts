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
        // Fixed brand swatches (same in both light & dark — the 4 quadrants of the palette)
        midnight: '#122C4F',
        noir: '#000000',
        ocean: '#5B88B2',
        oceanAccent: {
          primary: '#5B88B2',
          secondary: '#7BA3C9',
          light: '#A8C7FA',
        },
        'accent-secondary': '#7BA3C9',
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#122C4F',
          card: '#1a3a5c',
          hover: '#234b73',
        },
        'bg-light': '#FBF9E4',
        'bg-dark': '#000000',
        'text-light': '#122C4F',
        'text-dark': '#FBF9E4',
        // Adaptive tokens — resolve through CSS variables so they automatically
        // flip between Midnight(light)/Ocean(dark) etc. without needing dark: prefixes.
        // Support opacity modifiers (e.g. bg-primary/10) via the rgb()/<alpha-value> pattern.
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        // "pearl" is used across the app as the main on-surface text color; make it
        // adaptive (Midnight text in light mode, Pearl-cream text in dark mode) so it
        // always stays readable on the adaptive card/surface background.
        pearl: 'rgb(var(--text-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Lora', 'Georgia', 'serif'],
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
