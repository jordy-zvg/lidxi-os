'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const BARS = [
  { label: 'Uber Eats', pct: 28, color: 'bg-ink/15', textColor: 'text-ink/50' },
  { label: 'Rappi', pct: 27, color: 'bg-ink/12', textColor: 'text-ink/50' },
  { label: 'Didi Food', pct: 25, color: 'bg-ink/10', textColor: 'text-ink/50' },
  { label: 'Tu storefront', pct: 8, color: 'bg-[#635BFF]', textColor: 'text-[#635BFF]' },
];

const MAX_PCT = 30;

export function SavingsChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="space-y-4">
      {/* Scale labels */}
      <div className="ml-28 flex justify-between text-[10px] font-mono text-ink/30">
        <span>0%</span>
        <span>10%</span>
        <span>20%</span>
        <span>30%</span>
      </div>

      {/* Bars */}
      {BARS.map((bar, i) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-right text-sm text-ink/60">{bar.label}</span>
          <div className="relative flex-1 h-6 rounded bg-ink/5">
            {/* Grid lines */}
            {[10, 20, 30].map((tick) => (
              <div
                key={tick}
                className="absolute top-0 bottom-0 w-px bg-ink/8"
                style={{ left: `${(tick / MAX_PCT) * 100}%` }}
              />
            ))}
            {/* Animated bar */}
            <motion.div
              className={`absolute left-0 top-0 bottom-0 rounded ${bar.color}`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${(bar.pct / MAX_PCT) * 100}%` } : { width: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.21, 0.47, 0.32, 0.98],
                delay: i * 0.15,
              }}
            />
          </div>
          <span className={`w-10 shrink-0 font-mono text-sm font-semibold ${bar.textColor}`}>
            {bar.pct}%
          </span>
        </div>
      ))}

      <p className="ml-28 mt-2 text-xs text-ink/40">
        * Comisiones promedio de marketplace. Storefront incluye costos de Uber Direct (7-10%).
      </p>
    </div>
  );
}
