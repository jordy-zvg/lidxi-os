import { EatsCaptureScreen } from '@/components/eats/EatsCaptureScreen';
import { loadEatsMenu } from '@/lib/eats-ingest-actions';

/**
 * Captura rápida de pedidos de Uber Eats (Sprint 19, H19.3).
 * Vive en la zona operativa: requiere sesión de empleado activa.
 */
export const dynamic = 'force-dynamic';

export default async function EatsPage() {
  const res = await loadEatsMenu();

  if (!res.ok) {
    return (
      <div className="p-6">
        <h1 className="mb-2 font-semibold text-ink text-lg">Captura de Uber Eats</h1>
        <p className="text-danger text-sm">{res.error}</p>
      </div>
    );
  }

  return <EatsCaptureScreen menu={res.data} />;
}
