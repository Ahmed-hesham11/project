/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "rgba(79, 70, 229, 0.1)",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          hover: "#0891B2",
          light: "rgba(6, 182, 212, 0.1)",
        },
        accent: {
          DEFAULT: "#22C55E",
          light: "rgba(34, 197, 94, 0.1)",
        },
      },
      fontFamily: {
        primary: ["Cairo", "Tajawal", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
        display: ["Tajawal", "sans-serif"],
      },
      maxWidth: {
        container: "1440px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "card-hover": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      },
      backdropBlur: {
        md: "12px",
      },
    },
  },
  plugins: [],
};
