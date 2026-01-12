// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'background': 'var(--background)',
        'text': 'var(--text)',
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'card-bg': 'var(--card-bg)',
        'border': 'var(--border)',
      },
      borderRadius: {
        'button': 'var(--button-border-radius, 0.5rem)',
      },
      boxShadow: {
        'button': 'var(--button-shadow, 0 1px 3px rgba(0, 0, 0, 0.1))',
      },
      backdropBlur: {
        'button-glass': 'var(--button-glass-backdrop, 8px)',
      },
    },
  },
  plugins: [],
}