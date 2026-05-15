import { cents } from '@lidxi/shared';
import { formatDateMX, formatMXN, formatTimeMX } from '@lidxi/shared';
import { Button } from '@lidxi/ui';
import { IconCheck, IconPrinter } from '@tabler/icons-react';
import type { SaleResult } from './types';

interface ReciboViewProps {
  result: SaleResult;
  onNuevaVenta: () => void;
  onPrint: () => void;
}

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
};

export const ReciboView = ({ result, onNuevaVenta, onPrint }: ReciboViewProps) => (
  <div className="flex flex-col items-center justify-center h-full py-8 px-4">
    <div className="w-full max-w-sm">
      {/* Confirmación */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-ok-soft flex items-center justify-center mb-3">
          <IconCheck size={36} className="text-ok" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Venta registrada
        </p>
        <h1 className="text-2xl font-semibold text-ink mt-1">{result.folio}</h1>
        <p className="text-sm text-ink-400 mt-0.5 font-mono">
          {formatDateMX(result.createdAt)} · {formatTimeMX(result.createdAt)}
        </p>
      </div>

      {/* Recibo */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden mb-4">
        {/* Cliente */}
        <div className="px-4 py-2.5 border-b border-line">
          <p className="text-xs text-ink-400">Cliente</p>
          <p className="text-sm font-medium text-ink">{result.customerName || 'Mostrador'}</p>
        </div>

        {/* Items */}
        <div className="px-4 py-2">
          {result.items.map((line) => (
            <div key={line.id} className="flex justify-between text-sm py-1">
              <span className="text-ink-200">
                <span>
                  {line.qty}× {line.name}
                </span>
                {line.note && <span className="block text-xs text-brand ml-3">+ {line.note}</span>}
              </span>
              <span className="font-mono text-ink tabular-nums">
                {formatMXN(cents(line.unitPriceCents * line.qty))}
              </span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="border-t border-line px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm text-ink-300">
            <span>Subtotal</span>
            <span className="font-mono">{formatMXN(result.netCents)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-300">
            <span>IVA 16%</span>
            <span className="font-mono">{formatMXN(result.taxCents)}</span>
          </div>
          <div className="flex justify-between font-semibold text-ink border-t border-line pt-2">
            <span>Total</span>
            <span className="font-mono text-lg tabular-nums">{formatMXN(result.totalCents)}</span>
          </div>
        </div>

        {/* Pago */}
        <div className="border-t border-line px-4 py-3 space-y-1 bg-canvas">
          <div className="flex justify-between text-sm">
            <span className="text-ink-400">Forma de pago</span>
            <span className="font-medium text-ink">{PAYMENT_LABEL[result.paymentMethod]}</span>
          </div>
          {result.paidCents !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Recibido</span>
              <span className="font-mono text-ink tabular-nums">{formatMXN(result.paidCents)}</span>
            </div>
          )}
          {result.changeCents !== undefined && result.changeCents > 0 && (
            <div className="flex justify-between text-sm font-semibold text-ok-text">
              <span>Cambio</span>
              <span className="font-mono tabular-nums">{formatMXN(result.changeCents)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1.5 h-10 px-4 rounded border border-line-2 text-sm text-ink-200 hover:bg-surface-2 transition-colors"
        >
          <IconPrinter size={15} />
          Imprimir
        </button>
        <Button className="flex-1 h-10" onClick={onNuevaVenta}>
          Nueva venta
        </Button>
      </div>
    </div>
  </div>
);
