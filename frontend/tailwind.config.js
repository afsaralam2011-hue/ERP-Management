/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'theme-background': 'var(--background-color)',
        'theme-text': 'var(--text-color)',
        'theme-primary': 'var(--primary-color)',
        'theme-secondary': 'var(--secondary-color)',
        'theme-card': 'var(--card-bg)',
        'theme-border': 'var(--border-color)',
      },
    },
  },
  plugins: [],
}