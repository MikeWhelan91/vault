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
        // Warm Mauve Primary - Sophisticated purple with warm undertones
        primary: {
          50: '#faf7f9',
          100: '#f3eef3',
          200: '#e8dce8',
          300: '#d6c2d7',
          400: '#bfa2bf',
          500: '#a68ba6',
          600: '#8e738e',
          700: '#7a617a',
          800: '#644f64',
          900: '#4f3e4f',
        },
        // Soft Plum for depth and contrast
        plum: {
          50: '#f7f5f7',
          100: '#ece8ec',
          200: '#d6cfd6',
          300: '#bcb0bc',
          400: '#9d8d9d',
          500: '#8e7a8e',
          600: '#7d6b7d',
          700: '#6a5a6a',
          800: '#544854',
          900: '#3e353e',
        },
        // Warm champagne neutrals (keeping these - they work beautifully)
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
        // Soft sage accent for contrast
        accent: {
          50: '#f7f9f7',
          100: '#ecf0ec',
          200: '#d6dfd6',
          300: '#b8c7b8',
          400: '#95a995',
          500: '#7a8f7a',
          600: '#657965',
          700: '#556555',
          800: '#455145',
          900: '#363e36',
        },
        // Warm grays for text
        warm: {
          50: '#fafaf9',
          100: '#f5f4f2',
          200: '#e8e6e3',
          300: '#d4d1cc',
          400: '#a8a39c',
          500: '#7c776f',
          600: '#635e57',
          700: '#4d4943',
          800: '#3a3632',
          900: '#2a2725',
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
