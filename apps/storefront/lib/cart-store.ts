'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kobi-storefront-cart';

export interface CartLine {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
  imageUrl?: string | null;
}

interface CartState {
  tenantSlug: string;
  lines: CartLine[];
}

function loadFromStorage(slug: string): CartState {
  if (typeof window === 'undefined') return { tenantSlug: slug, lines: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tenantSlug: slug, lines: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.tenantSlug !== slug) return { tenantSlug: slug, lines: [] };
    return parsed;
  } catch {
    return { tenantSlug: slug, lines: [] };
  }
}

function saveToStorage(state: CartState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota o disponibilidad — ignoramos
  }
  // Notificar a otros consumidores del hook en la misma pestaña.
  window.dispatchEvent(new CustomEvent('kobi-cart-updated'));
}

/**
 * Hook simple para gestionar el carrito en localStorage. Sin librerías para
 * mantener el bundle del storefront chico — el cliente final debe cargar la
 * landing del restaurante en < 2s en 3G.
 */
export function useCart(tenantSlug: string) {
  const [state, setState] = useState<CartState>(() => ({ tenantSlug, lines: [] }));

  useEffect(() => {
    setState(loadFromStorage(tenantSlug));
    const sync = () => setState(loadFromStorage(tenantSlug));
    window.addEventListener('kobi-cart-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('kobi-cart-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [tenantSlug]);

  const setLines = (lines: CartLine[]) => {
    const next = { tenantSlug, lines };
    setState(next);
    saveToStorage(next);
  };

  const addItem = (line: Omit<CartLine, 'qty'>) => {
    const existing = state.lines.find((l) => l.menuItemId === line.menuItemId);
    if (existing) {
      setLines(
        state.lines.map((l) => (l.menuItemId === line.menuItemId ? { ...l, qty: l.qty + 1 } : l)),
      );
    } else {
      setLines([...state.lines, { ...line, qty: 1 }]);
    }
  };

  const updateQty = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setLines(state.lines.filter((l) => l.menuItemId !== menuItemId));
      return;
    }
    setLines(state.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, qty } : l)));
  };

  const removeItem = (menuItemId: string) => {
    setLines(state.lines.filter((l) => l.menuItemId !== menuItemId));
  };

  const clear = () => setLines([]);

  const totalCents = state.lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0);
  const itemCount = state.lines.reduce((sum, l) => sum + l.qty, 0);

  return { lines: state.lines, addItem, updateQty, removeItem, clear, totalCents, itemCount };
}
