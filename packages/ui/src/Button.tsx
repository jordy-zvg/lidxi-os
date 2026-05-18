import { cn } from '@kobi/shared';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover',
        secondary:
          'bg-surface text-ink border border-line-2 hover:bg-surface-2 hover:border-line-3',
        danger: 'bg-danger text-white hover:opacity-90',
        ghost: 'bg-transparent text-ink-200 hover:bg-surface-2',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = ({
  className,
  variant,
  size,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) => (
  <button type="button" className={cn(buttonStyles({ variant, size }), className)} {...props}>
    {leftIcon}
    {children}
    {rightIcon}
  </button>
);
