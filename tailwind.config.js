/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,njk,js,ts,jsx,tsx}",
    "./public/**/*.html",
    // add any other folders where components/templates live
  ],
  safelist: [
    // dynamic classes used by JS animations/staggering
    'opacity-0', 'opacity-100', 'translate-y-4', 'translate-y-0',
    'transition-all', 'transition-transform',
    'reveal', 'animate-fade-up', 'animate-bounce-gentle'
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS custom properties
        'navy': {
          50: 'var(--color-navy-50)',
          100: 'var(--color-navy-100)',
          200: 'var(--color-navy-200)',
          300: 'var(--color-navy-300)',
          400: 'var(--color-navy-400)',
          500: 'var(--color-navy-500)',
          600: 'var(--color-navy-600)',
          700: 'var(--color-navy-700)',
          800: 'var(--color-navy-800)',
          900: 'var(--color-navy-900)',
        },
        'burgundy': {
          50: 'var(--color-burgundy-50)',
          100: 'var(--color-burgundy-100)',
          200: 'var(--color-burgundy-200)',
          300: 'var(--color-burgundy-300)',
          400: 'var(--color-burgundy-400)',
          500: 'var(--color-burgundy-500)',
          600: 'var(--color-burgundy-600)',
          700: 'var(--color-burgundy-700)',
          800: 'var(--color-burgundy-800)',
          900: 'var(--color-burgundy-900)',
        },
        'neutral': {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
        'gold': {
          50: 'var(--color-gold-50)',
          100: 'var(--color-gold-100)',
          200: 'var(--color-gold-200)',
          300: 'var(--color-gold-300)',
          400: 'var(--color-gold-400)',
          500: 'var(--color-gold-500)',
          600: 'var(--color-gold-600)',
          700: 'var(--color-gold-700)',
          800: 'var(--color-gold-800)',
          900: 'var(--color-gold-900)',
        },
        'peach': {
          50: 'var(--color-peach-50)',
          100: 'var(--color-peach-100)',
          200: 'var(--color-peach-200)',
          300: 'var(--color-peach-300)',
          400: 'var(--color-peach-400)',
          500: 'var(--color-peach-500)',
          600: 'var(--color-peach-600)',
          700: 'var(--color-peach-700)',
          800: 'var(--color-peach-800)',
          900: 'var(--color-peach-900)',
        },
        // Keep existing brand colors for compatibility
        'navy-deep': '#191F3A',
        'burgundy-solid': '#81171F',
        'gray-light': '#ECECEC',
        'brand': {
          DEFAULT: '#81171F',
          500: '#A02A2A',
          700: '#81171F',
          900: '#191F3A',
          accent: '#F2B7AF'
        }
      },
      fontFamily: {
        lora: ['Lora', 'serif'],
        century: ['"Century Schoolbook"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif']
      },
      borderRadius: {
        'xl-2': '14px',
      },
      boxShadow: {
        'hero-lg': '0 10px 30px rgba(2,6,23,0.45)',
        'glass': '0 6px 30px rgba(2,6,23,0.35)',
      },
      spacing: {
        '9': '2.25rem'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(0.6deg)' },
          '66%': { transform: 'translateY(-3px) rotate(-0.6deg)' },
        },
        // keep existing useful small animations if you want
        'breathe': {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }
        }
      },
      animation: {
        'fade-up': 'fade-up .56s cubic-bezier(.16,.84,.28,1) both',
        'bounce-gentle': 'bounce-gentle 7s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'), // improves readable bodies
    require('@tailwindcss/forms') // nice default form styles (optional)
  ],
}
