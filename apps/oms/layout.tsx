'use client';

import { KobiWordmark } from '@kobi/ui';
import { usePathname } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const step = Number.parseInt(pathname.split('/').pop() || '1', 10);

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#0A2540]">
      <header className="flex h-16 items-center px-6 border-b border-ink/10 bg-white">
        <KobiWordmark size="sm" />
        <div className="mx-auto flex w-full max-w-sm items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? 'bg-[#635BFF]' : 'bg-[#635BFF]/10'
              }`}
            />
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12">{children}</main>
    </div>
  );
}
