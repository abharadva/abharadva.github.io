module.exports = {
  plugins: {
    'postcss-nesting': {},   // 👈 Add this line before tailwindcss
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
