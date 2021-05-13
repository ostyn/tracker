module.exports = {
  mode: "jit",
  // These paths are just examples, customize them to match your project structure
  purge: ["./dist/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue,html,css}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("nightwind")],
};
