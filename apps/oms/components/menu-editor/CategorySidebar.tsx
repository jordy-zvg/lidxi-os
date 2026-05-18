import { cn } from '@kobi/shared';
import type { CategoryGroup } from '../../lib/menu-actions';

interface CategorySidebarProps {
  categories: CategoryGroup[];
  active: string | null;
  totalItems: number;
  onSelect: (category: string) => void;
}

export const CategorySidebar = ({
  categories,
  active,
  totalItems,
  onSelect,
}: CategorySidebarProps) => (
  <aside className="w-60 shrink-0 flex flex-col border-r border-line bg-canvas overflow-hidden">
    <div className="px-4 py-4 border-b border-line shrink-0">
      <h2 className="text-sm font-semibold text-ink">Categorías</h2>
    </div>

    <nav className="flex-1 overflow-y-auto py-2">
      {categories.length === 0 ? (
        <p className="px-4 py-3 text-xs text-ink-400">Sin categorías</p>
      ) : (
        categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect(cat.name)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-l-[3px]',
              active === cat.name
                ? 'bg-brand-soft border-brand text-ink font-medium'
                : 'border-transparent text-ink-200 hover:bg-surface-2',
            )}
          >
            <span className="truncate">{cat.name}</span>
            <span className="font-mono text-xs text-ink-400 shrink-0 ml-2">{cat.count}</span>
          </button>
        ))
      )}
    </nav>

    <div className="px-4 py-3 border-t border-line shrink-0">
      <span className="font-mono text-xs text-ink-400">{totalItems} items en total</span>
    </div>
  </aside>
);
