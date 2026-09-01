'use client';

import { type EatsLineInput, type EatsMenuItem, ingestEatsOrder } from '@/lib/eats-ingest-actions';
import { type CentsMXN, cents } from '@kobi/shared';
import { Button, Card } from '@kobi/ui';
import { IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Captura rápida de pedidos de Uber Eats (Sprint 19, H19.3).
 *
 * El objetivo de ≤20 segundos manda sobre cualquier otra consideración de
 * diseño. Concretamente, eso decide:
 *   - El ID de Uber es el primer campo y toma foco solo al montar.
 *   - Los ítems son botones grandes, un tap = una unidad. Sin buscador ni
 *     categorías anidadas: la carta de una hamburguesería cabe en pantalla.
 *   - Al guardar la pantalla vuelve en blanco sin modal de éxito. La
 *     confirmación es que el formulario se vació y el foco volvió al ID.
 */

interface CaptureLine {
  /** ID estable de línea — permite varias líneas del mismo platillo. */
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPriceCents: CentsMXN;
  note: string;
  /** Modificadores como texto libre; sin catálogo ni precios (los fija Uber). */
  modifierText: string;
}

const money = (c: number): string => `$${(c / 100).toFixed(2)}`;

let lineSeq = 0;
const nextLineId = (): string => {
  lineSeq += 1;
  return `l${lineSeq}`;
};

export const EatsCaptureScreen = ({ menu }: { menu: EatsMenuItem[] }) => {
  const [externalId, setExternalId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [totalPesos, setTotalPesos] = useState('');
  const [lines, setLines] = useState<CaptureLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  const categories = useMemo(() => {
    const byCategory = new Map<string, EatsMenuItem[]>();
    for (const item of menu) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }
    return [...byCategory.entries()];
  }, [menu]);

  const addItem = (item: EatsMenuItem) => {
    setLines((prev) => [
      ...prev,
      {
        id: nextLineId(),
        menuItemId: item.id,
        name: item.name,
        qty: 1,
        unitPriceCents: item.basePriceCents,
        note: '',
        modifierText: '',
      },
    ]);
  };

  const patchLine = (id: string, patch: Partial<CaptureLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const bumpQty = (id: string, delta: number) => {
    setLines((prev) =>
      prev.flatMap((l) => {
        if (l.id !== id) return [l];
        const qty = l.qty + delta;
        return qty <= 0 ? [] : [{ ...l, qty }];
      }),
    );
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const reset = () => {
    setExternalId('');
    setCustomerName('');
    setTotalPesos('');
    setLines([]);
    setError(null);
    idInputRef.current?.focus();
  };

  const canSave = externalId.trim().length > 0 && lines.length > 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    const parsedTotal = Number.parseFloat(totalPesos);
    const totalCents = cents(Number.isFinite(parsedTotal) ? Math.round(parsedTotal * 100) : 0);

    const items: EatsLineInput[] = lines.map((l) => ({
      menuItemId: l.menuItemId,
      qty: l.qty,
      unitPriceCents: l.unitPriceCents,
      note: l.note,
      // Texto libre → modifiers estructurados. priceDelta 0: el precio lo fija
      // Uber, pero la forma ya es la definitiva (compatible hacia adelante).
      modifiers: l.modifierText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, priceDelta: cents(0) })),
    }));

    const res = await ingestEatsOrder({
      externalId: externalId.trim(),
      customerName: customerName.trim() || null,
      items,
      totalCents,
    });

    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    // Sin modal de éxito: la pantalla en blanco ES la confirmación.
    reset();
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <header className="flex items-baseline justify-between">
        <h1 className="font-semibold text-ink text-lg">Captura de Uber Eats</h1>
        <span className="text-ink-3 text-xs">El pedido entra directo a preparación</span>
      </header>

      {error ? (
        <div
          className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-danger text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Menú: un tap por ítem */}
        <Card className="flex min-h-0 flex-col overflow-y-auto p-3">
          {categories.length === 0 ? (
            <p className="text-ink-3 text-sm">
              No hay platillos activos en el menú de este restaurante.
            </p>
          ) : (
            categories.map(([category, items]) => (
              <section key={category} className="mb-4">
                <h2 className="mb-2 font-medium text-ink-3 text-xs uppercase tracking-wide">
                  {category}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item)}
                      className="flex min-h-16 flex-col justify-between rounded-md border border-line-2 bg-surface p-3 text-left transition-colors hover:border-brand hover:bg-surface-2"
                    >
                      <span className="font-medium text-ink text-sm">{item.name}</span>
                      <span className="text-ink-3 text-xs">{money(item.basePriceCents)}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}
        </Card>

        {/* Pedido en curso */}
        <Card className="flex min-h-0 flex-col gap-3 p-3">
          <div>
            <label htmlFor="eats-external-id" className="mb-1 block font-medium text-ink text-sm">
              ID de Uber
            </label>
            <input
              id="eats-external-id"
              ref={idInputRef}
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="Ej. 4F2A9"
              autoComplete="off"
              className="h-11 w-full rounded-md border border-line-2 bg-surface px-3 font-mono text-base text-ink uppercase focus-visible:border-brand focus-visible:outline-none"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {lines.length === 0 ? (
              <p className="py-6 text-center text-ink-3 text-sm">
                Toca los platillos para agregarlos
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {lines.map((line) => (
                  <li key={line.id} className="rounded-md border border-line-2 bg-surface-2 p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 font-medium text-ink text-sm">{line.name}</span>
                      <button
                        type="button"
                        onClick={() => bumpQty(line.id, -1)}
                        aria-label={`Quitar uno de ${line.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded border border-line-2 text-ink-2 hover:bg-surface"
                      >
                        <IconMinus size={14} />
                      </button>
                      <span className="w-6 text-center font-medium text-ink text-sm tabular-nums">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => bumpQty(line.id, 1)}
                        aria-label={`Agregar uno de ${line.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded border border-line-2 text-ink-2 hover:bg-surface"
                      >
                        <IconPlus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        aria-label={`Eliminar ${line.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded text-ink-3 hover:bg-surface hover:text-danger"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                    <input
                      value={line.modifierText}
                      onChange={(e) => patchLine(line.id, { modifierText: e.target.value })}
                      placeholder="Modificadores (separa con comas)"
                      className="mt-2 h-8 w-full rounded border border-line-2 bg-surface px-2 text-ink text-xs focus-visible:border-brand focus-visible:outline-none"
                    />
                    <input
                      value={line.note}
                      onChange={(e) => patchLine(line.id, { note: e.target.value })}
                      placeholder="Nota para cocina"
                      className="mt-1 h-8 w-full rounded border border-line-2 bg-surface px-2 text-ink text-xs focus-visible:border-brand focus-visible:outline-none"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2 border-line-2 border-t pt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="eats-total" className="flex-1 text-ink-2 text-sm">
                Total
              </label>
              <input
                id="eats-total"
                value={totalPesos}
                onChange={(e) => setTotalPesos(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="h-9 w-28 rounded-md border border-line-2 bg-surface px-2 text-right text-ink tabular-nums focus-visible:border-brand focus-visible:outline-none"
              />
            </div>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente (opcional)"
              className="h-9 w-full rounded-md border border-line-2 bg-surface px-2 text-ink text-sm focus-visible:border-brand focus-visible:outline-none"
            />
            <Button size="lg" onClick={save} disabled={!canSave} className="w-full">
              {saving ? 'Guardando…' : 'Guardar pedido'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
