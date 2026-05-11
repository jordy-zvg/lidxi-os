import type { Config } from 'tailwindcss';

/**
 * Preset de Tailwind para LidxiOS.
 *
 * Cada app extiende este preset desde su propio `tailwind.config.ts`:
 *
 *   import preset from '@lidxi/tokens/tailwind';
 *   export default { presets: [preset], content: ['./app/**\/*.{ts,tsx}'] };
 *
 * Los valores apuntan a las CSS vars definidas en `tokens.css`, así un cambio
 * de paleta se hace en un solo lugar y todas las clases lo recogen al instante.
 */
const preset = {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          soft: 'var(--brand-soft)',
          text: 'var(--brand-text)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          0: 'var(--ink)',
          100: 'var(--ink-2)',
          200: 'var(--ink-3)',
          300: 'var(--ink-4)',
          400: 'var(--ink-5)',
          500: 'var(--ink-6)',
        },
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        line: {
          DEFAULT: 'var(--line)',
          2: 'var(--line-2)',
          3: 'var(--line-3)',
        },
        ok: {
          DEFAULT: 'var(--ok)',
          soft: 'var(--ok-soft)',
          text: 'var(--ok-text)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'var(--warn-soft)',
          text: 'var(--warn-text)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
          text: 'var(--danger-text)',
        },
        miztli: {
          DEFAULT: 'var(--miztli)',
          soft: 'var(--miztli-soft)',
        },
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r-md)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderWidth: {
        hairline: '0.5px',
      },
      spacing: {
        sidebar: '220px',
        topbar: '56px',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
