'use client';

import { cn } from '@kobi/shared';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) => (
  <div role="tablist" className={cn('inline-flex rounded-md bg-canvas p-1 gap-0.5', className)}>
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded font-medium transition-colors',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            active ? 'bg-surface text-ink shadow-sm' : 'text-ink-300 hover:text-ink-100',
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);
