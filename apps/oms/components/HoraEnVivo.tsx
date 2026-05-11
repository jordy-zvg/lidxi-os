'use client';

import { formatTimeMX } from '@lidxi/shared';
import { useEffect, useState } from 'react';

/**
 * Hora local actualizada cada minuto. Renderiza placeholder en SSR para
 * evitar hydration mismatch.
 */
export const HoraEnVivo = ({ className }: { className?: string }) => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return <span className={className}>{now ? formatTimeMX(now) : '--:--'}</span>;
};
