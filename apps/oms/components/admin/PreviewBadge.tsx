import { IconBarrierBlock, IconEye } from '@tabler/icons-react';

interface PreviewBadgeProps {
  /**
   * 'soon'    → "Próximamente": pantalla sin datos, no operativa.
   * 'preview' → "Vista previa · datos de ejemplo": pantalla con datos mock,
   *             aún no conectada a la realidad del tenant.
   */
  variant: 'soon' | 'preview';
  className?: string;
}

/**
 * Badge de honestidad visual: cada cascarón del Sprint 11 lo lleva visible
 * para que nadie intente operar sobre una pantalla que aún no hace nada.
 */
export function PreviewBadge({ variant, className = '' }: PreviewBadgeProps) {
  const isSoon = variant === 'soon';
  const Icon = isSoon ? IconBarrierBlock : IconEye;
  const label = isSoon ? 'Próximamente' : 'Vista previa · datos de ejemplo';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn-soft px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-warn-text ${className}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}
