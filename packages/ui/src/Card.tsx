import { cn } from '@lidxi/shared';
import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

const cardStyles = cva('bg-surface border border-line rounded-lg', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    elevation: {
      flat: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
    },
  },
  defaultVariants: {
    padding: 'md',
    elevation: 'flat',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> {}

export const Card = ({ className, padding, elevation, ...props }: CardProps) => (
  <div className={cn(cardStyles({ padding, elevation }), className)} {...props} />
);
