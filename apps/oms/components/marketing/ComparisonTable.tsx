'use client';

import { motion } from 'framer-motion';

export interface ComparisonRow {
  feature: string;
  kobi: boolean;
  wansoft: boolean;
  softRestaurant: boolean;
  parrot: boolean;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
}

const HEADERS = ['', 'Kobi', 'Wansoft', 'Soft Restaurant', 'Parrot'];

function Cell({ value, highlight }: { value: boolean; highlight?: boolean }) {
  return (
    <td className={`px-4 py-3 text-center ${highlight ? 'bg-[#7C71FF]/5' : ''}`}>
      {value ? (
        <span className="text-base text-[#7C71FF]">✓</span>
      ) : (
        <span className="text-base text-ink/20">✗</span>
      )}
    </td>
  );
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm"
    >
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-ink/8">
            {HEADERS.map((h, i) => (
              <th
                key={h || 'feature'}
                className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  i === 0
                    ? 'text-ink/40'
                    : i === 1
                      ? 'text-[#7C71FF] bg-[#7C71FF]/5'
                      : 'text-ink/40'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {rows.map((row) => (
            <tr key={row.feature} className="hover:bg-ink/[0.02]">
              <td className="px-4 py-3 text-sm text-ink/70">{row.feature}</td>
              <Cell value={row.kobi} highlight />
              <Cell value={row.wansoft} />
              <Cell value={row.softRestaurant} />
              <Cell value={row.parrot} />
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
