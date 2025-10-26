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
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 2025 Design System: Desaturated Terracotta Primary
        primary: {
          50: '#faf6f4',
          100: '#f3ebe6',
          200: '#e6d5cb',
          300: '#d4b8a8',
          400: '#c19a83',
          500: '#a87c63',
          600: '#8f6751',
          700: '#765546',
          800: '#5d463c',
          900: '#4a3831',
        },
        // Rich Espresso for depth and contrast
        espresso: {
          50: '#f5f3f1',
          100: '#e8e3de',
          200: '#d0c5bc',
          300: '#b5a495',
          400: '#97826f',
          500: '#7a6555',
          600: '#645346',
          700: '#4e423a',
          800: '#3d342e',
          900: '#2d2622',
        },
        // Champagne neutrals for sophistication
        champagne: {
          50: '#fdfcfb',
          100: '#f9f7f4',
          200: '#f2ede7',
          300: '#e8dfd5',
          400: '#d9cbbe',
          500: '#c7b5a4',
          600: '#b09d89',
          700: '#968771',
          800: '#786d5d',
          900: '#5e564a',
        },
        // Turquoise accent only (refined from secondary)
        accent: {
          50: '#f0fafa',
          100: '#d9f2f2',
          200: '#b3e5e6',
          300: '#85d4d6',
          400: '#5bbec1',
          500: '#3da5a8',
          600: '#2d8b8e',
          700: '#237073',
          800: '#1c595c',
          900: '#16474a',
        },
        // Updated graphite for cleaner neutrals
        graphite: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        // Geometric sans for body - clean, modern, legible
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // High-contrast serif for display/headlines - elegant, sophisticated
        display: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'underline-sweep': 'underlineSweep 0.3s ease-out forwards',
        'shadow-lift': 'shadowLift 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
        underlineSweep: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        shadowLift: {
          '0%': { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
          '100%': { boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
