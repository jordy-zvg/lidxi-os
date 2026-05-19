'use client';

import { KobiWordmark } from '@kobi/ui';
import {
  IconBuildingStore,
  IconChartBar,
  IconChefHat,
  IconDeviceDesktop,
  IconHome,
  IconPlug,
  IconReceipt,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-[#F6F9FC]">
      <aside className="flex w-60 flex-col border-r border-ink/10 bg-[#F6F9FC]">
        <div className="flex h-14 items-center px-4">
          <KobiWordmark size="sm" />
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href as Route}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith(item.href) ? 'bg-[#635BFF]/10 text-[#0A2540] shadow-[inset_3px_0_0_0_#635BFF]' : 'text-ink/60 hover:bg-ink/5 hover:text-[#0A2540]'}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-ink/10 bg-white px-6">
          <div className="text-sm font-medium text-[#0A2540]">Tenant Name ▾</div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-[#635BFF] hover:bg-[#635BFF]/5"
            >
              <IconDeviceDesktop size={16} /> Abrir la operación
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
