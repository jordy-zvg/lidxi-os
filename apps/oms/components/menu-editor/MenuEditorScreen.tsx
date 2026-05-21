'use client';

import { IconPackage, IconPlus } from '@tabler/icons-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  type CategoryGroup,
  type MenuItemRow,
  loadMenuEditorData,
  updateMenuItem,
} from '../../lib/menu-actions';
import { CategorySidebar } from './CategorySidebar';
import { ItemEditorPanel } from './ItemEditorPanel';
import { MenuItemCard } from './MenuItemCard';

export const MenuEditorScreen = () => {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemRow | null | 'new'>('none' as never);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Cargar datos iniciales
  useEffect(() => {
    loadMenuEditorData().then((result) => {
      if (result.ok) {
        setCategories(result.data.categories);
        setItems(result.data.items);
        if (result.data.categories[0]) setActiveCategory(result.data.categories[0].name);
      }
      setLoading(false);
    });
  }, []);

  const categoryNames = categories.map((c) => c.name);
  const visibleItems = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  // Recalcular categorías desde items
  const recomputeCategories = useCallback((updatedItems: MenuItemRow[]) => {
    const map = new Map<string, number>();
    for (const i of updatedItems) map.set(i.category, (map.get(i.category) ?? 0) + 1);
    setCategories(Array.from(map.entries()).map(([name, count]) => ({ name, count })));
  }, []);

  const handleToggleAvailability = (item: MenuItemRow) => {
    // Optimistic update
    const next = !item.active;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: next } : i)));
    startTransition(async () => {
      const result = await updateMenuItem(item.id, { active: next });
      if (!result.ok) {
        // Rollback
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: item.active } : i)));
      }
    });
  };

  const handleSaved = (saved: MenuItemRow) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      const updated =
        idx >= 0 ? prev.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...prev];
      recomputeCategories(updated);
      return updated;
    });
    setSelectedItem(null);
    if (saved.category !== activeCategory) setActiveCategory(saved.category);
  };

  const handleDeleted = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      recomputeCategories(updated);
      return updated;
    });
    setSelectedItem(null);
  };

  const editorItem: MenuItemRow | null =
    selectedItem === 'new' ? null : (selectedItem as MenuItemRow | null);
  const editorOpen = selectedItem !== null && (selectedItem as unknown) !== 'none';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-ink-400">Cargando menú…</p>
      </div>
    );
  }

  // Categorías sugeridas para tenants nuevos sin items.
  const SUGGESTED_CATEGORIES = ['Entradas', 'Platos fuertes', 'Bebidas', 'Postres'];
  const editorCategories = categoryNames.length > 0 ? categoryNames : SUGGESTED_CATEGORIES;

  if (categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <IconPackage size={40} className="text-ink-500" />
          <p className="text-base font-medium text-ink">Tu menú está vacío</p>
          <p className="text-sm text-ink-400 max-w-sm">
            Agrega tu primer item para empezar. Puedes organizarlo en categorías como entradas,
            platos fuertes, bebidas y postres.
          </p>
          <button
            type="button"
            onClick={() => setSelectedItem('new' as unknown as MenuItemRow)}
            className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            <IconPlus size={16} /> Crear primer item
          </button>
        </div>
        {editorOpen && (
          <ItemEditorPanel
            item={editorItem}
            categories={editorCategories}
            onClose={() => setSelectedItem(null)}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden">
      {/* Columna 1 — Categorías (sidebar desktop, top-bar mobile) */}
      <CategorySidebar
        categories={categories}
        active={activeCategory}
        totalItems={items.length}
        onSelect={setActiveCategory}
      />

      {/* Columna 2 — Items */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header sticky */}
        <div className="sticky top-0 bg-canvas border-b border-line px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0 z-10">
          <h2 className="text-base sm:text-xl font-semibold text-ink truncate">
            {activeCategory ?? 'Todos'}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedItem('new' as unknown as MenuItemRow)}
            className="flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-md bg-brand text-white text-xs sm:text-sm font-medium hover:bg-brand-hover transition-colors shrink-0"
          >
            <IconPlus size={16} />
            <span className="hidden sm:inline">Nuevo item</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <IconPackage size={36} className="text-ink-500" />
              <p className="text-base font-medium text-ink">Sin items en esta categoría</p>
              <button
                type="button"
                onClick={() => setSelectedItem('new' as unknown as MenuItemRow)}
                className="text-sm text-brand font-medium hover:underline"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {visibleItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => setSelectedItem(item)}
                  onToggleAvailability={() => handleToggleAvailability(item)}
                  onDelete={() => {
                    setSelectedItem(item);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna 3 — Editor */}
      {editorOpen && (
        <ItemEditorPanel
          item={editorItem}
          categories={categoryNames}
          onClose={() => setSelectedItem(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};
