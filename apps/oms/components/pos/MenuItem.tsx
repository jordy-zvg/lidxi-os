import { formatMXN } from '@kobi/shared';
import type { MenuItemData } from './types';

interface MenuItemProps {
  item: MenuItemData;
  qty: number;
  onAdd: () => void;
}

export const MenuItem = ({ item, qty, onAdd }: MenuItemProps) => (
  <button
    type="button"
    onClick={onAdd}
    className="relative w-full text-left bg-surface border border-line rounded-lg p-3 hover:border-brand hover:shadow-sm transition-all active:scale-[0.98] focus:outline-none focus-visible:shadow-focus"
  >
    {qty > 0 && (
      <span className="absolute top-2 right-2 h-5 min-w-5 px-1 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center tabular-nums">
        {qty}
      </span>
    )}
    <p className="text-sm font-medium text-ink leading-snug pr-6">{item.name}</p>
    {item.description && (
      <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{item.description}</p>
    )}
    <p className="font-mono text-sm font-semibold text-brand mt-1.5">
      {formatMXN(item.displayPriceCents)}
    </p>
  </button>
);
