'use client';

import { KobiWordmark } from '@kobi/ui';
import {
  IconBuildingStore,
  IconChartBar,
  IconChefHat,
  IconDeviceDesktop,
  IconHome,
  IconMenu2,
  IconPlug,
  IconReceipt,
  IconSettings,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { name: 'Inicio', href: '/admin/inicio', icon: IconHome },
  { name: 'Equipo', href: '/admin/equipo', icon: IconUsers },
  { name: 'Menú', href: '/admin/menu', icon: IconChefHat },
  { name: 'Sitio propio', href: '/admin/sitio-propio', icon: IconBuildingStore },
  { name: 'Integraciones', href: '/admin/integraciones', icon: IconPlug },
  { name: 'Reportes', href: '/admin/reportes', icon: IconChartBar },
  { name: 'Billing', href: '/admin/billing', icon: IconReceipt },
  { name: 'Ajustes', href: '/admin/ajustes', icon: IconSettings },
] as const;

interface AdminShellProps {
  tenantName: string;
  children: React.ReactNode;
}

export default function AdminShell({ tenantName, children }: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cerrar drawer en navegación.
  // biome-ignore lint/correctness/useExhaustiveDependencies: cerrar al cambiar de ruta
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Cerrar con Esc.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Bloquear scroll mientras drawer está abierto en mobile.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  return (
    <div className="flex h-screen w-full bg-[#F6F9FC]">
      {/* DESKTOP SIDEBAR (≥ lg) */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-ink/10 bg-[#F6F9FC]">
        <div className="flex h-14 items-center px-4">
          <KobiWordmark size="sm" />
        </div>
        <NavList pathname={pathname} />
      </aside>

      {/* MOBILE DRAWER (< lg) */}
      <button
        type="button"
        aria-label="Cerrar navegación"
        onClick={() => setDrawerOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-ink/60 transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#F6F9FC] border-r border-ink/10 shadow-2xl transition-transform duration-200 flex flex-col ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-ink/10">
          <KobiWordmark size="sm" />
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink/60 hover:bg-ink/5"
          >
            <IconX size={16} />
          </button>
        </div>
        <NavList pathname={pathname} />
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-white px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir navegación"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-ink/70 hover:bg-ink/5"
            >
              <IconMenu2 size={18} />
            </button>
            <span className="text-sm font-medium text-[#0A2540] truncate">{tenantName}</span>
            <span className="text-ink/40 hidden sm:inline">▾</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md border border-transparent px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-[#635BFF] hover:bg-[#635BFF]/5 whitespace-nowrap"
            >
              <IconDeviceDesktop size={16} />
              <span className="hidden sm:inline">Abrir la operación</span>
              <span className="sm:hidden">Operación</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto space-y-1 p-2">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.name}
          href={item.href as Route}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith(item.href)
              ? 'bg-[#635BFF]/10 text-[#0A2540] shadow-[inset_3px_0_0_0_#635BFF]'
              : 'text-ink/60 hover:bg-ink/5 hover:text-[#0A2540]'
          }`}
        >
          <item.icon size={18} />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
