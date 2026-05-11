'use client';

import { IconFingerprint } from '@tabler/icons-react';
import { useClockOverlay } from '../hooks/useClockOverlay';

export const EntradaSalidaButton = () => {
  const { open } = useClockOverlay();
  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:shadow-focus"
    >
      <IconFingerprint size={16} className="text-brand" />
      Entrada / Salida
    </button>
  );
};
