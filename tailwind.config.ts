import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        leaf: "#2f6b4f",
        milk: "#f8f4ed",
        tea: "#b66a3c",
      },
    },
  },
  plugins: [],
};

export default config;
