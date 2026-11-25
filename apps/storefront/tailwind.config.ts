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
          950: 'rgb(var(--rgb-obsidian-950) / <alpha-value>)',
          900: 'rgb(var(--rgb-obsidian-900) / <alpha-value>)',
          800: 'rgb(var(--rgb-obsidian-800) / <alpha-value>)',
          700: 'rgb(var(--rgb-obsidian-700) / <alpha-value>)',
        },
        gold: {
          100: 'rgb(var(--rgb-gold-100) / <alpha-value>)',
          500: 'rgb(var(--rgb-gold-500) / <alpha-value>)',
          600: 'rgb(var(--rgb-gold-600) / <alpha-value>)',
          700: 'rgb(var(--rgb-gold-700) / <alpha-value>)',
        },
        chrome: {
          200: 'rgb(var(--rgb-chrome-200) / <alpha-value>)',
          300: 'rgb(var(--rgb-chrome-300) / <alpha-value>)',
          400: 'rgb(var(--rgb-chrome-400) / <alpha-value>)',
        },
        surface: {
          canvas: 'rgb(var(--rgb-surface-canvas) / <alpha-value>)',
          card: 'rgb(var(--rgb-surface-card) / <alpha-value>)',
          muted: 'rgb(var(--rgb-surface-muted) / <alpha-value>)',
        },
        ink: {
          primary: 'rgb(var(--rgb-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--rgb-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--rgb-text-muted) / <alpha-value>)',
          disabled: 'rgb(var(--rgb-text-disabled) / <alpha-value>)',
          inverse: 'rgb(var(--rgb-text-inverse) / <alpha-value>)',
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
          whatsapp: 'var(--color-whatsapp)',
          whatsappDark: 'var(--color-whatsapp-dark)',
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
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        hintSlideIn: {
          '0%': { transform: 'translateY(75%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        hintSlideOut: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(-75%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'hint-in': 'hintSlideIn 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'hint-out': 'hintSlideOut 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

export default config
