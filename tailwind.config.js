/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "background-main": "var(--color-background-main)",
        "text-main": "var(--color-text-main)",
        "text-muted": "var(--color-text-muted)",
        "header-bg": "var(--color-header-bg)",
        "title-text": "var(--color-text-title)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
