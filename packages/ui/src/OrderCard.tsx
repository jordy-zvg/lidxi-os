import {
  type ChannelKey,
  type OrderStatus,
  type SlaLevel,
  cn,
  formatOrderId,
  formatTimeMX,
} from '@lidxi/shared';
import type { ReactNode } from 'react';
import { ChannelBadge } from './ChannelBadge';

export interface OrderCardItem {
  qty: number;
  name: string;
}

export interface OrderCardProps {
  orderId: string;
  channel: ChannelKey;
  createdAt: string;
  items: OrderCardItem[];
  status: OrderStatus;
  slaLevel: SlaLevel;
  timerLabel?: string;
  actions?: ReactNode;
  className?: string;
}

const slaBorder: Record<SlaLevel, string> = {
  green: 'border-l-ok',
  amber: 'border-l-warn',
  red: 'border-l-danger',
};

export const OrderCard = ({
  orderId,
  channel,
  createdAt,
  items,
  slaLevel,
  timerLabel,
  actions,
  className,
}: OrderCardProps) => (
  <article
    className={cn(
      'bg-surface border border-line rounded-lg border-l-4 shadow-sm',
      slaBorder[slaLevel],
      className,
    )}
  >
    <header className="flex items-center justify-between gap-2 px-3 pt-3">
      <div className="flex items-center gap-2">
        <ChannelBadge channel={channel} short />
        <span className="font-mono text-sm font-semibold text-ink">{formatOrderId(orderId)}</span>
      </div>
      <span className="font-mono text-xs text-ink-300">{formatTimeMX(createdAt)}</span>
    </header>
    <ul className="px-3 py-2 text-sm text-ink-100 space-y-0.5">
      {items.map((item, idx) => (
        <li key={`${item.name}-${idx}`} className="flex gap-2">
          <span className="font-mono text-ink-300 w-6 shrink-0">{item.qty}×</span>
          <span className="truncate">{item.name}</span>
        </li>
      ))}
    </ul>
    <footer className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
      {timerLabel && <span className="font-mono text-xs text-ink-300">{timerLabel}</span>}
      <div className="flex items-center gap-1">{actions}</div>
    </footer>
  </article>
);
