import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { signOut } from '@/lib/supabase/auth-actions';
import { KobiWordmark } from '@kobi/ui';
import type { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F9FC]">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-ink/8 bg-white px-4 sm:px-6">
        <KobiWordmark size="sm" variant="light" />
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button type="submit" className="text-xs text-ink/40 transition-colors hover:text-ink/60">
            Cerrar sesión
          </button>
        </form>
      </header>

      <OnboardingSteps />

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
