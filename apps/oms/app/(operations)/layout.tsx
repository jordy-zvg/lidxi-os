import { Chrome } from '@/app/_components/Chrome';
import type { ReactNode } from 'react';

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
