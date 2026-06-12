'use client';

import { createManualImport } from '@/lib/menu-import-actions';
import { IconArrowLeft, IconClipboardList, IconLock, IconPhotoScan } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PhotoImportWizard } from './PhotoImportWizard';

interface ImportStartScreenProps {
  /** Resuelto server-side con canUseFeature (la action igual re-valida). */
  photosEnabled: boolean;
}

/** Punto de entrada del flujo unificado: elegir método (fotos o manual). */
export const ImportStartScreen = ({ photosEnabled }: ImportStartScreenProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleManual = () => {
    setError(null);
    startTransition(async () => {
      const result = await createManualImport();
      if (!result.ok) return setError(result.error);
      router.push(`/admin/menu/imports/${result.data.importId}` as Route);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href={'/admin/menu' as Route}
          className="inline-flex items-center gap-1 text-sm text-ink-300 hover:text-ink"
        >
          <IconArrowLeft size={16} /> Menú
        </Link>
        <h1 className="text-xl font-semibold text-ink mt-2">Importar menú</h1>
        <p className="text-sm text-ink-400">
          Los productos entran como borrador: los revisas, corriges y confirmas. Nada se publica
          solo.
        </p>
      </div>

      {/* Método fotos */}
      <section className="rounded-xl border border-line bg-surface p-5 space-y-3">
        <div className="flex items-center gap-2">
          <IconPhotoScan size={20} className="text-brand" />
          <h2 className="text-base font-semibold text-ink">Desde fotos del menú</h2>
        </div>
        {photosEnabled ? (
          <PhotoImportWizard />
        ) : (
          <div className="flex items-center gap-2 text-sm text-ink-400">
            <IconLock size={16} />
            <span>Tu plan no incluye importación por fotos.</span>
          </div>
        )}
      </section>

      {/* Método manual */}
      <section className="rounded-xl border border-line bg-surface p-5 space-y-3">
        <div className="flex items-center gap-2">
          <IconClipboardList size={20} className="text-brand" />
          <h2 className="text-base font-semibold text-ink">Manual, en borrador</h2>
        </div>
        <p className="text-sm text-ink-400">
          Captura productos a mano en una sesión de borradores y publícalos todos juntos al
          confirmar.
        </p>
        {error && <p className="text-xs text-danger-text">{error}</p>}
        <button
          type="button"
          onClick={handleManual}
          disabled={isPending}
          className="h-9 px-4 rounded-md border border-line-2 text-sm text-ink font-medium hover:bg-surface-2 disabled:opacity-40"
        >
          {isPending ? 'Creando…' : 'Empezar sesión de borradores'}
        </button>
      </section>
    </div>
  );
};
