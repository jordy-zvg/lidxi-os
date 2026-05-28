'use client';

import { Button } from '@kobi/ui';
import { useEffect, useState, useTransition } from 'react';
import { getShiftCashState, setShiftOpeningFloat } from '../../lib/operations/shift-actions';
import { BILLETES, MONEDAS, sumDenominationsCents } from './denominations';

function pesos(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Gate de apertura de caja: si el turno activo aún no tiene fondo inicial
 * capturado, muestra un modal antes de operar. El fondo se cuenta por
 * denominación (mismo patrón que el arqueo al cierre) y el total se deriva
 * automáticamente. "Omitir" deja el fondo en $0 (válido — el arqueo al cierre
 * lo trata como 0).
 */
export function OpeningFloatGate() {
  const [show, setShow] = useState(false);
  const [billetes, setBilletes] = useState<Record<number, string>>({});
  const [monedas, setMonedas] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await getShiftCashState();
      if (!cancelled && r.ok && !r.data.opening_float_set) setShow(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const totalCents = sumDenominationsCents(billetes, monedas);

  const submit = (cents: number) => {
    setError(null);
    startTransition(async () => {
      const r = await setShiftOpeningFloat(cents);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setShow(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-ink">Abrir caja</h2>
        <p className="mt-1 text-sm text-ink-400">
          Cuenta el fondo inicial por denominación. El total se usará para el arqueo al cierre del
          turno.
        </p>

        {/* Billetes */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Billetes
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {BILLETES.map((b) => (
              <div key={b.valor} className="flex items-center gap-2">
                <div
                  className="flex h-7 w-12 shrink-0 items-center justify-center rounded"
                  style={{ background: b.color }}
                >
                  <span className="font-mono text-[11px] font-semibold text-white">${b.valor}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={billetes[b.valor] ?? ''}
                  onChange={(e) => setBilletes((prev) => ({ ...prev, [b.valor]: e.target.value }))}
                  placeholder="0"
                  className="h-8 w-full rounded border border-line-2 bg-canvas px-2 text-right font-mono text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Monedas */}
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Monedas</p>
          <div className="flex flex-wrap gap-2.5">
            {MONEDAS.map((m) => (
              <div key={m.valor} className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-canvas">
                  <span className="text-[10px] font-semibold text-ink-200">{m.label}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={monedas[m.valor] ?? ''}
                  onChange={(e) => setMonedas((prev) => ({ ...prev, [m.valor]: e.target.value }))}
                  placeholder="0"
                  className="h-6 w-14 rounded border border-line-2 bg-canvas px-1.5 text-right font-mono text-sm text-ink focus:border-brand focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total derivado */}
        <div className="mt-4 flex items-center justify-between rounded-md bg-canvas px-4 py-2.5">
          <span className="text-sm text-ink-300">Fondo inicial</span>
          <span className="font-mono text-lg font-semibold tabular-nums text-ink">
            {pesos(totalCents)}
          </span>
        </div>

        {error && <p className="mt-2 text-xs text-danger-text">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => submit(0)}
            disabled={isPending}
            className="h-10 rounded-md border border-line-2 px-4 text-sm text-ink-200 hover:bg-surface-2 disabled:opacity-40"
          >
            Omitir (fondo $0)
          </button>
          <Button className="flex-1" onClick={() => submit(totalCents)} disabled={isPending}>
            {isPending ? 'Guardando…' : 'Confirmar fondo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
