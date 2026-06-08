/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2c334d",
        muted: "#747b91",
        line: "#e2e6f0",
        brand: "#f27f6f",
        action: "#6269d9",
        "action-hover": "#5259c7",
        "action-soft": "#f0f1ff",
        bridge: "#6269d9",
        warning: "#b77936",
        danger: "#c65362",
        success: "#47966f",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(73, 82, 125, 0.09)",
        input: "0 0 0 4px rgba(98, 105, 217, 0.1), 0 12px 28px rgba(73, 82, 125, 0.07)",
        button: "0 12px 26px rgba(98, 105, 217, 0.25)",
        workflow: "0 20px 50px rgba(73, 82, 125, 0.12)",
        card: "0 16px 38px rgba(98, 105, 217, 0.12)",
      },
    },
  },
  plugins: [],
};
