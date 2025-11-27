import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  important: true,
  theme: {
    extend: {
      colors: {
        // Primary - Navy Blue
        primary: {
          DEFAULT: '#000080',
          light: '#3333a3',
          dark: '#000066',
          50: '#e8e8ff',
          100: '#d0d0ff',
          200: '#9999ff',
          300: '#6b6bff',
          400: '#3333a3',
          500: '#000080',
          600: '#000066',
          700: '#00004d',
          800: '#000033',
          900: '#00001a',
        },
        // Success - Green
        success: {
          DEFAULT: '#2e7d32',
          light: '#4caf50',
          dark: '#1b5e20',
          50: '#edf7ed',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        // Warning - Orange
        warning: {
          DEFAULT: '#ed6c02',
          light: '#ff9800',
          dark: '#e65100',
          50: '#fff4e5',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',
          900: '#e65100',
        },
        // Error - Red
        error: {
          DEFAULT: '#d32f2f',
          light: '#ef5350',
          dark: '#c62828',
          50: '#fdeded',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        // Info - Blue
        info: {
          DEFAULT: '#0288d1',
          light: '#03a9f4',
          dark: '#01579b',
          50: '#e5f6fd',
          100: '#b3e5fc',
          200: '#81d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#03a9f4',
          600: '#039be5',
          700: '#0288d1',
          800: '#0277bd',
          900: '#01579b',
        },
        // Backgrounds
        surface: {
          DEFAULT: '#ffffff',
          paper: '#ffffff',
          elevated: '#ffffff',
          dark: {
            DEFAULT: '#121212',
            paper: '#1e1e1e',
            elevated: '#242424',
          },
        },
        // Text
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
          disabled: 'rgba(0, 0, 0, 0.38)',
          dark: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
      // MUI style border radius
      borderRadius: {
        'mui-xs': '2px',
        'mui-sm': '4px',
        'mui-md': '8px',
        'mui-lg': '12px',
        'mui-xl': '16px',
        'mui-2xl': '24px',
      },
      // MUI style shadows
      boxShadow: {
        'mui-1': '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        'mui-2': '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        'mui-3': '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
        'mui-4': '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        'mui-6': '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
        'mui-8': '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
        'mui-dark-1': '0px 2px 1px -1px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.28), 0px 1px 3px 0px rgba(0,0,0,0.24)',
        'mui-dark-2': '0px 3px 1px -2px rgba(0,0,0,0.4), 0px 2px 2px 0px rgba(0,0,0,0.28), 0px 1px 5px 0px rgba(0,0,0,0.24)',
      },
      // MUI style transitions
      transitionDuration: {
        'mui-shortest': '150ms',
        'mui-shorter': '200ms',
        'mui-short': '250ms',
        'mui-standard': '300ms',
        'mui-complex': '375ms',
      },
      transitionTimingFunction: {
        'mui-ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'mui-ease-out': 'cubic-bezier(0.0, 0, 0.2, 1)',
        'mui-ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'mui-sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      // MUI style spacing
      spacing: {
        'mui-1': '8px',
        'mui-2': '16px',
        'mui-3': '24px',
        'mui-4': '32px',
        'mui-5': '40px',
        'mui-6': '48px',
      },
      // Font family
      fontFamily: {
        'mui': ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'mui-mono': ['Roboto Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      // Font sizes
      fontSize: {
        'mui-h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'mui-h2': ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        'mui-h3': ['1.75rem', { lineHeight: '1.4', fontWeight: '600' }],
        'mui-h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'mui-h5': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'mui-h6': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'mui-body1': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'mui-body2': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'mui-caption': ['0.75rem', { lineHeight: '1.66', fontWeight: '400' }],
        'mui-overline': ['0.625rem', { lineHeight: '2.66', fontWeight: '500', letterSpacing: '0.08333em' }],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

export default config
