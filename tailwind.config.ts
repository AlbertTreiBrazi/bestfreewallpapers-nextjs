import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#111827',
        'dark-secondary': '#1f2937',
        'dark-tertiary': '#374151',
        'dark-border': '#374151',
        primary: {
          DEFAULT: '#2B5D3A',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#4A90E2',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}

export default config
