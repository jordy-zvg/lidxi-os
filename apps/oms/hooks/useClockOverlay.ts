'use client';

import { useContext } from 'react';
import { ClockOverlayContext } from '../components/ClockOverlayProvider';

export const useClockOverlay = () => {
  const ctx = useContext(ClockOverlayContext);
  if (!ctx) {
    throw new Error('useClockOverlay debe usarse dentro de <ClockOverlayProvider>');
  }
  return ctx;
};
