/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: "#0A1F44",
          secondary: "#E6F0FF",
          accent: "#00CFFF",
        },
      },
      boxShadow: {
        medical: "0 12px 30px rgba(10, 31, 68, 0.10)",
      },
    },
  },
  plugins: [],
}
