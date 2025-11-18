/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        cloud: '#f8fafc',
        panel: '#ffffff',
        line: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
