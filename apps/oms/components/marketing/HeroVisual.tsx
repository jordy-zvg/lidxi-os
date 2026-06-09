'use client';

import { motion } from 'framer-motion';

// Panel data constants
const KDS_TICKETS = [
  { id: 'RP-44102', items: 'Tacos al Pastor ×2', price: '$170', color: '#22c55e' },
  { id: 'UP-23901', items: 'Quesadilla Especial ×1', price: '$95', color: '#f59e0b' },
  { id: 'DD-11234', items: 'Ensalada César ×3', price: '$285', color: '#7C71FF' },
];

const OMS_COLUMNS = [
  { label: 'Recibido', count: 3, cards: ['#1201', '#1202', '#1203'] },
  { label: 'En cocina', count: 2, cards: ['#1198', '#1199'] },
  { label: 'Listo', count: 1, cards: ['#1197'] },
];

// Inner panel components
function KdsPanel() {
  return (
    <div className="h-full rounded-2xl bg-[#0A2540] p-4 text-xs">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="font-medium text-white/50 uppercase tracking-widest text-[10px]">
          KDS · Cocina
        </span>
      </div>
      <div className="space-y-2">
        {KDS_TICKETS.map((t) => (
          <div
            key={t.id}
            className="rounded-lg bg-white/5 p-2.5 flex items-center gap-2.5"
            style={{ borderLeft: `3px solid ${t.color}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-white/40">{t.id}</p>
              <p className="text-xs text-white/80 truncate">{t.items}</p>
            </div>
            <span className="font-mono text-[10px] text-white/50 shrink-0">{t.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OmsPanel() {
  return (
    <div className="h-full rounded-2xl bg-[#F6F9FC] border border-[#0A2540]/8 p-4 text-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#7C71FF]">Kobi</span>
        <span className="rounded-full bg-[#7C71FF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7C71FF]">
          28% ahorro
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {OMS_COLUMNS.map((col) => (
          <div key={col.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#0A2540]/50 uppercase tracking-wide">
                {col.label}
              </span>
              <span className="text-[10px] font-mono text-[#0A2540]/40">{col.count}</span>
            </div>
            <div className="space-y-1">
              {col.cards.map((id) => (
                <div key={id} className="rounded bg-white border border-[#0A2540]/8 p-1.5">
                  <p className="font-mono text-[9px] text-[#0A2540]/40">{id}</p>
                  <div className="mt-0.5 h-1 w-full rounded bg-[#0A2540]/8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryPanel() {
  return (
    <div className="rounded-2xl bg-white border border-[#0A2540]/10 p-4 shadow-lg text-xs">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#7C71FF] animate-pulse" />
        <span className="font-mono text-[10px] text-[#0A2540]/50">#1204 · Uber Direct</span>
      </div>
      <p className="text-xs font-medium text-[#0A2540]">En camino · 12 min</p>
      {/* Abstract map lines */}
      <div className="mt-3 rounded-lg bg-[#F6F9FC] p-3">
        <svg viewBox="0 0 160 60" className="w-full" aria-hidden="true">
          <path
            d="M10 30 Q40 10 80 30 Q120 50 150 20"
            stroke="#7C71FF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M10 45 Q50 35 90 45"
            stroke="#0A2540"
            strokeWidth="1"
            strokeOpacity="0.15"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="10" cy="30" r="4" fill="#7C71FF" />
          <circle cx="150" cy="20" r="4" fill="#22c55e" />
        </svg>
      </div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative h-[420px] w-full select-none" aria-hidden="true">
      {/* Panel A — KDS (back) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.05 }}
        className="absolute left-0 top-6 right-12 h-64"
        style={{ transform: 'rotate(-3deg)', zIndex: 1 }}
      >
        <KdsPanel />
      </motion.div>

      {/* Panel B — OMS (center) */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
        className="absolute inset-x-4 top-14 h-72 shadow-2xl shadow-[#7C71FF]/10"
        style={{ zIndex: 2 }}
      >
        <OmsPanel />
      </motion.div>

      {/* Panel C — Delivery (front) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.38 }}
        className="absolute right-0 bottom-0 w-52"
        style={{ transform: 'rotate(2deg)', zIndex: 3 }}
      >
        <DeliveryPanel />
      </motion.div>
    </div>
  );
}
