import { cn } from '@kobi/shared';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Card } from './Card';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: 'up' | 'down'; tone?: 'positive' | 'negative' | 'neutral' };
  hint?: string;
  className?: string;
}

export const KpiCard = ({ label, value, delta, hint, className }: KpiCardProps) => (
  <Card padding="md" className={cn('flex flex-col gap-1', className)}>
    <div className="text-xs font-medium uppercase tracking-wide text-ink-300">{label}</div>
    <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
    {delta && (
      <div
        className={cn(
          'flex items-center gap-1 text-xs font-medium',
          delta.tone === 'positive' && 'text-ok-text',
          delta.tone === 'negative' && 'text-danger-text',
          (!delta.tone || delta.tone === 'neutral') && 'text-ink-300',
        )}
      >
        {delta.direction === 'up' ? (
          <IconArrowUpRight size={14} />
        ) : (
          <IconArrowDownRight size={14} />
        )}
        <span className="font-mono">{delta.value}</span>
      </div>
    )}
    {hint && <div className="text-xs text-ink-400">{hint}</div>}
  </Card>
);
