/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          50: "#f7f9f8",
          100: "#eaf0ec",
          200: "#cddcd3",
          300: "#a6c2b2",
          400: "#6f9b83",
          500: "#467c60",
          600: "#386350",
          700: "#2c4f40",
          800: "#203b30",
          900: "#152b23",
        },
        accent: {
          blue: "#005f73",
          orange: "#ee9b00",
          gray: "#64748b",
        },
        "green-institutional": "#1f4d30", // cor institucional do IDAM
      },
      fontFamily: {
        sans: ['Montserrat', 'Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
