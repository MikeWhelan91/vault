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
        // Warm red/coral primary
        primary: {
          50: '#fef2f0',
          100: '#fee5e0',
          200: '#fccfc7',
          300: '#fab0a1',
          400: '#f6836a',
          500: '#d84531',
          600: '#c23d2c',
          700: '#a23324',
          800: '#862b1f',
          900: '#6f271e',
        },
        secondary: {
          50: '#fef5f5',
          100: '#fee8e8',
          200: '#fdd6d6',
          300: '#fcb9b9',
          400: '#f99191',
          500: '#f28383',
          600: '#e95555',
          700: '#d93939',
          800: '#b82e2e',
          900: '#9a2929',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee5e5',
          200: '#fecfcf',
          300: '#fdacac',
          400: '#fc7979',
          500: '#fe4242',
          600: '#f71d1d',
          700: '#d91414',
          800: '#b51414',
          900: '#951717',
        },
        graphite: {
          50: '#fcf0ee',
          100: '#f5e5e3',
          200: '#e8ccc8',
          300: '#d5a9a3',
          400: '#b8736b',
          500: '#99544a',
          600: '#7a3f36',
          700: '#60322b',
          800: '#4a2621',
          900: '#0d0202',
        },
        ivory: {
          50: '#fdfdfb',
          100: '#fafaf7',
          200: '#f5f5f0',
          300: '#eeeee6',
          400: '#e3e3d9',
          500: '#d1d1c4',
          600: '#b5b5a8',
          700: '#95958a',
          800: '#77776e',
          900: '#5f5f58',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
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
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
