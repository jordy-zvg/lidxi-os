'use client';

import { cn } from '@lidxi/shared';
import { IconBackspace } from '@tabler/icons-react';
import { useEffect } from 'react';

export interface KeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  /** Disparado cuando el usuario presiona Enter teclado físico. */
  onSubmit?: () => void;
  /** Disparado cuando el usuario presiona Escape. */
  onClear?: () => void;
  /** Mientras `disabled` es true, no responde a clicks ni teclado. */
  disabled?: boolean;
  /** Tamaño de las teclas. md = 64×64 (login), sm = 56×56 (overlay). */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Keypad numérico 3×4 (1-9, ·, 0, ⌫).
 *
 * Soporte de teclado físico (cuando el componente está montado y no disabled):
 *   - 0..9 → onDigit
 *   - Backspace → onBackspace
 *   - Enter → onSubmit
 *   - Escape → onClear
 */
export const Keypad = ({
  onDigit,
  onBackspace,
  onSubmit,
  onClear,
  disabled = false,
  size = 'md',
  className,
}: KeypadProps) => {
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        onDigit(e.key);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        onSubmit();
        return;
      }
      if (e.key === 'Escape' && onClear) {
        e.preventDefault();
        onClear();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, onDigit, onBackspace, onSubmit, onClear]);

  const keyClass = cn(
    'flex items-center justify-center rounded-lg bg-surface border border-line-2',
    'font-mono font-medium text-ink select-none transition-all',
    'hover:bg-canvas active:scale-95 focus-visible:outline-none focus-visible:shadow-focus',
    'disabled:opacity-50 disabled:pointer-events-none',
    size === 'md' ? 'h-16 w-16 text-[22px]' : 'h-14 w-14 text-lg',
  );

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onDigit(String(n))}
          className={keyClass}
        >
          {n}
        </button>
      ))}
      <span aria-hidden className={cn('block', size === 'md' ? 'h-16 w-16' : 'h-14 w-14')} />
      <button type="button" disabled={disabled} onClick={() => onDigit('0')} className={keyClass}>
        0
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onBackspace}
        className={keyClass}
        aria-label="Borrar"
      >
        <IconBackspace size={size === 'md' ? 22 : 18} className="text-ink-300" />
      </button>
    </div>
  );
};
