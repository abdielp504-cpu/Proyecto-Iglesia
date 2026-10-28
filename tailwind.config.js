/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        indigo: {
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(30, 41, 59, 0.08)',
      },
    },
  },
  plugins: [],
}
