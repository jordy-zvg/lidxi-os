'use client';

import { Button } from '@kobi/ui';
import { useEffect, useState, useTransition } from 'react';
import { getShiftCashState, setShiftOpeningFloat } from '../../lib/operations/shift-actions';

/**
 * Gate de apertura de caja: si el turno activo aún no tiene fondo inicial
 * capturado, muestra un modal antes de operar. "Omitir" deja el fondo en $0
 * (válido — el arqueo al cierre lo trata como 0).
 */
export function OpeningFloatGate() {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState('');
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

  const handleConfirm = () => {
    const pesos = Number.parseFloat(amount);
    if (Number.isNaN(pesos) || pesos < 0) {
      setError('Monto inválido');
      return;
    }
    submit(Math.round(pesos * 100));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-ink">Abrir caja</h2>
        <p className="mt-1 text-sm text-ink-400">
          Captura el fondo inicial con el que abres la caja. Se usará para el arqueo al cierre del
          turno.
        </p>
        <label
          className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-400"
          htmlFor="opening-float"
        >
          Fondo inicial
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm text-ink-400">$</span>
          <input
            id="opening-float"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            // biome-ignore lint/a11y/noAutofocus: foco directo al único input del modal de apertura
            autoFocus
            className="h-10 flex-1 rounded-md border border-line-2 bg-canvas px-3 text-right font-mono text-sm text-ink focus:border-brand focus:outline-none"
          />
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
          <Button className="flex-1" onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Guardando…' : 'Confirmar fondo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
