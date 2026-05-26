'use client';

import type { InventoryItem } from '@/app/admin/inventario/actions';
import { Button } from '@kobi/ui';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { InventarioSlideOver } from './InventarioSlideOver';

interface InventarioScreenProps {
  items: InventoryItem[];
}

export const InventarioScreen = ({ items }: InventarioScreenProps) => {
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = () => {
    setIsAddMode(true);
    setSelected(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setIsAddMode(false);
    setSelected(item);
  };

  const handleClose = () => {
    setSelected(null);
    setIsAddMode(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header con búsqueda y botón agregar */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
          />
          <Button onClick={handleAdd} size="sm">
            <IconPlus size={16} />
            Agregar artículo
          </Button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-3 text-left font-medium text-ink-400 text-xs">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-ink-400 text-xs">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-ink-400 text-xs">Unidad</th>
                <th className="px-4 py-3 text-right font-medium text-ink-400 text-xs">Stock</th>
                <th className="px-4 py-3 text-right font-medium text-ink-400 text-xs">Mínimo</th>
                <th className="px-4 py-3 text-right font-medium text-ink-400 text-xs">Costo ($)</th>
                <th className="px-4 py-3 text-center font-medium text-ink-400 text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-400 text-sm">
                    {items.length === 0 ? 'No hay artículos' : 'No coincide la búsqueda'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0 hover:bg-canvas">
                    <td className="px-4 py-3 font-mono text-xs text-ink-300">{item.sku}</td>
                    <td className="px-4 py-3 text-ink">{item.name}</td>
                    <td className="px-4 py-3 text-ink-300">{item.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.current_stock < item.min_stock
                            ? 'bg-danger-soft text-danger-text'
                            : 'bg-ok-soft text-ok-text'
                        }`}
                      >
                        {item.current_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-ink-300">{item.min_stock}</td>
                    <td className="px-4 py-3 text-right text-ink-300">${item.cost_per_unit}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded text-ink-300 hover:bg-surface-2"
                        >
                          <IconPencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar "${item.name}"?`)) {
                              setSelected(item);
                              setIsAddMode(false);
                            }
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded text-danger-text hover:bg-danger-soft"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over para agregar/editar */}
      <InventarioSlideOver item={selected} isAddMode={isAddMode} onClose={handleClose} />
    </>
  );
};
