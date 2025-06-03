/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: "#FF6E42",
        accentLight: "#FCF3D4",
        bgPrimary: "#F0F0F0",
        textPrimary: "#121212",
        textSecondary: "#7D7D7D",
        

      },
    },
  },
  plugins: [],
}