/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: '#07080f',
        sidebar: '#0b0c18',
        'sidebar-border': '#15172a',
        card: '#0f1020',
        'card-border': '#1a1d2e',
        input: '#090a16',
        'input-border': '#1a1d2e',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-phoenix': '0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-amber':   '0 0 30px rgba(245, 158, 11, 0.15)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.15)',
        'glow-red':     '0 0 30px rgba(239, 68, 68, 0.15)',
        'glow-violet':  '0 0 30px rgba(139, 92, 246, 0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'float':      'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'rise':       'rise linear forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-7px)' } },
        pulseGlow: { '0%, 100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
        rise: {
          '0%':   { transform: 'translateY(0) scale(1)',   opacity: 1 },
          '100%': { transform: 'translateY(-100px) scale(0)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
