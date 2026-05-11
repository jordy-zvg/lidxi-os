import { Chrome } from '@/components/Chrome';
import type { ReactNode } from 'react';

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
