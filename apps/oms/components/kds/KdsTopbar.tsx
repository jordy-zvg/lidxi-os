import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

interface KpiProps {
  label: string;
  value: string | number;
  valueClass?: string;
}

const Kpi = ({ label, value, valueClass = 'text-dark-ink' }: KpiProps) => (
  <div className="flex items-baseline gap-1.5">
    <span className="text-xs text-dark-ink-300">{label}</span>
    <span className={`font-mono text-sm font-semibold tabular-nums ${valueClass}`}>{value}</span>
  </div>
);

interface KdsTopbarProps {
  stationName?: string;
  activeCount: number;
  lateCount: number;
  avgTime: string;
}

export const KdsTopbar = ({
  stationName = 'Cocina principal',
  activeCount,
  lateCount,
  avgTime,
}: KdsTopbarProps) => (
  <header className="h-14 shrink-0 bg-dark-canvas border-b border-dark-line flex items-center px-6 gap-4">
    <div className="flex items-center gap-3 shrink-0">
      <div className="h-7 w-7 rounded bg-[#635BFF] flex items-center justify-center text-white font-bold text-sm select-none">
        K
      </div>
      <span className="text-sm font-medium text-dark-ink-300">KDS</span>
      <div className="w-px h-4 bg-dark-line" />
      <span className="text-sm font-medium text-dark-ink">{stationName}</span>
    </div>

    <div className="flex-1 flex items-center justify-center gap-6">
      <Kpi label="Activos" value={activeCount} />
      <div className="w-px h-4 bg-dark-line" />
      <Kpi label="+10 min" value={lateCount} valueClass="text-dark-warn" />
      <div className="w-px h-4 bg-dark-line" />
      <Kpi label="Prom." value={avgTime} />
    </div>

    <Link
      href="/pedidos"
      className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-md border border-dark-line text-sm font-medium text-dark-ink-300 hover:bg-dark-surface transition-colors"
    >
      <IconArrowLeft size={16} />
      Volver al OMS
    </Link>
  </header>
);
