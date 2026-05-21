'use client';

import { KobiWordmark, Sidebar } from '@kobi/ui';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ChromeSidebarNav } from './ChromeSidebarNav';

// ---------------------------------------------------------------------------
// Context para coordinar el hamburguesa <-> drawer
// ---------------------------------------------------------------------------
interface MobileNavContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar drawer al navegar.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname change debe cerrar el drawer
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Bloquear scroll del body cuando drawer está abierto.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  return (
    <MobileNavContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

function useMobileNav(): MobileNavContextValue {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error('useMobileNav debe usarse dentro de <MobileNavProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Botón hamburguesa para el topbar
// ---------------------------------------------------------------------------
export function MobileNavButton() {
  const nav = useMobileNav();
  return (
    <button
      type="button"
      onClick={nav.toggle}
      aria-label="Abrir navegación"
      aria-expanded={nav.isOpen}
      className="h-9 w-9 inline-flex lg:hidden items-center justify-center rounded-md border border-line text-ink-300 hover:bg-surface-2 transition-colors"
    >
      <IconMenu2 size={18} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Drawer (solo mobile/tablet — oculto en lg+)
// ---------------------------------------------------------------------------
export function MobileNavDrawer() {
  const nav = useMobileNav();
  return (
    <>
      {/* Overlay con animación de fade */}
      <button
        type="button"
        aria-label="Cerrar navegación"
        onClick={nav.close}
        className={`lg:hidden fixed inset-0 z-40 bg-ink/60 transition-opacity duration-200 ${
          nav.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface border-r border-line shadow-2xl transition-transform duration-200 ease-out flex flex-col ${
          nav.isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!nav.isOpen}
      >
        <header className="shrink-0 px-4 py-4 border-b border-line flex items-center justify-between">
          <KobiWordmark size="md" />
          <button
            type="button"
            onClick={nav.close}
            aria-label="Cerrar"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
        </header>
        <nav className="flex-1 overflow-y-auto py-2">
          <ChromeSidebarNav />
        </nav>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Wrapper para que el Sidebar desktop solo aparezca en lg+
// ---------------------------------------------------------------------------
export function DesktopSidebar({ children, brand }: { children: ReactNode; brand?: ReactNode }) {
  return (
    <Sidebar brand={brand} className="hidden lg:flex">
      {children}
    </Sidebar>
  );
}
