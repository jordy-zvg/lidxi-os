'use client';

import { cents, formatMXN } from '@lidxi/shared';
import { IconMinus, IconNotes, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import type { TicketLine as TicketLineType } from './types';

interface TicketLineProps {
  line: TicketLineType;
  onIncrement: () => void;
  onDecrement: () => void;
  /** scope: 'all' aplica nota a todas las unidades; 'one' separa 1 unidad con nota */
  onSetNote: (note: string, scope: 'all' | 'one') => void;
}

export const TicketLine = ({ line, onIncrement, onDecrement, onSetNote }: TicketLineProps) => {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(line.note);
  const [showChoice, setShowChoice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const subtotal = cents(line.unitPriceCents * line.qty);

  useEffect(() => {
    if (editingNote && !showChoice) inputRef.current?.focus();
  }, [editingNote, showChoice]);

  const commit = () => {
    const note = draft.trim();
    if (note && line.qty > 1) {
      // Tiene nota y hay más de una unidad → preguntar alcance
      setShowChoice(true);
      return;
    }
    onSetNote(note, 'all');
    setEditingNote(false);
    setShowChoice(false);
  };

  const applyAll = () => {
    onSetNote(draft.trim(), 'all');
    setEditingNote(false);
    setShowChoice(false);
  };

  const applyOne = () => {
    onSetNote(draft.trim(), 'one');
    setEditingNote(false);
    setShowChoice(false);
  };

  const cancelNote = () => {
    setDraft(line.note);
    setEditingNote(false);
    setShowChoice(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancelNote();
  };

  return (
    <div className="py-2 border-b border-line last:border-b-0">
      {/* Fila principal */}
      <div className="flex items-center gap-2">
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
            setShowChoice(false);
            setEditingNote((v) => !v);
          }}
          title="Nota para cocina"
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
      {editingNote && !showChoice && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // No cierres si el usuario está por hacer clic en los botones de elección
              setTimeout(() => {
                if (!showChoice) commit();
              }, 150);
            }}
            placeholder="ej. Sin cebolla, extra salsa…"
            className="flex-1 h-7 text-xs bg-canvas border border-brand rounded px-2 focus:outline-none text-ink"
          />
          {draft && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setDraft('')}
              className="text-ink-400 hover:text-ink-200"
            >
              <IconX size={13} />
            </button>
          )}
        </div>
      )}

      {/* Elección de alcance cuando qty > 1 */}
      {editingNote && showChoice && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-ink-400">
            ¿La nota <span className="font-medium text-ink">"{draft.trim()}"</span> aplica a:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyAll}
              className="flex-1 h-8 rounded border border-brand bg-brand-soft text-brand-text text-xs font-medium hover:bg-brand hover:text-white transition-colors"
            >
              Todos ({line.qty})
            </button>
            <button
              type="button"
              onClick={applyOne}
              className="flex-1 h-8 rounded border border-line-2 bg-surface text-ink-200 text-xs font-medium hover:bg-surface-2 transition-colors"
            >
              Solo 1 (separar)
            </button>
            <button
              type="button"
              onClick={cancelNote}
              className="h-8 w-8 flex items-center justify-center rounded border border-line-2 text-ink-400 hover:bg-surface-2 transition-colors"
            >
              <IconX size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
