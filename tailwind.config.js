/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fond et surfaces
        background: {
          DEFAULT: '#0B0E14',
          surface: '#14181F',
          card: '#1A1F26',
          'card-hover': '#1F262E',
        },
        // Bordures
        border: {
          DEFAULT: '#2A313C',
          light: '#2A313C',
          hover: '#D4AF37',
        },
        // Texte
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
        },
        // Accent or
        gold: {
          300: '#F5D742',
          400: '#E5C135',
          500: '#D4AF37',
          600: '#B8960C',
          700: '#9C7E0A',
        },
        // États sémantiques
        compliant: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.2)',
        },
        'non-compliant': {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.2)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.1)',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: 'rgba(59, 130, 246, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      spacing: {
        'section': '3rem',
        'card': '1.5rem',
        'container': '2rem',
      },
      boxShadow: {
        'card': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'data-flash': 'dataFlash 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        dataFlash: {
          '0%': { backgroundColor: 'rgba(212, 175, 55, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      letterSpacing: {
        'tightest': '-0.02em',
        'tight': '-0.01em',
        'wide': '0.03em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
    },
  },
  plugins: [],
}
