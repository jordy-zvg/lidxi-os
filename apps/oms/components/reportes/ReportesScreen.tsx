'use client';

import { cents, formatMXN } from '@kobi/shared';
import { useState } from 'react';
import { HEATMAP_DATA, HEATMAP_PEAK } from './mock-heatmap';
import { CH_COLORS, CH_LABELS, COMISIONES, MOCK_REPORTES } from './mock-reportes';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PERIODOS = ['Hoy', 'Esta semana', 'Este mes', 'Rango custom'];

// ---------------------------------------------------------------------------
// Donut SVG
// ---------------------------------------------------------------------------

function Donut({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;
  const r = 44;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      className="shrink-0"
      role="img"
      aria-label="Distribución por canal"
    >
      <circle cx={50} cy={50} r={r} fill="none" stroke="var(--line)" strokeWidth={12} />
      {slices.map((s) => {
        const dash = (s.value / total) * circumference;
        const el = (
          <circle
            key={s.label}
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={12}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={50} cy={50} r={30} fill="var(--surface)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  delta,
  warn,
}: {
  label: string;
  value: string;
  delta?: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-card">
      <p className="text-xs text-ink-400 mb-kpi-label">{label}</p>
      <p className="font-mono text-2xl font-semibold text-ink tabular-nums">{value}</p>
      {delta && (
        <p
          className={`text-xs font-mono mt-kpi-delta ${warn ? 'text-danger-text' : 'text-ok-text'}`}
        >
          {delta}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ReportesScreen = () => {
  const [periodo, setPeriodo] = useState('Este mes');

  const maxPedidos = HEATMAP_PEAK.pedidos;
  const picoCelda = HEATMAP_PEAK;

  const { por_canal, top_vendidos, top_rentables, embudo } = MOCK_REPORTES;

  const canalSlices = Object.entries(por_canal).map(([key, d]) => ({
    label: CH_LABELS[key] ?? key,
    value: d.ventas,
    color: CH_COLORS[key] ?? 'var(--ink-5)',
  }));

  const totalVentas = Object.values(por_canal).reduce((s, d) => s + d.ventas, 0);

  return (
    <div className="flex flex-col gap-section-sm overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-medium text-ink">Reportes</h1>
        <div className="flex items-center gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodo(p)}
              className={`h-8 px-3 rounded-md text-sm transition-colors ${
                periodo === p
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-line-2 text-ink-200 hover:bg-surface-2'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-card-gap">
        <KpiCard
          label="Ventas totales"
          value={formatMXN(MOCK_REPORTES.ventas_totales)}
          delta="+12% vs mes anterior"
        />
        <KpiCard
          label="Ticket promedio"
          value={formatMXN(MOCK_REPORTES.ticket_promedio)}
          delta="+4% vs mes anterior"
        />
        <KpiCard
          label="Tiempo preparación prom."
          value={`${MOCK_REPORTES.tiempo_prep_prom} min`}
          delta={`Objetivo: ${MOCK_REPORTES.objetivo_prep} min`}
          warn={MOCK_REPORTES.tiempo_prep_prom > MOCK_REPORTES.objetivo_prep}
        />
        <KpiCard
          label="Canal más rentable"
          value={CH_LABELS[MOCK_REPORTES.canal_mas_rentable] ?? '—'}
          delta={`${Math.round((1 - (COMISIONES[MOCK_REPORTES.canal_mas_rentable] ?? 0)) * 100)}% margen neto`}
        />
      </div>

      {/* Heatmap */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Horas pico</h2>
          {picoCelda && (
            <span className="text-xs font-mono text-ink-400">
              Hora pico: {DIAS[picoCelda.dia]} {picoCelda.hora}:00 · {picoCelda.pedidos} pedidos
            </span>
          )}
        </div>
        {/* Hora labels */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          <div className="w-10 shrink-0" />
          {DIAS.map((d) => (
            <div
              key={d}
              className="flex-1 text-center text-[10px] font-semibold text-ink-400 min-w-[32px]"
            >
              {d}
            </div>
          ))}
        </div>
        {Array.from({ length: 16 }, (_, i) => i + 8).map((hora) => (
          <div key={hora} className="flex gap-1 mb-1">
            <div className="w-10 shrink-0 text-right text-[10px] text-ink-500 pr-1 leading-6">
              {hora}h
            </div>
            {DIAS.map((dayName, dia) => {
              const cell = HEATMAP_DATA.find((c) => c.dia === dia && c.hora === hora);
              const val = cell?.pedidos ?? 0;
              const opacity = val / maxPedidos;
              const isPeak = val === maxPedidos;
              return (
                <div
                  key={`${hora}-${dayName}`}
                  className={`flex-1 h-6 rounded min-w-[32px] ${isPeak ? 'ring-1 ring-brand' : ''}`}
                  style={{
                    backgroundColor: `rgba(99, 91, 255, ${opacity * 0.8 + 0.05})`,
                  }}
                  title={`${dayName} ${hora}:00 · ${val} pedidos`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Canal breakdown */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <h2 className="text-sm font-semibold text-ink mb-4">Distribución por canal</h2>
        <div className="flex gap-6">
          <Donut slices={canalSlices} />
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-xs text-ink-400 border-b border-line">
                  {['Canal', 'Pedidos', 'Ventas', '% total', 'Comisión est.', 'Margen neto'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-row-header-y px-row-x font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {Object.entries(por_canal).map(([key, d]) => {
                  const comision = COMISIONES[key] ?? 0;
                  const margen = d.ventas * (1 - comision);
                  const pct = totalVentas > 0 ? Math.round((d.ventas / totalVentas) * 100) : 0;
                  return (
                    <tr key={key}>
                      <td className="py-row-y px-row-x">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: CH_COLORS[key] }}
                          />
                          <span className="font-medium text-ink">{CH_LABELS[key]}</span>
                        </div>
                      </td>
                      <td className="py-row-y px-row-x font-mono text-ink-200">{d.pedidos}</td>
                      <td className="py-row-y px-row-x font-mono text-ink">
                        {formatMXN(d.ventas)}
                      </td>
                      <td className="py-row-y px-row-x font-mono text-ink-300">{pct}%</td>
                      <td className="py-row-y px-row-x font-mono text-ink-300">
                        {comision > 0 ? `${Math.round(comision * 100)}%` : '—'}
                      </td>
                      <td className="py-row-y font-mono text-ok-text">
                        {formatMXN(cents(Math.round(margen)))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top productos */}
      <div className="grid grid-cols-2 gap-card-gap">
        <div className="bg-surface border border-line rounded-lg p-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Top 5 más vendidos</h2>
          <div className="space-y-2">
            {top_vendidos.map((p, i) => (
              <div key={p.nombre} className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-sm text-ink truncate">{p.nombre}</span>
                    <span className="font-mono text-xs text-ink-300 shrink-0">
                      {p.cantidad} uds
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${(p.cantidad / (top_vendidos[0]?.cantidad ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-line rounded-lg p-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Top 5 más rentables</h2>
          <div className="space-y-2">
            {top_rentables.map((p, i) => (
              <div key={p.nombre} className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-sm text-ink truncate">{p.nombre}</span>
                    <span className="font-mono text-xs text-ok-text shrink-0">
                      {Math.round(p.margen * 100)}% margen
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ok rounded-full"
                      style={{ width: `${p.margen * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embudo operativo */}
      <div className="bg-surface border border-line rounded-lg p-card">
        <h2 className="text-sm font-semibold text-ink mb-4">Embudo operativo</h2>
        <div className="space-y-2">
          {embudo.map((e, i) => {
            const dropOff = i > 0 ? (embudo[i - 1]?.pct ?? e.pct) - e.pct : 0;
            const warn = dropOff > 15;
            return (
              <div key={e.etapa} className="flex items-center gap-4">
                <span className="text-sm text-ink-200 w-36 shrink-0">{e.etapa}</span>
                <div className="flex-1 h-6 bg-canvas rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${warn ? 'bg-warn' : 'bg-brand'}`}
                    style={{ width: `${e.pct}%` }}
                  />
                </div>
                <span className="font-mono text-sm text-ink-300 w-12 text-right">{e.pct}%</span>
                <span className="font-mono text-xs text-ink-400 w-8 text-right">{e.n}</span>
                {i > 0 && (
                  <span
                    className={`text-xs font-mono w-16 ${warn ? 'text-warn-text' : 'text-ink-400'}`}
                  >
                    {dropOff > 0 ? `−${dropOff.toFixed(1)}pp` : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
