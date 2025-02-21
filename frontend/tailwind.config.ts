import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#232323",
        element: "#373737",
        fg: "#2a2a2a",
        "acc-orng": "#ED5221",
      },
    },
  },
  plugins: [],
} satisfies Config;
