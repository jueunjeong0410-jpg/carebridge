const scale = (name) => Object.fromEntries(
  [50,100,200,300,400,500,600,700,800,900,950].map(n => [n, `oklch(var(--${name}-${n}) / <alpha-value>)`])
);
module.exports = {
  content: ['./src/**/*.mjs', './docs/assets/*.js'],
  theme: {
    extend: {
      colors: { background: scale('background'), foreground: scale('foreground'), primary: scale('primary'), accent: scale('accent') },
      maxWidth: { shell: '1440px' },
      fontFamily: { heading: 'var(--font-heading)', body: 'var(--font-body)', label: 'var(--font-label)' },
    },
  },
  plugins: [],
};
