import { CHANNELS, type ChannelKey, cn } from '@lidxi/shared';
import type { HTMLAttributes } from 'react';

export interface ChannelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  channel: ChannelKey;
  short?: boolean;
}

export const ChannelBadge = ({
  channel,
  short = false,
  className,
  ...props
}: ChannelBadgeProps) => {
  const c = CHANNELS[channel];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        className,
      )}
      style={{ backgroundColor: c.bg, color: c.color }}
      {...props}
    >
      {short ? c.short : c.label}
    </span>
  );
};
