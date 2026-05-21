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
  <aside className="md:w-60 md:shrink-0 flex md:flex-col md:border-r border-b md:border-b-0 border-line bg-canvas overflow-hidden">
    {/* Desktop heading — hidden mobile */}
    <div className="hidden md:block px-4 py-4 border-b border-line shrink-0">
      <h2 className="text-sm font-semibold text-ink">Categorías</h2>
    </div>

    {/* Categorías: mobile scroll horizontal · desktop lista vertical */}
    <nav className="flex md:flex-col overflow-x-auto md:overflow-x-hidden md:overflow-y-auto md:py-2 px-2 md:px-0 py-2 gap-1 md:gap-0">
      {categories.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-ink-400">Sin categorías</p>
      ) : (
        categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect(cat.name)}
            className={cn(
              'shrink-0 md:w-full md:shrink flex items-center justify-between gap-2 px-3 md:px-4 py-1.5 md:py-2.5 text-sm transition-colors rounded-full md:rounded-none md:border-l-[3px] border md:border-l',
              active === cat.name
                ? 'bg-brand text-white md:bg-brand-soft md:text-ink md:font-medium md:border-brand md:border-y-transparent md:border-r-transparent'
                : 'bg-surface md:bg-transparent border-line md:border-transparent text-ink-200 hover:bg-surface-2',
            )}
          >
            <span className="truncate whitespace-nowrap">{cat.name}</span>
            <span
              className={cn(
                'font-mono text-xs shrink-0',
                active === cat.name ? 'text-white/70 md:text-ink-400' : 'text-ink-400',
              )}
            >
              {cat.count}
            </span>
          </button>
        ))
      )}
    </nav>

    {/* Footer total — solo desktop */}
    <div className="hidden md:block px-4 py-3 border-t border-line shrink-0">
      <span className="font-mono text-xs text-ink-400">{totalItems} items en total</span>
    </div>
  </aside>
);
