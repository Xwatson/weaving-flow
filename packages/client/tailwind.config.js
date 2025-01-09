/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  // 与 antd 一起使用时，建议禁用 preflight
  corePlugins: {
    preflight: false,
  }
}
