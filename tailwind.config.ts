import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Disable automatic dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Desaturated teal + soft ivory + graphite with warm gold accents
        primary: {
          50: '#f0f9f9',
          100: '#d9f0f0',
          200: '#b3e0e0',
          300: '#7fc9c9',
          400: '#5ab3b3',
          500: '#3d9999', // Main desaturated teal
          600: '#2d7a7a',
          700: '#235f5f',
          800: '#1a4747',
          900: '#133535',
        },
        accent: {
          50: '#fdf8f3',
          100: '#faeee0',
          200: '#f4dcc0',
          300: '#ebc393',
          400: '#dfa562',
          500: '#d4883f', // Warm gold/muted copper
          600: '#b96f2d',
          700: '#9a5726',
          800: '#7d4623',
          900: '#653a1f',
        },
        graphite: {
          50: '#f7f8f8',
          100: '#eceef0',
          200: '#d5d9dd',
          300: '#b0b7be',
          400: '#858f9a',
          500: '#67717d',
          600: '#525b66',
          700: '#444b54',
          800: '#3a3f47',
          900: '#33373d',
        },
        ivory: {
          50: '#fdfdfb',
          100: '#fafaf7',
          200: '#f5f5f0',
          300: '#eeeee6',
          400: '#e3e3d9',
          500: '#d1d1c4', // Soft ivory
          600: '#b5b5a8',
          700: '#95958a',
          800: '#77776e',
          900: '#5f5f58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
