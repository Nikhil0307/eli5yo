// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For App Router
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For Pages Router (if any)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // For any components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
