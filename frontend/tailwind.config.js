/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1417",
        stone: "#f4f1ea",
        spice: "#c46b3c",
        moss: "#2e5f4f",
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
        body: ["\"Work Sans\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        haze: "0 20px 60px -25px rgba(15, 20, 23, 0.55)",
      },
    },
  },
  plugins: [],
};
