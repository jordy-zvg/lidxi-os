import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import type { Metadata } from 'next';
import { setPaymentMode } from './actions';

export const metadata: Metadata = { title: 'Integraciones · Pagos' };

export default async function PagosIntegracionPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('payment_mode')
    .eq('id', tenantId)
    .maybeSingle();

  const currentMode = (
    (tenant as { payment_mode?: string } | null)?.payment_mode === 'production'
      ? 'production'
      : 'test'
  ) as 'test' | 'production';

  const targetMode: 'test' | 'production' = currentMode === 'test' ? 'production' : 'test';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#0A2540]">Pagos · Mercado Pago</h1>
        <p className="text-sm text-ink/60">
          Activar producción habilita cobros reales. Empieza en pruebas y solo cambia cuando hayas
          verificado el flujo con una orden de demostración.
        </p>
      </header>

      <section className="rounded-xl border border-ink/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink/40">Modo actual</p>
            <p className="mt-1 text-lg font-medium text-[#0A2540]">
              {currentMode === 'production' ? 'Producción' : 'Pruebas (sandbox)'}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {currentMode === 'production'
                ? 'Los cobros son reales y se reflejan en tu cuenta de Mercado Pago.'
                : 'Las preferences usan credenciales de prueba. Ningún cobro se procesa.'}
            </p>
          </div>
          <form action={setPaymentMode}>
            <input type="hidden" name="mode" value={targetMode} />
            <button
              type="submit"
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                targetMode === 'production'
                  ? 'bg-[#635BFF] text-white hover:bg-[#4f48d9]'
                  : 'border border-ink/15 bg-white text-[#0A2540] hover:bg-ink/5'
              }`}
            >
              {targetMode === 'production' ? 'Activar producción' : 'Volver a pruebas'}
            </button>
          </form>
        </div>

        {currentMode === 'test' && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            ⚠ Antes de activar producción: confirma que tu cuenta Mercado Pago está aprobada para
            recibir pagos, que el webhook está configurado (`/api/webhooks/mercado-pago`) en el
            panel de Mercado Pago, y que has corrido una preference de prueba exitosa.
          </p>
        )}
      </section>
    </div>
  );
}
