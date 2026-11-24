import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: 'var(--color-obsidian-950)',
          900: 'var(--color-obsidian-900)',
          800: 'var(--color-obsidian-800)',
          700: 'var(--color-obsidian-700)',
        },
        gold: {
          100: 'var(--color-gold-100)',
          500: 'var(--color-gold-500)',
          600: 'var(--color-gold-600)',
          700: 'var(--color-gold-700)',
        },
        chrome: {
          200: 'var(--color-chrome-200)',
          300: 'var(--color-chrome-300)',
          400: 'var(--color-chrome-400)',
        },
        surface: {
          canvas: 'var(--color-surface-canvas)',
          card: 'var(--color-surface-card)',
          muted: 'var(--color-surface-muted)',
        },
        ink: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        commerce: {
          savings: 'var(--color-price-savings)',
          deal: 'var(--color-badge-deal-bg)',
          warrantyBg: 'var(--color-warranty-bg)',
          warrantyText: 'var(--color-warranty-text)',
          obdBg: 'var(--color-obd-bg)',
          obdText: 'var(--color-obd-text)',
          warningBg: 'var(--color-warning-bg)',
          warningText: 'var(--color-warning-text)',
          errorBg: 'var(--color-error-bg)',
          errorText: 'var(--color-error-text)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: {
        content: 'var(--max-content-width)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-hover)',
        modal: 'var(--shadow-modal)',
        gold: 'var(--shadow-gold)',
      },
      zIndex: {
        header: 'var(--z-header)',
        drawer: 'var(--z-drawer)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
      screens: {
        'mobile-max': { max: '640px' },
        tablet: '641px',
        desktop: '1025px',
      },
    },
  },
  plugins: [],
}

export default config
