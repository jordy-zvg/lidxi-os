'use client';

import type { MenuItemOptionGroup } from '@kobi/shared';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface OptionsEditorProps {
  value: MenuItemOptionGroup[];
  onChange: (value: MenuItemOptionGroup[]) => void;
}

/**
 * Editor manual de modificadores (menu_items.options). Los deltas se capturan
 * en pesos y se guardan en centavos (price_delta), igual que base_price.
 */
export const OptionsEditor = ({ value, onChange }: OptionsEditorProps) => {
  const setGroup = (idx: number, patch: Partial<MenuItemOptionGroup>) => {
    onChange(value.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const setChoice = (
    groupIdx: number,
    choiceIdx: number,
    patch: Partial<MenuItemOptionGroup['choices'][number]>,
  ) => {
    const group = value[groupIdx];
    if (!group) return;
    setGroup(groupIdx, {
      choices: group.choices.map((c, i) => (i === choiceIdx ? { ...c, ...patch } : c)),
    });
  };

  return (
    <div className="space-y-3">
      {value.map((group, gi) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: grupos sin id estable; orden controlado por el usuario
        <div key={gi} className="rounded-lg border border-line bg-canvas p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={group.group}
              maxLength={40}
              placeholder="Grupo (ej. Tamaño)"
              onChange={(e) => setGroup(gi, { group: e.target.value })}
              className="flex-1 h-8 rounded-md border border-line-2 bg-surface px-2 text-sm text-ink focus:outline-none focus:border-brand"
            />
            <select
              value={group.type}
              onChange={(e) => setGroup(gi, { type: e.target.value as 'single' | 'multi' })}
              className="h-8 rounded-md border border-line-2 bg-surface px-1 text-xs text-ink focus:outline-none"
            >
              <option value="single">Una opción</option>
              <option value="multi">Varias</option>
            </select>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== gi))}
              className="h-8 w-8 flex items-center justify-center rounded text-ink-300 hover:text-danger-text"
              aria-label="Eliminar grupo"
            >
              <IconTrash size={14} />
            </button>
          </div>

          {group.choices.map((choice, ci) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: choices sin id estable
            <div key={ci} className="flex items-center gap-2">
              <input
                type="text"
                value={choice.name}
                maxLength={40}
                placeholder="Opción (ej. Grande)"
                onChange={(e) => setChoice(gi, ci, { name: e.target.value })}
                className="flex-1 h-8 rounded-md border border-line-2 bg-surface px-2 text-sm text-ink focus:outline-none focus:border-brand"
              />
              <div className="flex items-center border border-line-2 rounded-md bg-surface overflow-hidden w-24">
                <span className="px-1.5 font-mono text-xs text-ink-400">+$</span>
                <input
                  type="number"
                  step="0.5"
                  value={choice.price_delta / 100}
                  onChange={(e) =>
                    setChoice(gi, ci, {
                      price_delta: Math.round((Number.parseFloat(e.target.value) || 0) * 100),
                    })
                  }
                  className="w-full h-8 px-1 font-mono text-xs text-ink bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setGroup(gi, { choices: group.choices.filter((_, i) => i !== ci) })}
                className="h-8 w-8 flex items-center justify-center rounded text-ink-300 hover:text-danger-text"
                aria-label="Eliminar opción"
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setGroup(gi, { choices: [...group.choices, { name: '', price_delta: 0 }] })
            }
            className="text-xs text-brand font-medium hover:underline"
          >
            + Agregar opción
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...value,
            { group: '', type: 'single', choices: [{ name: '', price_delta: 0 }] },
          ])
        }
        className="inline-flex items-center gap-1 text-sm text-brand font-medium hover:underline"
      >
        <IconPlus size={14} /> Agregar grupo de modificadores
      </button>
    </div>
  );
};
