import { formatMXN } from '@lidxi/shared';
import { cents } from '@lidxi/shared';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import type { TicketLine as TicketLineType } from './types';

interface TicketLineProps {
  line: TicketLineType;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const TicketLine = ({ line, onIncrement, onDecrement }: TicketLineProps) => {
  const subtotal = cents(line.unitPriceCents * line.qty);

  return (
    <div className="flex items-center gap-2 py-2 border-b border-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{line.name}</p>
        <p className="text-xs text-ink-400 font-mono">{formatMXN(line.unitPriceCents)} c/u</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onDecrement}
          className="h-7 w-7 flex items-center justify-center rounded border border-line-2 text-ink-300 hover:bg-surface-2 hover:text-danger-text transition-colors"
          aria-label={line.qty === 1 ? 'Eliminar' : 'Reducir cantidad'}
        >
          {line.qty === 1 ? <IconTrash size={13} /> : <IconMinus size={13} />}
        </button>
        <span className="w-6 text-center font-mono text-sm font-semibold text-ink tabular-nums">
          {line.qty}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="h-7 w-7 flex items-center justify-center rounded border border-line-2 text-ink-300 hover:bg-surface-2 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <IconPlus size={13} />
        </button>
      </div>

      <span className="font-mono text-sm font-semibold text-ink w-20 text-right tabular-nums shrink-0">
        {formatMXN(subtotal)}
      </span>
    </div>
  );
};
