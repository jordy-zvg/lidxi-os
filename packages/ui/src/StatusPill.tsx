import { cn } from '@kobi/shared';
import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

const pillStyles = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        ok: 'bg-ok-soft text-ok-text',
        warn: 'bg-warn-soft text-warn-text',
        danger: 'bg-danger-soft text-danger-text',
        info: 'bg-brand-soft text-brand-text',
        neutral: 'bg-surface-2 text-ink-200',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

const dotStyles = cva('h-1.5 w-1.5 rounded-full', {
  variants: {
    variant: {
      ok: 'bg-ok',
      warn: 'bg-warn',
      danger: 'bg-danger',
      info: 'bg-brand',
      neutral: 'bg-ink-400',
    },
    pulse: { true: 'animate-pulse', false: '' },
  },
  defaultVariants: { variant: 'neutral', pulse: false },
});

export interface StatusPillProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillStyles> {
  pulse?: boolean;
}

export const StatusPill = ({
  className,
  variant,
  pulse = false,
  children,
  ...props
}: StatusPillProps) => (
  <span className={cn(pillStyles({ variant }), className)} {...props}>
    <span className={dotStyles({ variant, pulse })} />
    {children}
  </span>
);
