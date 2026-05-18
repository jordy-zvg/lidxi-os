'use client';

import { formatMXN, pesos } from '@kobi/shared';
import {
  IconDots,
  IconEdit,
  IconHandStop,
  IconPhoto,
  IconPlayerPlay,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { MenuItemRow } from '../../lib/menu-actions';

interface MenuItemCardProps {
  item: MenuItemRow;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onDelete: () => void;
}

export const MenuItemCard = ({
  item,
  onEdit,
  onToggleAvailability,
  onDelete,
}: MenuItemCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const price = formatMXN(pesos(item.base_price / 100));

  return (
    <article
      className={`relative bg-surface border border-line rounded-xl overflow-hidden hover:border-ink-200 transition-colors ${!item.active ? 'opacity-60' : ''}`}
    >
      {/* Imagen 16:9 */}
      <div className="relative aspect-video bg-surface-2 overflow-hidden">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.name}
            className={`w-full h-full object-cover ${!item.active ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconPhoto size={32} className="text-ink-500" />
          </div>
        )}
        {!item.active && (
          <span className="absolute top-2 right-2 bg-ink-200 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Pausado
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
        <p className="font-mono text-sm text-ink mt-0.5">{price}</p>
        {item.description && (
          <p className="text-xs text-ink-400 mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleAvailability}
            className={`relative h-4 w-[30px] rounded-full transition-colors ${item.active ? 'bg-brand' : 'bg-ink-500'}`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${item.active ? 'left-[15px]' : 'left-0.5'}`}
            />
          </button>
          <span className="text-xs text-ink-300">Disponible</span>
        </div>

        {/* Menú ⋯ */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-surface-2 text-ink-400 transition-colors"
          >
            <IconDots size={16} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                onKeyDown={() => setMenuOpen(false)}
                role="presentation"
              />
              <div className="absolute right-0 top-8 z-20 w-36 bg-surface border border-line rounded-lg shadow-md py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-surface-2"
                >
                  <IconEdit size={14} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleAvailability();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink hover:bg-surface-2"
                >
                  {item.active ? <IconHandStop size={14} /> : <IconPlayerPlay size={14} />}{' '}
                  {item.active ? 'Pausar' : 'Activar'}
                </button>
                <div className="border-t border-line my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger-text hover:bg-danger-soft"
                >
                  <IconTrash size={14} /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
