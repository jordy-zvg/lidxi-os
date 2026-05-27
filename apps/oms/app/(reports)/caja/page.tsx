export const metadata = { title: 'Caja' };

import { CajaScreen } from '@/components/caja/CajaScreen';
import { loadShiftSummary } from '@/lib/operations/shift-actions';

export const dynamic = 'force-dynamic';

export default async function CajaPage() {
  const res = await loadShiftSummary();

  if (!res.ok) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <h1 className="text-lg font-medium text-ink">No hay turno activo</h1>
          <p className="mt-1 text-sm text-ink-400">{res.error}</p>
        </div>
      </div>
    );
  }

  return <CajaScreen summary={res.data} />;
}
