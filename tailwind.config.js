/** Token desain disalin dari Stitch */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff', primary: '#006b5f', secondary: '#006a61', tertiary: '#855300', error: '#ba1a1a',
        'on-primary': '#ffffff', 'on-error': '#ffffff', 'on-surface': '#121c2a', 'on-surface-variant': '#3c4947',
        'primary-container': '#14b8a6', 'on-primary-container': '#00423b', 'primary-fixed': '#71f8e4',
        'secondary-container': '#86f2e4', 'on-secondary-container': '#006f66', 'tertiary-container': '#e49200',
        'error-container': '#ffdad6', 'on-error-container': '#93000a',
        'surface-container-lowest': '#ffffff', 'surface-container-low': '#eff4ff', 'surface-container': '#e6eeff',
        'surface-container-high': '#dee9fc', 'surface-container-highest': '#d9e3f6', 'outline-variant': '#bbcac6',
        'inverse-surface': '#27313f', 'inverse-on-surface': '#eaf1ff',
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
    },
  },
}
