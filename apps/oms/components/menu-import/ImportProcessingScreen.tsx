'use client';

import {
  type MenuImportStatus,
  discardMenuImport,
  getMenuImport,
  retryMenuImport,
} from '@/lib/menu-import-actions';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface ImportProcessingScreenProps {
  importId: string;
  initialStatus: MenuImportStatus;
  initialError: string | null;
  updatedAt: string;
}

const POLL_MS = 2_500;
const STALE_MS = 3 * 60 * 1000;

/**
 * Estado de un import de fotos mientras procesa (o tras fallar). Pollea la
 * fila cada 2.5s (mismo patrón que DeliveryTrackingPanel): aunque la llamada
 * a processMenuImport se pierda (deploy, timeout de request), el estado real
 * vive en la BD y esta pantalla lo refleja. processing >3min sin avance =
 * colgado (crash duro) → se ofrece reintentar.
 */
export const ImportProcessingScreen = ({
  importId,
  initialStatus,
  initialError,
  updatedAt,
}: ImportProcessingScreenProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<MenuImportStatus>(initialStatus);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [lastUpdate, setLastUpdate] = useState(updatedAt);
  const [stale, setStale] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== 'processing') return;
    const id = setInterval(async () => {
      const result = await getMenuImport(importId);
      if (!result.ok) return;
      const row = result.data.row;
      if (row.status === 'ready') {
        router.refresh();
        return;
      }
      setStatus(row.status);
      setErrorMsg(row.error);
      setLastUpdate(row.updated_at);
      setStale(Date.now() - new Date(row.updated_at).getTime() > STALE_MS);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [importId, status, router]);

  const handleRetry = () => {
    setActionError(null);
    startTransition(async () => {
      setStatus('processing');
      setStale(false);
      const result = await retryMenuImport(importId);
      if (!result.ok) {
        setActionError(result.error);
        // El estado real (error/processing) lo trae el siguiente poll.
        const fresh = await getMenuImport(importId);
        if (fresh.ok) {
          setStatus(fresh.data.row.status);
          setErrorMsg(fresh.data.row.error);
        }
        return;
      }
      router.refresh();
    });
  };

  const handleDiscard = () => {
    if (!confirm('Descartar elimina este import y sus fotos. ¿Descartar?')) return;
    setActionError(null);
    startTransition(async () => {
      const result = await discardMenuImport(importId);
      if (!result.ok) return setActionError(result.error);
      router.push('/admin/menu' as Route);
    });
  };

  const showRetry = status === 'error' || (status === 'processing' && stale);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center min-h-[60vh]">
      {status === 'processing' && !stale ? (
        <>
          <IconLoader2 size={36} className="text-brand animate-spin" />
          <p className="text-base font-medium text-ink">Extrayendo tu menú de las fotos…</p>
          <p className="text-sm text-ink-400 max-w-md">
            Esto toma unos segundos por página. Puedes quedarte aquí; el resultado aparece solo.
          </p>
        </>
      ) : (
        <>
          <IconAlertTriangle size={36} className="text-[#D97706]" />
          <p className="text-base font-medium text-ink">
            {status === 'error' ? 'La extracción falló' : 'La extracción parece atorada'}
          </p>
          {errorMsg && <p className="text-sm text-ink-400 max-w-md">{errorMsg}</p>}
          {status === 'processing' && stale && (
            <p className="text-sm text-ink-400 max-w-md">
              Sin avance desde {new Date(lastUpdate).toLocaleTimeString('es-MX')}. Puedes reintentar
              con las mismas fotos.
            </p>
          )}
        </>
      )}

      {actionError && <p className="text-xs text-danger-text">{actionError}</p>}

      {showRetry && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isPending}
            className="h-9 px-4 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isPending}
            className="h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-40"
          >
            {isPending ? 'Reintentando…' : 'Reintentar'}
          </button>
        </div>
      )}
    </div>
  );
};
