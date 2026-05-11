'use client';

import { type ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import { ClockOverlay } from './ClockOverlay';

interface ClockOverlayContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const ClockOverlayContext = createContext<ClockOverlayContextValue | null>(null);

/**
 * Provee el control imperativo del overlay de entrada/salida.
 * Renderiza un único `<ClockOverlay />` global; cualquier subárbol puede
 * abrirlo vía `useClockOverlay().open()`.
 */
export const ClockOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<ClockOverlayContextValue>(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <ClockOverlayContext.Provider value={value}>
      {children}
      <ClockOverlay open={isOpen} onClose={close} />
    </ClockOverlayContext.Provider>
  );
};
