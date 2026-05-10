/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
          display: ['var(--font-display)', 'Georgia', 'serif'],
          mono: ['var(--font-mono)', 'monospace'],
        },
        colors: {
          rings: {
            existential: '#C0392B',
            environment: '#1D9E75',
            lives:       '#E24B4A',
            disease:     '#D85A30',
            economic:    '#BA7517',
            financial:   '#7B5EA7',
            quality:     '#2E86AB',
            innovation:  '#E07B39',
            freedom:     '#534AB7',
            governance:  '#2D6A4F',
            informed:    '#378ADD',
            social:      '#C2529A',
          },
          stone: {
            50:  '#FAFAF9',
            100: '#F5F5F4',
            200: '#E7E5E4',
            300: '#D6D3D1',
            400: '#A8A29E',
            500: '#78716C',
            600: '#57534E',
            700: '#44403C',
            800: '#292524',
            900: '#1C1917',
            950: '#0C0A09',
          },
        },
        fontSize: {
          '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        },
        boxShadow: {
          'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        },
      },
    },
    plugins: [],
  }