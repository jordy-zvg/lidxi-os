'use client';

import {
  type InventoryItem,
  addInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
} from '@/app/admin/inventario/actions';
import { Button } from '@kobi/ui';
import { IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface InventarioSlideOverProps {
  item: InventoryItem | null;
  isAddMode: boolean;
  onClose: () => void;
}

export const InventarioSlideOver = ({ item, isAddMode, onClose }: InventarioSlideOverProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!item && !isAddMode) return;
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setUnit(item.unit);
      setCurrentStock(item.current_stock);
      setMinStock(item.min_stock);
      setCostPerUnit(item.cost_per_unit);
    } else {
      setSku('');
      setName('');
      setUnit('unidad');
      setCurrentStock(0);
      setMinStock(0);
      setCostPerUnit(0);
    }
    setError(null);
    setIsDeleting(false);
  }, [item, isAddMode]);

  useEffect(() => {
    if (!item && !isAddMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [item, isAddMode, onClose]);

  if (!item && !isAddMode) return null;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      if (isAddMode) {
        const result = await addInventoryItem({
          sku,
          name,
          unit,
          current_stock: currentStock,
          min_stock: minStock,
          cost_per_unit: costPerUnit,
        });
        if (result.ok) {
          router.refresh();
          onClose();
        } else {
          setError(result.error);
        }
      } else if (item) {
        const result = await updateInventoryItem(item.id, {
          sku,
          name,
          unit,
          current_stock: currentStock,
          min_stock: minStock,
          cost_per_unit: costPerUnit,
        });
        if (result.ok) {
          router.refresh();
          onClose();
        } else {
          setError(result.error);
        }
      }
    });
  };

  const handleDelete = () => {
    if (!item) return;
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteInventoryItem(item.id);
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
        setIsDeleting(false);
      }
    });
  };

  const title = isAddMode ? 'Nuevo artículo' : name;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        onClick={onClose}
        role="presentation"
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label={title}
        className="fixed right-0 top-0 bottom-0 z-50 w-[480px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">{title}</span>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* SKU y Nombre */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Datos básicos
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="sku">
                  SKU
                </label>
                <input
                  id="sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                  placeholder="ej. ABC123"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                  placeholder="ej. Tomate rojo"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="unit">
                  Unidad
                </label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="g">Gramo (g)</option>
                  <option value="l">Litro (L)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="docena">Docena</option>
                </select>
              </div>
            </div>
          </section>

          {/* Stock */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Stock
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="current_stock">
                  Stock actual
                </label>
                <input
                  id="current_stock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number.parseFloat(e.target.value) || 0)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="min_stock">
                  Stock mínimo
                </label>
                <input
                  id="min_stock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minStock}
                  onChange={(e) => setMinStock(Number.parseFloat(e.target.value) || 0)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          {/* Costo */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Costo
            </h3>
            <div>
              <label className="block text-xs text-ink-400 mb-1" htmlFor="cost">
                Costo por unidad ($)
              </label>
              <input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(Number.parseFloat(e.target.value) || 0)}
                className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
              />
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 flex flex-col gap-3">
          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md"
            >
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            {!isAddMode && (
              <button
                type="button"
                className="text-sm font-medium text-danger-text hover:underline disabled:opacity-50"
                onClick={handleDelete}
                disabled={isPending || isDeleting}
              >
                Eliminar
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </footer>
      </dialog>
    </>
  );
};
