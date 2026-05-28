'use client';

import { type CentsMXN, cents, formatMXN } from '@kobi/shared';
import { Button } from '@kobi/ui';
import { IconPrinter, IconReceipt } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { type ShiftSummary, endShiftAndSignOut } from '../../lib/operations/shift-actions';

// ---------------------------------------------------------------------------
// Denominaciones
// ---------------------------------------------------------------------------

// Paleta desaturada — mantiene asociación visual pero alejada del rojo Miztli.
const BILLETES = [
  { valor: 1000, color: '#4A7C59' },
  { valor: 500, color: '#8B6F47' },
  { valor: 200, color: '#A36480' },
  { valor: 100, color: '#B45A52' },
  { valor: 50, color: '#C97B3A' },
  { valor: 20, color: '#4A6FA5' },
];

const MONEDAS = [
  { valor: 10, label: '$10' },
  { valor: 5, label: '$5' },
  { valor: 2, label: '$2' },
  { valor: 1, label: '$1' },
];

const TERMINALES = [
  { key: 'visa_mc', label: 'Visa / MC' },
  { key: 'amex', label: 'Amex' },
  { key: 'spei', label: 'SPEI' },
  { key: 'vales', label: 'Vales de despensa' },
];

const TOLERANCIA = 5000; // $50 MXN en centavos

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(c: CentsMXN): string {
  return formatMXN(c);
}

const PILL_CLS: Record<string, string> = {
  ok: 'bg-ok-soft text-ok-text',
  danger: 'bg-danger-soft text-danger-text',
  warn: 'bg-warn-soft text-warn-text',
};

/**
 * Estado del arqueo: cuadrado (dentro de tolerancia, verde), faltante (rojo)
 * o sobrante (amarillo). No bloquea el cierre — solo informa.
 */
function diffState(diff: number): { label: string; cls: string } {
  if (Math.abs(diff) <= TOLERANCIA) return { label: 'Cuadrado', cls: 'ok' };
  if (diff < 0) return { label: 'Faltante · revisar', cls: 'danger' };
  return { label: 'Sobrante · revisar', cls: 'warn' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CajaScreen = ({ summary }: { summary: ShiftSummary }) => {
  const [isPending, startTransition] = useTransition();

  const [billetes, setBilletes] = useState<Record<number, string>>({});
  const [monedas, setMonedas] = useState<Record<number, string>>({});
  const [terminales, setTerminales] = useState<Record<string, string>>({});
  const [tipElectronic, setTipElectronic] = useState('');
  const [tipCash, setTipCash] = useState('');
  const [revealed, setRevealed] = useState(false);

  // Esperado en caja = fondo inicial + ventas en efectivo del turno.
  const openingFloat = summary.opening_float_cents;
  const cashSales = summary.cash_total_cents;
  const expectedCash = openingFloat + cashSales;
  const cardExpected = summary.card_total_cents;
  const grossSales = summary.total_sold_cents;

  const totalBilletes = BILLETES.reduce((sum, b) => {
    const qty = Number(billetes[b.valor] ?? 0);
    return sum + qty * b.valor * 100;
  }, 0);

  const totalMonedas = MONEDAS.reduce((sum, m) => {
    const qty = Number(monedas[m.valor] ?? 0);
    return sum + qty * m.valor * 100;
  }, 0);

  const totalTerminales = TERMINALES.reduce((sum, t) => {
    const val = Number(terminales[t.key] ?? 0);
    return sum + Math.round(val * 100);
  }, 0);

  const efectivoDeclared = totalBilletes + totalMonedas;
  const efectivoDeclaredCents = cents(efectivoDeclared);
  const terminalDeclaredCents = cents(totalTerminales);

  const efectivoDiff = efectivoDeclared - expectedCash;
  const terminalDiff = totalTerminales - cardExpected;
  const efectivoState = diffState(efectivoDiff);
  const terminalState = diffState(terminalDiff);

  const handleCerrarTurno = () => {
    // Persiste el arqueo (esperado = fondo + efectivo) y cierra sesión.
    // No se bloquea por diferencia — el gerente decide al revisar el corte.
    startTransition(async () => {
      await endShiftAndSignOut(efectivoDeclaredCents);
    });
  };

  // Escape hatch: cerrar el turno sin contar efectivo. closed_at y totales del
  // sistema sí se persisten; cash_counted_cents queda null. No bloquea al cajero
  // apurado pero exige confirmación porque pierde la trazabilidad del arqueo.
  const handleCerrarSinContar = () => {
    if (
      !window.confirm(
        'Vas a cerrar el turno sin contar el efectivo. El sistema registrará el cierre y los totales calculados, pero no quedará registrado el efectivo contado ni la diferencia. ¿Continuar?',
      )
    )
      return;
    startTransition(async () => {
      await endShiftAndSignOut(null);
    });
  };

  return (
    <div className="h-full flex flex-col gap-section-sm">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
          Corte de caja
        </p>
        <h1 className="text-xl font-medium text-ink">Declara el efectivo en caja</h1>
        <p className="text-sm text-ink-300 mt-0.5">Cuenta el dinero sin ver el total del sistema</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-0">
        {/* ── Columna izquierda: conteo físico ── */}
        <div className="lg:flex-[55] flex flex-col gap-4 overflow-y-auto">
          {/* Billetes */}
          <div className="bg-surface border border-line rounded-lg p-card">
            <h2 className="text-sm font-semibold text-ink mb-4">Billetes</h2>
            <div className="grid grid-cols-2 gap-3">
              {BILLETES.map((b) => {
                const qty = Number(billetes[b.valor] ?? 0);
                const subtotal = qty * b.valor;
                return (
                  <div key={b.valor} className="flex items-center gap-3">
                    <div
                      className="h-8 w-16 rounded flex items-center justify-center shrink-0"
                      style={{ background: b.color }}
                    >
                      <span className="text-white text-xs font-semibold font-mono">${b.valor}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={billetes[b.valor] ?? ''}
                      onChange={(e) =>
                        setBilletes((prev) => ({ ...prev, [b.valor]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-16 h-8 rounded border border-line-2 bg-canvas px-2 text-sm font-mono text-ink text-right focus:outline-none focus:border-brand"
                    />
                    <span className="font-mono text-sm text-ink-300 w-20 text-right">
                      {subtotal > 0 ? `$${subtotal.toLocaleString('es-MX')}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Monedas */}
            <div className="mt-4 pt-4 border-t border-line">
              <h3 className="text-xs font-semibold text-ink-400 mb-3">Monedas</h3>
              <div className="flex gap-3 flex-wrap">
                {MONEDAS.map((m) => (
                  <div key={m.valor} className="flex items-center gap-1.5">
                    <div className="h-7 w-7 rounded-full bg-canvas border border-line flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-ink-200">{m.label}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={monedas[m.valor] ?? ''}
                      onChange={(e) =>
                        setMonedas((prev) => ({ ...prev, [m.valor]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-14 h-7 rounded border border-line-2 bg-canvas px-1.5 text-sm font-mono text-ink text-right focus:outline-none focus:border-brand"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Terminales */}
          <div className="bg-surface border border-line rounded-lg p-card">
            <h2 className="text-sm font-semibold text-ink mb-4">Vouchers de terminales</h2>
            <div className="space-y-3">
              {TERMINALES.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-200 w-36 shrink-0">{t.label}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={terminales[t.key] ?? ''}
                    onChange={(e) =>
                      setTerminales((prev) => ({ ...prev, [t.key]: e.target.value }))
                    }
                    placeholder="0.00"
                    className="flex-1 h-8 rounded border border-line-2 bg-canvas px-2 text-sm font-mono text-ink text-right focus:outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-line flex justify-between">
              <span className="text-sm text-ink-400">Total terminales</span>
              <span className="font-mono text-sm text-ink">{fmt(terminalDeclaredCents)}</span>
            </div>
          </div>

          {/* Propinas del turno (declaración) */}
          <div className="bg-surface border border-line rounded-lg p-card">
            <div className="mb-4">
              <h3 className="text-base font-medium text-ink">Propinas del turno</h3>
              <p className="text-sm text-ink-400 mt-1">
                Declara las propinas recibidas. No se incluyen en la diferencia de caja.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-card-gap">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-ink-400"
                  htmlFor="tip-electronic"
                >
                  Electrónicas (terminal + sitio)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-ink-400 font-mono text-sm">$</span>
                  <input
                    id="tip-electronic"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={tipElectronic}
                    onChange={(e) => setTipElectronic(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-9 rounded border border-line-2 bg-canvas px-2 font-mono text-sm text-ink text-right focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide text-ink-400"
                  htmlFor="tip-cash"
                >
                  En efectivo
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-ink-400 font-mono text-sm">$</span>
                  <input
                    id="tip-cash"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={tipCash}
                    onChange={(e) => setTipCash(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-9 rounded border border-line-2 bg-canvas px-2 font-mono text-sm text-ink text-right focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
              <span className="text-sm text-ink-300">Total propinas</span>
              <span className="font-mono text-lg font-semibold text-ink">
                $
                {(
                  (Number.parseFloat(tipElectronic) || 0) + (Number.parseFloat(tipCash) || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total declarado */}
          <div className="bg-ink rounded-lg px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Total declarado en efectivo</span>
            <span className="font-mono text-2xl font-semibold text-white tabular-nums">
              {fmt(efectivoDeclaredCents)}
            </span>
          </div>

          <Button className="w-full" onClick={() => setRevealed(true)} disabled={revealed}>
            Calcular diferencia
          </Button>
        </div>

        {/* ── Columna derecha: sistema + arqueo ── */}
        <div
          className={`lg:flex-[45] flex flex-col gap-4 overflow-y-auto transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0 pointer-events-none hidden lg:flex'}`}
        >
          {/* Ventas del sistema */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-3">
            <h2 className="text-sm font-semibold text-ink">Ventas del sistema</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Ventas brutas del turno</span>
              <span className="font-mono text-ink">{fmt(cents(grossSales))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Fondo inicial</span>
              <span className="font-mono text-ink">{fmt(cents(openingFloat))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Ventas en efectivo</span>
              <span className="font-mono text-ink">{fmt(cents(cashSales))}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-line">
              <span className="font-medium text-ink">Esperado en caja</span>
              <span className="font-mono font-semibold text-ink">{fmt(cents(expectedCash))}</span>
            </div>
          </div>

          {/* Comparativa efectivo */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-2">
            <h2 className="text-sm font-semibold text-ink mb-3">Diferencia de efectivo</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Esperado (fondo + efectivo)</span>
              <span className="font-mono text-ink">{fmt(cents(expectedCash))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Declarado</span>
              <span className="font-mono text-ink">{fmt(efectivoDeclaredCents)}</span>
            </div>
            <div className="border-t border-line my-2" />
            <div className="flex justify-between text-sm items-center">
              <span className="font-medium text-ink">Diferencia</span>
              <span
                className={`font-mono font-semibold ${efectivoDiff >= 0 ? 'text-ok' : 'text-danger'}`}
              >
                {efectivoDiff >= 0 ? '+' : ''}
                {fmt(cents(efectivoDiff))}
              </span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${PILL_CLS[efectivoState.cls]}`}
              >
                {efectivoState.label}
              </span>
            </div>
          </div>

          {/* Comparativa terminal */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-2">
            <h2 className="text-sm font-semibold text-ink mb-3">Diferencia de terminal</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Esperado</span>
              <span className="font-mono text-ink">{fmt(cents(cardExpected))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Declarado</span>
              <span className="font-mono text-ink">{fmt(terminalDeclaredCents)}</span>
            </div>
            <div className="border-t border-line my-2" />
            <div className="flex justify-between text-sm items-center">
              <span className="font-medium text-ink">Diferencia</span>
              <span
                className={`font-mono font-semibold ${terminalDiff >= 0 ? 'text-ok' : 'text-danger'}`}
              >
                {terminalDiff >= 0 ? '+' : ''}
                {fmt(cents(terminalDiff))}
              </span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${PILL_CLS[terminalState.cls]}`}
              >
                {terminalState.label}
              </span>
            </div>
          </div>

          {/* Resumen propinas */}
          <div className="bg-surface border border-line rounded-lg p-card">
            <h2 className="text-sm font-semibold text-ink mb-3">Propinas declaradas</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Electrónicas</span>
                <span className="font-mono text-ink">${tipElectronic || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-300">Efectivo</span>
                <span className="font-mono text-ink">${tipCash || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-line">
                <span className="font-medium text-ink">Total propinas</span>
                <span className="font-mono font-semibold text-ink">
                  $
                  {(
                    (Number.parseFloat(tipElectronic) || 0) + (Number.parseFloat(tipCash) || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer acciones */}
          <div className="flex flex-col gap-2 pb-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                leftIcon={<IconPrinter size={16} />}
                className="flex-1"
                onClick={() => {}}
              >
                Reimprimir corte
              </Button>
              <Button
                leftIcon={<IconReceipt size={16} />}
                className="flex-1"
                disabled={isPending}
                onClick={handleCerrarTurno}
              >
                {isPending ? 'Cerrando…' : 'Cerrar turno e imprimir'}
              </Button>
            </div>
            <button
              type="button"
              onClick={handleCerrarSinContar}
              disabled={isPending}
              className="text-xs text-ink-400 hover:text-ink-200 hover:underline disabled:opacity-50 text-center py-1"
            >
              Cerrar sin contar efectivo
            </button>
          </div>
        </div>
      </div>

      {/* Acción de cerrar sin contar — también disponible antes de revelar */}
      {!revealed && (
        <div className="shrink-0 pt-1">
          <button
            type="button"
            onClick={handleCerrarSinContar}
            disabled={isPending}
            className="text-xs text-ink-400 hover:text-ink-200 hover:underline disabled:opacity-50"
          >
            Cerrar turno sin contar efectivo
          </button>
        </div>
      )}
    </div>
  );
};
