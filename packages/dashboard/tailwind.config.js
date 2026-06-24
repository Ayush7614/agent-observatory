/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          card: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.08)',
        },
        accent: {
          DEFAULT: '#6366f1',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
