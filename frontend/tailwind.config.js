/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ef8624", // اللون البرتقالي المستخدم
        "background-light": "#fcfaf8",
        "card-bg": "#f3ede7",
        "text-dark": "#1c140d",
        "accent-brown": "#9b714b"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem"
      }
    }
  },
  plugins: []
}
