'use client';

import { motion } from 'framer-motion';

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  arranque: CellValue;
  crecimiento: CellValue;
  escala: CellValue;
}

interface FeatureGroup {
  group: string;
  rows: FeatureRow[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    group: 'Core',
    rows: [
      { label: 'POS y caja', arranque: true, crecimiento: true, escala: true },
      { label: 'KDS estaciones', arranque: '1', crecimiento: 'Ilimitado', escala: 'Ilimitado' },
      { label: 'Usuarios', arranque: '3', crecimiento: '10', escala: 'Ilimitado' },
      { label: 'Sucursales', arranque: '1', crecimiento: '1', escala: 'Ilimitado' },
    ],
  },
  {
    group: 'Canales y delivery',
    rows: [
      { label: 'Uber Eats', arranque: true, crecimiento: true, escala: true },
      { label: 'Rappi', arranque: false, crecimiento: true, escala: true },
      { label: 'Didi Food', arranque: false, crecimiento: true, escala: true },
      { label: 'Storefront propio', arranque: false, crecimiento: true, escala: true },
      { label: 'Uber Direct', arranque: false, crecimiento: true, escala: true },
    ],
  },
  {
    group: 'Automatización',
    rows: [
      { label: 'Reglas activas', arranque: '0', crecimiento: '10', escala: 'Ilimitado' },
      { label: 'Webhooks', arranque: false, crecimiento: '5', escala: 'Ilimitado' },
      { label: 'API', arranque: false, crecimiento: false, escala: true },
    ],
  },
  {
    group: 'Soporte',
    rows: [
      { label: 'Email', arranque: true, crecimiento: true, escala: true },
      { label: 'WhatsApp prioritario', arranque: false, crecimiento: true, escala: true },
      { label: 'Account manager', arranque: false, crecimiento: false, escala: true },
      { label: 'Onboarding dedicado', arranque: false, crecimiento: false, escala: true },
      { label: 'SLA garantizado', arranque: false, crecimiento: false, escala: true },
    ],
  },
];

function Cell({ value, highlighted }: { value: CellValue; highlighted?: boolean }) {
  const base = `px-4 py-3 text-center text-sm ${highlighted ? 'bg-[#7C71FF]/5' : ''}`;

  if (typeof value === 'boolean') {
    return (
      <td className={base}>
        {value ? <span className="text-[#7C71FF]">✓</span> : <span className="text-ink/20">—</span>}
      </td>
    );
  }

  return (
    <td className={base}>
      <span className={highlighted ? 'font-medium text-[#7C71FF]' : 'text-ink/60'}>{value}</span>
    </td>
  );
}

export function PricingFeatureTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm"
    >
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-ink/8">
            <th className="px-4 py-4 text-left text-xs font-medium text-ink/40">Feature</th>
            <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-ink/50">
              Arranque
            </th>
            <th className="bg-[#7C71FF]/5 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#7C71FF]">
              Crecimiento
            </th>
            <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-ink/50">
              Escala
            </th>
          </tr>
        </thead>
        <tbody>
          {FEATURE_GROUPS.map((group) => (
            <>
              <tr key={group.group} className="border-t border-ink/8 bg-ink/[0.015]">
                <td
                  colSpan={4}
                  className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ink/30"
                >
                  {group.group}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-ink/[0.06] hover:bg-ink/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-ink/70">{row.label}</td>
                  <Cell value={row.arranque} />
                  <Cell value={row.crecimiento} highlighted />
                  <Cell value={row.escala} />
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
