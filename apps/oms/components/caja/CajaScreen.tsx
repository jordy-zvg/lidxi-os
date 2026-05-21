'use client';

import { formatMXN } from '@kobi/shared';
import { type CentsMXN, cents } from '@kobi/shared';
import { Button, StatusPill } from '@kobi/ui';
import { IconPrinter, IconReceipt } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useState } from 'react';
import { closeShiftAndSignOut } from '../../lib/auth-actions';

// ---------------------------------------------------------------------------
// Mock data del turno actual
// ---------------------------------------------------------------------------

const MOCK_TURNO = {
  ventas_brutas: cents(1284700),
  efectivo_esperado: cents(843200),
  terminal_esperado: cents(441500),
  por_canal: {
    direct: cents(387400),
    eats: cents(489200),
    rappi: cents(267100),
    didi: cents(141000),
    mostrador: cents(0),
  },
  hora_inicio: '11:08',
  hora_fin: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
};

// ---------------------------------------------------------------------------
// Denominaciones
// ---------------------------------------------------------------------------

// Paleta desaturada — mantiene asociación visual (verde=$1000, marrón=$500,
// magenta=$200, coral=$100, naranja=$50, azul=$20) pero alejada del rojo
// Miztli (#E11D2E). El $100 en particular pasa de rojo brillante a coral
// oscuro, perceptualmente distinto.
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

const CH_COLORS: Record<string, string> = {
  direct: 'var(--brand)',
  eats: 'var(--ch-eats)',
  rappi: 'var(--ch-rappi)',
  didi: 'var(--ch-didi)',
  mostrador: 'var(--ch-mostrador)',
};
const CH_LABELS: Record<string, string> = {
  direct: 'Uber Direct',
  eats: 'Uber Eats',
  rappi: 'Rappi',
  didi: 'Didi Food',
  mostrador: 'Mostrador',
};

const TOLERANCIA = 5000; // $50 MXN en centavos

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(c: CentsMXN): string {
  return formatMXN(c);
}

function diffClass(diff: number): 'ok' | 'danger' {
  return Math.abs(diff) <= TOLERANCIA ? 'ok' : 'danger';
}

// ---------------------------------------------------------------------------
// Mini Donut SVG
// ---------------------------------------------------------------------------

function DonutChart({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;
  const r = 44;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg
        width={100}
        height={100}
        viewBox="0 0 100 100"
        className="shrink-0"
        role="img"
        aria-label="Distribución por canal"
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={12} />
        {slices
          .filter((s) => s.value > 0)
          .map((slice) => {
            const pct = slice.value / total;
            const dash = pct * circumference;
            const el = (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={12}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            );
            offset += dash;
            return el;
          })}
        <circle cx={cx} cy={cy} r={30} fill="var(--surface)" />
      </svg>
      <div className="space-y-1.5">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-ink-200">{s.label}</span>
            <span className="font-mono text-ink-300 ml-auto pl-3">
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CajaScreen = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Billetes y monedas
  const [billetes, setBilletes] = useState<Record<number, string>>({});
  const [monedas, setMonedas] = useState<Record<number, string>>({});
  const [terminales, setTerminales] = useState<Record<string, string>>({});
  const [tipElectronic, setTipElectronic] = useState('');
  const [tipCash, setTipCash] = useState('');
  const [revealed, setRevealed] = useState(false);

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

  const efectivoDiff = efectivoDeclared - MOCK_TURNO.efectivo_esperado;
  const terminalDiff = totalTerminales - MOCK_TURNO.terminal_esperado;

  const handleCerrarTurno = () => {
    startTransition(async () => {
      await closeShiftAndSignOut();
      router.push('/login');
    });
  };

  const donutSlices = Object.entries(MOCK_TURNO.por_canal).map(([key, val]) => ({
    label: CH_LABELS[key] ?? key,
    value: val,
    color: CH_COLORS[key] ?? 'var(--ink-5)',
  }));

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
        {/* ── Columna izquierda ── */}
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
                {MONEDAS.map((m) => {
                  return (
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
                  );
                })}
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

          {/* Propinas del turno */}
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
                <p className="text-xs text-ink-400">
                  Incluye propinas del datáfono y del sitio propio.
                </p>
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
                <p className="text-xs text-ink-400">
                  Propinas físicas separadas del efectivo de ventas.
                </p>
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

        {/* ── Columna derecha ── */}
        <div
          className={`lg:flex-[45] flex flex-col gap-4 overflow-y-auto transition-opacity duration-500 ${revealed ? 'opacity-100' : 'opacity-0 pointer-events-none hidden lg:flex'}`}
        >
          {/* Ventas del sistema */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-3">
            <h2 className="text-sm font-semibold text-ink">Ventas del sistema</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Ventas brutas del turno</span>
              <span className="font-mono text-ink">{fmt(MOCK_TURNO.ventas_brutas)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Efectivo esperado en caja</span>
              <span className="font-mono text-ink">{fmt(MOCK_TURNO.efectivo_esperado)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-200">Terminal esperada</span>
              <span className="font-mono text-ink">{fmt(MOCK_TURNO.terminal_esperado)}</span>
            </div>
          </div>

          {/* Comparativa efectivo */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-2">
            <h2 className="text-sm font-semibold text-ink mb-3">Diferencia de efectivo</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Esperado</span>
              <span className="font-mono text-ink">{fmt(MOCK_TURNO.efectivo_esperado)}</span>
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
              <StatusPill variant={diffClass(efectivoDiff)}>
                {Math.abs(efectivoDiff) <= TOLERANCIA
                  ? 'Dentro de tolerancia'
                  : 'Fuera de tolerancia · revisar'}
              </StatusPill>
            </div>
          </div>

          {/* Comparativa terminal */}
          <div className="bg-surface border border-line rounded-lg p-card space-y-2">
            <h2 className="text-sm font-semibold text-ink mb-3">Diferencia de terminal</h2>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Esperado</span>
              <span className="font-mono text-ink">{fmt(MOCK_TURNO.terminal_esperado)}</span>
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
              <StatusPill variant={diffClass(terminalDiff)}>
                {Math.abs(terminalDiff) <= TOLERANCIA
                  ? 'Dentro de tolerancia'
                  : 'Fuera de tolerancia · revisar'}
              </StatusPill>
            </div>
          </div>

          {/* Distribución por canal */}
          <div className="bg-surface border border-line rounded-lg p-card">
            <h2 className="text-sm font-semibold text-ink mb-4">Distribución por canal</h2>
            <DonutChart slices={donutSlices} />
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
            {revealed && tipElectronic && Math.abs(Number.parseFloat(tipElectronic) - 284) > 1 && (
              <div className="mt-3 p-3 bg-warn-soft rounded-md">
                <p className="text-xs text-warn-text">
                  Las propinas electrónicas declaradas (${tipElectronic}) no coinciden con lo
                  registrado por el sistema ($284.00). Revisa antes de cerrar.
                </p>
              </div>
            )}
          </div>

          {/* Footer acciones */}
          <div className="flex gap-2 pb-2">
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
        </div>
      </div>
    </div>
  );
};
