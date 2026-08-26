/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Okra-Regular"],
        regular: ["Okra-Regular"],
        medium: ["Okra-Medium"],
        bold: ["Okra-Bold"],
      },
      colors: {
        primary: "#FF6B00",
        background: "#FFF6F6",
        card: "#1E293B",
        text: "#E2E8F0",
        border: "#334155",
      }
    },
  },
  plugins: [],
}