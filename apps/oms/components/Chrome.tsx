import { Sidebar, SidebarItem, SidebarSection, Topbar } from '@lidxi/ui';
import {
  IconBuildingStore,
  IconCalendarStats,
  IconCash,
  IconChartBar,
  IconChefHat,
  IconClipboardList,
  IconCreditCard,
  IconPackage,
  IconPrinter,
  IconReceipt,
  IconRobot,
  IconSettingsAutomation,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import type { ReactElement, ReactNode } from 'react';
import { ClockOverlayProvider } from './ClockOverlayProvider';
import { EntradaSalidaButton } from './EntradaSalidaButton';

/**
 * Cromo común para toda la app autenticada (Sidebar + Topbar + ClockOverlay).
 *
 * TODO[oms-chrome]: leer pathname con `usePathname()` desde un Client
 * Component que envuelva los SidebarItem y resaltar el activo dinámicamente.
 * Por ahora marcamos /pedidos como activo siempre.
 */

interface NavItem {
  label: string;
  href: string;
  icon: ReactElement;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: 'Operación',
    items: [
      { label: 'Pedidos', href: '/pedidos', icon: <IconShoppingCart size={16} /> },
      { label: 'KDS', href: '/kds', icon: <IconChefHat size={16} /> },
      { label: 'POS', href: '/pos', icon: <IconCreditCard size={16} /> },
      { label: 'Sitio propio', href: '/sitio-propio', icon: <IconBuildingStore size={16} /> },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Menú', href: '/menu', icon: <IconClipboardList size={16} /> },
      { label: 'Inventario', href: '/inventario', icon: <IconPackage size={16} /> },
      { label: 'Precios', href: '/precios', icon: <IconReceipt size={16} /> },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { label: 'Reportes', href: '/reportes', icon: <IconChartBar size={16} /> },
      { label: 'Caja', href: '/caja', icon: <IconCash size={16} /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Personal', href: '/personal', icon: <IconUsers size={16} /> },
      { label: 'Timesheet', href: '/timesheet', icon: <IconCalendarStats size={16} /> },
      { label: 'Impresoras', href: '/impresoras', icon: <IconPrinter size={16} /> },
      { label: 'Automatización', href: '/automatizacion', icon: <IconRobot size={16} /> },
    ],
  },
];

export const Chrome = ({ children }: { children: ReactNode }) => (
  <ClockOverlayProvider>
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        brand={
          <div className="flex items-center gap-2">
            <IconSettingsAutomation size={20} className="text-brand" />
            <span className="font-semibold text-ink">LidxiOS</span>
          </div>
        }
      >
        {NAV.map((section) => (
          <SidebarSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={item.href === '/pedidos'}
              />
            ))}
          </SidebarSection>
        ))}
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          breadcrumbs={<span>LidxiOS</span>}
          actions={<EntradaSalidaButton />}
          session={<span className="text-xs text-ink-400">Demo · Miztli Pardo</span>}
        />
        <main className="flex-1 overflow-y-auto bg-canvas p-6">{children}</main>
      </div>
    </div>
  </ClockOverlayProvider>
);
