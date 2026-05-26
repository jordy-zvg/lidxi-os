'use client';

import { SidebarItem, SidebarSection } from '@kobi/ui';
import {
  IconBuildingStore,
  IconCash,
  IconChartBar,
  IconChefHat,
  IconCreditCard,
  IconShoppingCart,
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
    title: 'Reportes',
    items: [
      { label: 'Reportes', href: '/reportes', icon: <IconChartBar size={16} /> },
      { label: 'Caja', href: '/caja', icon: <IconCash size={16} /> },
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
