'use client';

import { cn } from '@kobi/shared';
import { EmptyState } from '@kobi/ui';
import { IconToolsKitchen2 } from '@tabler/icons-react';
import { useState } from 'react';
import { MenuItem } from './MenuItem';
import type { MenuItemData } from './types';

interface MenuGridProps {
  items: MenuItemData[];
  qtyMap: Record<string, number>;
  onAdd: (item: MenuItemData) => void;
}

export const MenuGrid = ({ items, qtyMap, onAdd }: MenuGridProps) => {
  const categories = ['Todos', ...Array.from(new Set(items.map((i) => i.category)))];
  const [activeCategory, setActiveCategory] = useState('Todos');

  const visible =
    activeCategory === 'Todos' ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tabs de categoría */}
      <div className="flex gap-1.5 pb-3 shrink-0 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'h-8 px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              activeCategory === cat
                ? 'bg-brand text-white'
                : 'bg-surface border border-line text-ink-200 hover:bg-surface-2',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de platillos — responsive: 2 cols mobile, 3 tablet, 4+ desktop */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pb-4">
          {visible.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              qty={qtyMap[item.id] ?? 0}
              onAdd={() => onAdd(item)}
            />
          ))}
          {visible.length === 0 && (
            <EmptyState
              size="block"
              className="col-span-2 sm:col-span-3 xl:col-span-4"
              icon={<IconToolsKitchen2 size={36} />}
              title="Sin platillos en esta categoría"
              description="Cambia de categoría o agrega platillos al menú desde Admin."
            />
          )}
        </div>
      </div>
    </div>
  );
};
