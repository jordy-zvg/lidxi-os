import { PreviewBadge } from '@/components/admin/PreviewBadge';
import { StatusPill } from '@kobi/ui';
import { IconCreditCard, IconDownload, IconReceipt } from '@tabler/icons-react';

const SAMPLE_INVOICES = [
  {
    id: 'INV-202605',
    period: 'Mayo 2026',
    amount: '$1,490',
    status: 'pagada' as const,
    date: '01 May 2026',
  },
  {
    id: 'INV-202604',
    period: 'Abril 2026',
    amount: '$1,490',
    status: 'pagada' as const,
    date: '01 Abr 2026',
  },
  {
    id: 'INV-202603',
    period: 'Marzo 2026',
    amount: '$1,490',
    status: 'pagada' as const,
    date: '01 Mar 2026',
  },
];

export const BillingScreen = () => (
  <div className="flex flex-col gap-6 pb-8">
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-medium text-ink">Facturación</h1>
        <p className="mt-1 text-sm text-ink-400 max-w-xl">
          Tu plan Kobi, método de pago y historial. La integración con cobro automático llegará en
          un sprint próximo.
        </p>
      </div>
      <PreviewBadge variant="soon" />
    </header>

    {/* Plan + Método de pago */}
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-card-gap">
      {/* Plan actual */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <header className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Plan actual</p>
            <p className="mt-1 text-2xl font-medium text-ink">Crecimiento</p>
          </div>
          <StatusPill variant="ok">Activo</StatusPill>
        </header>
        <dl className="space-y-2 text-sm">
          <Row label="Precio mensual" value="$1,490 MXN" />
          <Row label="Próxima renovación" value="01 jun 2026" />
          <Row label="Forma de cobro" value="Cargo automático" />
        </dl>
        <button
          type="button"
          disabled
          className="mt-4 h-9 w-full rounded-md border border-line-2 text-sm font-medium text-ink-300 cursor-not-allowed bg-surface-2"
        >
          Cambiar plan — Próximamente
        </button>
      </div>

      {/* Método de pago */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <header className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
            Método de pago
          </p>
          <IconCreditCard size={18} className="text-ink-400" />
        </header>
        <div className="rounded-lg border border-dashed border-line-2 bg-canvas p-6 text-center">
          <p className="text-sm font-medium text-ink">Sin método de pago</p>
          <p className="mt-1 text-xs text-ink-400">
            Agregaremos una tarjeta cuando el cobro automático esté disponible.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 h-9 rounded-md border border-line-2 px-4 text-sm font-medium text-ink-300 cursor-not-allowed bg-surface-2"
          >
            Agregar tarjeta — Próximamente
          </button>
        </div>
      </div>
    </section>

    {/* Historial */}
    <section className="bg-surface border border-line rounded-lg p-card">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <IconReceipt size={14} />
          Historial de facturas
        </h2>
        <span className="text-[11px] text-ink-400">datos de ejemplo</span>
      </header>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-ink-400 border-b border-line">
            {['Factura', 'Período', 'Fecha', 'Monto', 'Estado', ''].map((h) => (
              <th key={h} className="text-left py-2 px-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {SAMPLE_INVOICES.map((inv) => (
            <tr key={inv.id}>
              <td className="py-2 px-2 font-mono text-ink-200">{inv.id}</td>
              <td className="py-2 px-2 text-ink-200">{inv.period}</td>
              <td className="py-2 px-2 font-mono text-ink-300">{inv.date}</td>
              <td className="py-2 px-2 font-mono font-medium text-ink">{inv.amount}</td>
              <td className="py-2 px-2">
                <StatusPill variant="ok">Pagada</StatusPill>
              </td>
              <td className="py-2 px-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 text-xs text-ink-400 cursor-not-allowed"
                >
                  <IconDownload size={12} /> PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </div>
);

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-mono text-ink-200">{value}</dd>
    </div>
  );
}
