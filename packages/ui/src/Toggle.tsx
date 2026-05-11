'use client';

import { cn } from '@lidxi/shared';
import type { ButtonHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export const Toggle = ({
  checked,
  onChange,
  label,
  className,
  disabled,
  ...props
}: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-4 w-[30px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50',
      checked ? 'bg-brand' : 'bg-ink-500',
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        'inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-[15px]' : 'translate-x-0.5',
      )}
    />
  </button>
);
