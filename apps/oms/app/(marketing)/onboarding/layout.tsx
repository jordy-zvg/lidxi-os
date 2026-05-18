import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

const STEPS = [
  { label: 'Restaurante', href: '/onboarding/restaurante' },
  { label: 'Operación', href: '/onboarding/operacion' },
  { label: 'Plan', href: '/onboarding/plan' },
  { label: 'Listo', href: '/onboarding/listo' },
];

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F9FC]">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-ink/8 bg-white px-4 sm:px-6">
        <KobiWordmark size="sm" variant="light" />
        <Link href="/ingresar" className="text-xs text-ink/40 hover:text-ink/60 transition-colors">
          Cerrar sesión
        </Link>
      </header>

      {/* Progress indicator */}
      <div className="border-b border-ink/8 bg-white px-4 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between py-4">
          {STEPS.map((step, i) => (
            <div key={step.href} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/10 text-xs font-semibold text-ink/40">
                  {i + 1}
                </span>
                <span className="hidden text-xs text-ink/50 sm:block">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-ink/10 sm:w-12" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
