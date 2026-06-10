import { requireTenant } from '@/lib/supabase/tenant-guard';
import { MercadoPago } from '@kobi/integrations';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Integraciones · Pagos' };

const MODE_COPY: Record<MercadoPago.MercadoPagoEffectiveMode, { label: string; detail: string }> = {
  mock: {
    label: 'Mock (local)',
    detail:
      'El comensal paga en una página simulada del storefront. No se procesa ningún cobro real ni de prueba.',
  },
  sandbox: {
    label: 'Pruebas (sandbox)',
    detail:
      'Las preferences usan credenciales de PRUEBA de Mercado Pago. Ningún cobro real se procesa.',
  },
  production: {
    label: 'Producción',
    detail: 'Los cobros son REALES y se reflejan en la cuenta de Mercado Pago del collector.',
  },
};

/**
 * Panel READ-ONLY del estado de pagos.
 *
 * El ENTORNO (mock/sandbox/production) lo decide `MP_MODE` por DEPLOY — ya no es
 * un toggle por tenant. Por eso aquí no hay botón: cambiar de entorno es una
 * acción de operaciones (variables del servicio), no de la UI del restaurante.
 */
export default async function PagosIntegracionPage() {
  const { tenantId } = await requireTenant();

  const mode = MercadoPago.resolveMercadoPagoMode();
  const copy = MODE_COPY[mode];

  // Solo en entornos reales tiene sentido checar credenciales del collector.
  let credsLine: string;
  if (mode === 'mock') {
    credsLine = 'No aplica en modo mock.';
  } else {
    const environment = MercadoPago.resolveMercadoPagoEnvironment();
    const creds = await MercadoPago.getCollectorCredentials(tenantId, environment);
    credsLine = creds.ok
      ? `✓ Credenciales del collector detectadas para el entorno '${environment}'.`
      : `⚠ Faltan credenciales para el entorno '${environment}'. Configúralas en las variables del servicio (Railway).`;
  }

  const isReal = mode !== 'mock';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#0A2540]">Pagos · Mercado Pago</h1>
        <p className="text-sm text-ink/60">
          Estado de la integración de cobros online. El entorno se controla por despliegue (variable{' '}
          <code className="rounded bg-ink/5 px-1">MP_MODE</code>).
        </p>
      </header>

      <section className="rounded-xl border border-ink/10 bg-white p-6 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink/40">Entorno actual</p>
          <p className="mt-1 text-lg font-medium text-[#0A2540]">{copy.label}</p>
          <p className="mt-2 text-sm text-ink/60">{copy.detail}</p>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink/40">Credenciales</p>
          <p className="mt-1 text-sm text-ink/70">{credsLine}</p>
        </div>

        {isReal && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            ⚠ Para recibir notificaciones de pago, el webhook{' '}
            <code className="rounded bg-amber-100 px-1">/api/webhooks/mercado-pago</code> debe estar
            registrado en el panel de Mercado Pago (Webhooks) para este entorno, con su firma
            secreta (<code className="rounded bg-amber-100 px-1">MERCADO_PAGO_WEBHOOK_SECRET</code>)
            configurada.
          </p>
        )}
      </section>
    </div>
  );
}
