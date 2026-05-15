'use client';

import { cents, formatMXN } from '@lidxi/shared';
import { IconMinus, IconNotes, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import type { TicketLine as TicketLineType } from './types';

interface TicketLineProps {
  line: TicketLineType;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetNote: (note: string) => void;
}

export const TicketLine = ({ line, onIncrement, onDecrement, onSetNote }: TicketLineProps) => {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(line.note);
  const inputRef = useRef<HTMLInputElement>(null);
  const subtotal = cents(line.unitPriceCents * line.qty);

  useEffect(() => {
    if (editingNote) inputRef.current?.focus();
  }, [editingNote]);

  const commitNote = () => {
    onSetNote(draft.trim());
    setEditingNote(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitNote();
    if (e.key === 'Escape') {
      setDraft(line.note);
      setEditingNote(false);
    }
  };

  return (
    <div className="py-2 border-b border-line last:border-b-0">
      <div className="flex items-center gap-2">
        {/* Nombre + nota */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{line.name}</p>
          {line.note && !editingNote && (
            <p className="text-xs text-brand mt-0.5 truncate">+ {line.note}</p>
          )}
          <p className="text-xs text-ink-400 font-mono">{formatMXN(line.unitPriceCents)} c/u</p>
        </div>

        {/* Botón nota */}
        <button
          type="button"
          onClick={() => {
            setDraft(line.note);
            setEditingNote((v) => !v);
          }}
          title="Agregar nota para cocina"
          className={`h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 ${
            line.note
              ? 'text-brand bg-brand-soft hover:bg-brand-soft/80'
              : 'text-ink-300 hover:bg-surface-2'
          }`}
        >
          <IconNotes size={14} />
        </button>

        {/* Controles qty */}
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

        {/* Subtotal */}
        <span className="font-mono text-sm font-semibold text-ink w-20 text-right tabular-nums shrink-0">
          {formatMXN(subtotal)}
        </span>
      </div>

      {/* Input de nota inline */}
      {editingNote && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitNote}
            placeholder="ej. Sin cebolla, extra salsa…"
            className="flex-1 h-7 text-xs bg-canvas border border-brand rounded px-2 focus:outline-none text-ink"
          />
          {draft && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setDraft('');
              }}
              className="text-ink-400 hover:text-ink-200"
            >
              <IconX size={13} />
            </button>
          )}
        </div>
      )}

      {/* Info de split cuando qty > 1 y hay nota */}
      {line.note && line.qty > 1 && (
        <p className="text-[10px] text-ink-400 mt-1">
          Nota aplica a 1 unidad — las demás van sin nota
        </p>
      )}
    </div>
  );
};
