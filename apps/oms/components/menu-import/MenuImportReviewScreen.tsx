'use client';

import { MenuEditorScreen } from '@/components/menu-editor/MenuEditorScreen';
import type { MenuItemRow } from '@/lib/menu-actions';
import { confirmMenuImport, discardMenuImport } from '@/lib/menu-import-actions';
import { IconArrowLeft, IconChecklist } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface MenuImportReviewScreenProps {
  importRow: { id: string; source: string };
}

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  foto: 'Fotos del menú',
  rappi: 'Rappi',
  eats: 'Uber Eats',
  didi: 'Didi Food',
};

/**
 * Pantalla de staging: el MISMO editor, scopeado a los borradores del import,
 * con barra de confirmación encima. Confirmar promueve draft→active; descartar
 * elimina borradores + storage. El cálculo de pendientes se refleja en vivo
 * desde los items que reporta el editor.
 */
export const MenuImportReviewScreen = ({ importRow }: MenuImportReviewScreenProps) => {
  const router = useRouter();
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingCount = items.filter(
    (i) => (i.review_reasons?.length ?? 0) > 0 || (i.source === 'foto' && i.base_price === 0),
  ).length;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmMenuImport(importRow.id);
      if (!result.ok) return setError(result.error);
      router.push('/admin/menu' as Route);
    });
  };

  const handleDiscard = () => {
    if (
      !confirm(
        'Descartar elimina los borradores de esta sesión y sus fotos. Esta acción no se puede deshacer. ¿Descartar?',
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await discardMenuImport(importRow.id);
      if (!result.ok) return setError(result.error);
      router.push('/admin/menu' as Route);
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Barra de staging */}
      <div className="shrink-0 border-b border-line bg-surface px-3 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <Link
          href={'/admin/menu' as Route}
          className="inline-flex items-center gap-1 text-sm text-ink-300 hover:text-ink"
        >
          <IconArrowLeft size={16} /> Menú
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <IconChecklist size={18} className="text-brand shrink-0" />
          <p className="text-sm font-semibold text-ink truncate">
            Staging — {SOURCE_LABEL[importRow.source] ?? importRow.source}
          </p>
        </div>
        <span className="text-xs text-ink-400">
          {items.length} producto{items.length === 1 ? '' : 's'} en borrador
          {pendingCount > 0 && (
            <span className="ml-2 font-semibold text-[#B45309]">{pendingCount} por revisar</span>
          )}
        </span>
        <div className="flex-1" />
        {error && <p className="text-xs text-danger-text">{error}</p>}
        <button
          type="button"
          onClick={handleDiscard}
          disabled={isPending}
          className="h-9 px-3 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || items.length === 0 || pendingCount > 0}
          title={
            pendingCount > 0
              ? 'Resuelve los productos marcados por revisar antes de confirmar'
              : undefined
          }
          className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40"
        >
          {isPending ? 'Confirmando…' : 'Confirmar al menú'}
        </button>
      </div>

      {/* El mismo editor, scopeado al import */}
      <div className="flex-1 min-h-0">
        <MenuEditorScreen importScope={{ importId: importRow.id }} onItemsChanged={setItems} />
      </div>
    </div>
  );
};
