'use client';

import { SidebarItem, SidebarSection } from '@lidxi/ui';
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
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

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

export const ChromeSidebarNav = () => {
  const pathname = usePathname();

  const isActive = (href: string): boolean => pathname.startsWith(href);

  return (
    <>
      {NAV.map((section) => (
        <SidebarSection key={section.title} title={section.title}>
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </SidebarSection>
      ))}
    </>
  );
};
