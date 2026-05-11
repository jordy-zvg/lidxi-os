import { Chrome } from '@/app/_components/Chrome';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
