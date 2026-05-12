import { cn } from '@lidxi/shared';
import type { Station, Ticket } from './mock-tickets';

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

const FilterChip = ({ label, count, active, onClick }: FilterChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'h-9 px-4 rounded-full text-sm font-medium border transition-colors',
      active
        ? 'bg-dark-brand-soft text-dark-brand-text border-dark-brand'
        : 'bg-transparent text-dark-ink-300 border-dark-line hover:border-dark-line-2',
    )}
  >
    {label} · {count}
  </button>
);

interface KdsStationFiltersProps {
  active: Station;
  onChange: (station: Station) => void;
  tickets: Ticket[];
}

export const KdsStationFilters = ({ active, onChange, tickets }: KdsStationFiltersProps) => {
  const count = (station: Station) =>
    station === 'all' ? tickets.length : tickets.filter((t) => t.station === station).length;

  return (
    <div className="h-12 shrink-0 bg-dark-surface border-b border-dark-line flex items-center px-6 gap-2">
      <FilterChip
        label="Todos"
        count={count('all')}
        active={active === 'all'}
        onClick={() => onChange('all')}
      />
      <FilterChip
        label="Caliente"
        count={count('hot')}
        active={active === 'hot'}
        onClick={() => onChange('hot')}
      />
      <FilterChip
        label="Fría"
        count={count('cold')}
        active={active === 'cold'}
        onClick={() => onChange('cold')}
      />
      <FilterChip
        label="Empaque"
        count={count('pack')}
        active={active === 'pack'}
        onClick={() => onChange('pack')}
      />
    </div>
  );
};
