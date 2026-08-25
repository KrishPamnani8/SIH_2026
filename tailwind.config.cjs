/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bgLavender: '#F5F3FF',
        bgLilac: '#EDE9FE',
        borderSlate: 'rgba(148,163,184,0.5)',
        textSlate500: '#64748B',
        textSlate800: '#1E293B',
        primaryGradientStart: '#6366F1',
        primaryGradientMid: '#A855F7',
        primaryGradientEnd: '#EC4899'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
