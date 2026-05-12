import type { ReactNode } from 'react';

export default function KdsLayout({ children }: { children: ReactNode }) {
  return <div className="fixed inset-0 z-50 bg-dark-canvas overflow-hidden">{children}</div>;
}
