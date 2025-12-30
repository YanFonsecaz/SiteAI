import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A39382", // Taupe/Grayish Brown
          hover: "#8d7f70", // Darker shade for hover
          light: "rgba(163, 147, 130, 0.65)",
          lighter: "rgba(163, 147, 130, 0.45)",
        },
        background: "#FBF7F4", // Light Beige/Off-white
        foreground: "#2D2A26", // Dark Charcoal for high contrast text
        muted: "#8C8C8C", // Gray for secondary text
        surface: "#FFFFFF", // White for cards/sections
      },
      fontFamily: {
        // Both sans and display now use Poppins for consistent look
        sans: ["var(--font-poppins)"],
        display: ["var(--font-poppins)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
