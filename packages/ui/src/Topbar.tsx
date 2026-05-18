import { cn } from '@kobi/shared';
import type { ReactNode } from 'react';

export interface TopbarProps {
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  session?: ReactNode;
  className?: string;
}

export const Topbar = ({ breadcrumbs, actions, session, className }: TopbarProps) => (
  <header
    className={cn(
      'h-topbar shrink-0 bg-surface border-b border-line flex items-center justify-between px-4',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-sm text-ink-200">{breadcrumbs}</div>
    <div className="flex items-center gap-3">
      {actions}
      {session}
    </div>
  </header>
);
