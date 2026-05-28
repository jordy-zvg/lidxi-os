import { cn } from '@kobi/shared';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

/**
 * Estado vacío unificado del OMS. Reemplaza los empty states escritos a mano
 * (con tamaños de icono y colores divergentes) por una sola jerarquía:
 * icono → título → descripción → acción opcional.
 *
 *   size: 'full'  → ocupa el alto disponible (listas/pantallas que llenan el área)
 *         'block' → bloque con padding vertical (dentro de grids o tarjetas)
 *   tone: 'light' (default) o 'dark' (pantallas con tema oscuro, p.ej. KDS)
 */
const emptyStateStyles = cva('flex flex-col items-center justify-center gap-2 text-center', {
  variants: {
    size: {
      full: 'h-full flex-1',
      block: 'py-12',
    },
  },
  defaultVariants: {
    size: 'full',
  },
});

const TONE_ICON = { light: 'text-ink-400', dark: 'text-dark-ink-300' } as const;
const TONE_TITLE = { light: 'text-ink', dark: 'text-dark-ink' } as const;
const TONE_DESC = { light: 'text-ink-400', dark: 'text-dark-ink-300' } as const;

export interface EmptyStateProps extends VariantProps<typeof emptyStateStyles> {
  /** Icono (p.ej. <IconReceipt size={36} />). El color lo aplica el tono. */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Acción opcional (botón/enlace) bajo el texto. */
  action?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  tone = 'light',
  size,
  className,
}: EmptyStateProps) => (
  <div className={cn(emptyStateStyles({ size }), className)}>
    {icon && <span className={cn('mb-1', TONE_ICON[tone])}>{icon}</span>}
    <p className={cn('text-sm font-medium', TONE_TITLE[tone])}>{title}</p>
    {description && <p className={cn('max-w-xs text-xs', TONE_DESC[tone])}>{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
