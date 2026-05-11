import { cn } from '@lidxi/shared';
import type { ReactNode } from 'react';

export interface SidebarProps {
  children: ReactNode;
  className?: string;
  brand?: ReactNode;
  footer?: ReactNode;
}

export const Sidebar = ({ children, brand, footer, className }: SidebarProps) => (
  <aside
    className={cn(
      'w-sidebar shrink-0 h-screen bg-surface border-r border-line flex flex-col',
      className,
    )}
  >
    {brand && <div className="px-4 py-4 border-b border-line">{brand}</div>}
    <nav className="flex-1 overflow-y-auto py-2">{children}</nav>
    {footer && <div className="border-t border-line px-3 py-3">{footer}</div>}
  </aside>
);

export const SidebarSection = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => (
  <div className="px-2 py-2">
    {title && (
      <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        {title}
      </div>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
);

export interface SidebarItemProps {
  /** Icono ya renderizado (ej: `<IconShoppingCart size={16} />`). */
  icon?: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
}

export const SidebarItem = ({
  icon,
  label,
  active = false,
  href,
  onClick,
  badge,
}: SidebarItemProps) => {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-brand-soft text-brand-text' : 'text-ink-200 hover:bg-surface-2',
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 truncate text-left">{label}</span>
      {badge}
    </Tag>
  );
};
