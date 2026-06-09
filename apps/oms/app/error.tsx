'use client';

import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry queda pendiente (Sprint 8). Mientras, dejar traza en consola server/cliente.
    console.error('[ErrorBoundary]', error?.digest, error?.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F9FC] px-6 text-center">
      <div className="mb-8">
        <KobiWordmark size="md" />
      </div>
      <h1 className="text-3xl font-semibold text-[#0A2540]">Algo salió mal.</h1>
      <p className="mt-3 max-w-md text-sm text-ink/60">
        Estamos enterados del problema y trabajando en solucionarlo. Si esto persiste, escríbenos.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/inicio"
          className="rounded-full bg-[#7C71FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5E52F5]"
        >
          Volver al panel
        </Link>
        <Link
          href="/contacto"
          className="rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-medium text-[#0A2540] hover:bg-ink/[0.02]"
        >
          Contactar soporte
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-transparent px-5 py-2 text-sm font-medium text-ink/60 hover:text-[#0A2540]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
