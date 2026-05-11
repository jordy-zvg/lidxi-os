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

        /* ── Channel palette [Sprint 01] ─────────────────────────
           Uso: bg-ch-direct, text-ch-eats-text, bg-ch-rappi-soft…
           ─────────────────────────────────────────────────────── */
        ch: {
          direct: {
            DEFAULT: 'var(--ch-direct)',
            soft: 'var(--ch-direct-soft)',
            text: 'var(--ch-direct-text)',
          },
          eats: {
            DEFAULT: 'var(--ch-eats)',
            soft: 'var(--ch-eats-soft)',
            text: 'var(--ch-eats-text)',
          },
          rappi: {
            DEFAULT: 'var(--ch-rappi)',
            soft: 'var(--ch-rappi-soft)',
            text: 'var(--ch-rappi-text)',
          },
          didi: {
            DEFAULT: 'var(--ch-didi)',
            soft: 'var(--ch-didi-soft)',
            text: 'var(--ch-didi-text)',
          },
          mostrador: {
            DEFAULT: 'var(--ch-mostrador)',
            soft: 'var(--ch-mostrador-soft)',
            text: 'var(--ch-mostrador-text)',
          },
        },

        /* ── Dark set [Sprint 01] ─────────────────────────────────
           Uso: bg-dark-canvas, text-dark-ink, border-dark-line-2…
           ─────────────────────────────────────────────────────── */
        dark: {
          canvas: 'var(--dark-canvas)',
          surface: {
            DEFAULT: 'var(--dark-surface)',
            2: 'var(--dark-surface-2)',
          },
          ink: {
            DEFAULT: 'var(--dark-ink)',
            100: 'var(--dark-ink-2)',
            200: 'var(--dark-ink-3)',
            300: 'var(--dark-ink-4)',
            400: 'var(--dark-ink-5)',
          },
          line: {
            DEFAULT: 'var(--dark-line)',
            2: 'var(--dark-line-2)',
          },
          brand: {
            DEFAULT: 'var(--dark-brand)',
            soft: 'var(--dark-brand-soft)',
            text: 'var(--dark-brand-text)',
          },
          ok: {
            DEFAULT: 'var(--dark-ok)',
            soft: 'var(--dark-ok-soft)',
            text: 'var(--dark-ok-text)',
          },
          warn: {
            DEFAULT: 'var(--dark-warn)',
            soft: 'var(--dark-warn-soft)',
            text: 'var(--dark-warn-text)',
          },
          danger: {
            DEFAULT: 'var(--dark-danger)',
            soft: 'var(--dark-danger-soft)',
            text: 'var(--dark-danger-text)',
          },
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
      animation: {
        shake: 'shake 0.3s ease-in-out',
        'ring-pulse': 'ring-pulse 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
