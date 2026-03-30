/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        wc: {
          purple: '#7C3AED',
          blue: '#0EA5E9',
          green: '#10B981',
          dark: '#0F172A',
          light: '#F8FAFC',
        }
      },
      backgroundImage: {
        'wc-gradient': 'linear-gradient(to right, #7C3AED, #0EA5E9, #10B981)',
        'wc-gradient-hover': 'linear-gradient(to right, #6D28D9, #0284C7, #059669)',
      }
    },
  },
  plugins: [],
}
