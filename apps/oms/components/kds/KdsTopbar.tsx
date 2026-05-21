import { IconArrowLeft, IconEye } from '@tabler/icons-react';
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
  <header className="h-14 shrink-0 bg-dark-canvas border-b border-dark-line flex items-center px-3 sm:px-6 gap-2 sm:gap-4">
    <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
      <div className="h-7 w-7 rounded bg-[#635BFF] flex items-center justify-center text-white font-bold text-sm select-none">
        K
      </div>
      <span className="text-sm font-medium text-dark-ink-300 hidden sm:inline">KDS</span>
      <div className="w-px h-4 bg-dark-line hidden sm:block" />
      <span className="text-sm font-medium text-dark-ink truncate max-w-[140px] sm:max-w-none">
        {stationName}
      </span>
      <span className="hidden md:inline-flex ml-1 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
        <IconEye size={11} />
        Vista previa · datos de ejemplo
      </span>
    </div>

    <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 min-w-0">
      <Kpi label="Activos" value={activeCount} />
      <div className="w-px h-4 bg-dark-line" />
      <Kpi label="+10 min" value={lateCount} valueClass="text-dark-warn" />
      <div className="hidden sm:block w-px h-4 bg-dark-line" />
      <div className="hidden sm:block">
        <Kpi label="Prom." value={avgTime} />
      </div>
    </div>

    <Link
      href="/pedidos"
      className="shrink-0 flex items-center gap-1.5 h-9 px-2 sm:px-3 rounded-md border border-dark-line text-xs sm:text-sm font-medium text-dark-ink-300 hover:bg-dark-surface transition-colors"
    >
      <IconArrowLeft size={16} />
      <span className="hidden sm:inline">Volver al OMS</span>
    </Link>
  </header>
);
