'use client';

import { cn } from '@lidxi/shared';
import { useEffect, useState } from 'react';
import type { Ticket } from './mock-tickets';

const SLA_GREEN_SECS = 600;
const SLA_AMBER_SECS = 900;

const slaClass = (elapsed: number) => {
  if (elapsed < SLA_GREEN_SECS) return 'text-dark-ok';
  if (elapsed < SLA_AMBER_SECS) return 'text-dark-warn';
  return 'text-dark-danger';
};

const slaBorder = (elapsed: number) => {
  if (elapsed < SLA_GREEN_SECS) return 'border-l-dark-ok';
  if (elapsed < SLA_AMBER_SECS) return 'border-l-dark-warn';
  return 'border-l-dark-danger';
};

const formatElapsed = (secs: number): string => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CHANNEL_LABEL: Record<string, string> = {
  direct: 'WEB',
  eats: 'EATS',
  rappi: 'RAPPI',
  didi: 'DIDI',
  mostrador: 'POS',
};

interface KdsTicketProps {
  ticket: Ticket;
  exiting: boolean;
  onReady: () => void;
}

export const KdsTicket = ({ ticket, exiting, onReady }: KdsTicketProps) => {
  const [elapsed, setElapsed] = useState(ticket.elapsed);
  const [struck, setStruck] = useState<Set<number>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleItem = (id: number) => {
    setStruck((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allDone = ticket.items.every((item) => struck.has(item.id));
  const completedCount = struck.size;

  return (
    <article
      className={cn(
        'w-80 shrink-0 bg-dark-surface border border-dark-line border-l-4 rounded-lg flex flex-col transition-all duration-300',
        slaBorder(elapsed),
        exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
      )}
    >
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-dark-line">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-dark-ink-300">
              {CHANNEL_LABEL[ticket.channel] ?? ticket.channel}
            </span>
            <span className="font-mono text-sm text-dark-ink-300">{ticket.id}</span>
          </div>
          <span
            className={cn(
              'font-mono text-2xl font-semibold tabular-nums leading-none',
              slaClass(elapsed),
              elapsed >= SLA_AMBER_SECS && 'animate-pulse',
            )}
          >
            {formatElapsed(elapsed)}
          </span>
        </div>
        <p className="text-sm text-dark-ink-200">{ticket.customer}</p>
      </header>

      {/* Items */}
      <ul className="flex-1 px-4 py-3 space-y-3">
        {ticket.items.map((item) => {
          const done = struck.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'flex gap-3 w-full text-left min-h-[44px] transition-opacity',
                  done && 'opacity-40',
                )}
              >
                <span className="font-mono text-lg font-semibold text-dark-ink w-8 shrink-0 tabular-nums">
                  {item.qty}×
                </span>
                <span className="flex-1">
                  <span
                    className={cn(
                      'block text-lg font-medium text-dark-ink uppercase tracking-wide leading-tight',
                      done && 'line-through',
                    )}
                  >
                    {item.name}
                  </span>
                  {item.mods.map((mod) => (
                    <span key={mod} className="block text-sm text-dark-ink-300 leading-snug">
                      + {mod}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <footer className="px-4 pb-4 pt-3 border-t border-dark-line space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-dark-line rounded-full overflow-hidden">
            <div
              className="h-full bg-dark-ok rounded-full transition-all duration-300"
              style={{
                width: `${ticket.items.length ? (completedCount / ticket.items.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="font-mono text-xs text-dark-ink-300 tabular-nums">
            {completedCount}/{ticket.items.length}
          </span>
        </div>

        {allDone && (
          <button
            type="button"
            onClick={onReady}
            className="w-full h-11 rounded-md bg-dark-ok text-white text-sm font-semibold transition-colors hover:opacity-90"
          >
            Marcar listo
          </button>
        )}
      </footer>
    </article>
  );
};
