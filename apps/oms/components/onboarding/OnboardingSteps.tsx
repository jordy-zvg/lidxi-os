'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { label: 'Restaurante', segment: 'restaurante' },
  { label: 'Operación', segment: 'operacion' },
  { label: 'Plan', segment: 'plan' },
  { label: 'Listo', segment: 'listo' },
];

export function OnboardingSteps() {
  const pathname = usePathname();

  const currentIndex = STEPS.findIndex((s) => pathname.includes(`/onboarding/${s.segment}`));

  return (
    <div className="border-b border-ink/8 bg-white px-4 sm:px-6">
      <div className="mx-auto flex max-w-lg items-center justify-between py-4">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.segment} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-[#7C71FF] text-white'
                      : isCurrent
                        ? 'bg-[#7C71FF] text-white ring-2 ring-[#7C71FF]/30 ring-offset-1'
                        : 'bg-ink/10 text-ink/40'
                  }`}
                >
                  {isCompleted ? '✓' : i + 1}
                </span>
                <span
                  className={`hidden text-xs sm:block ${
                    isCurrent ? 'font-medium text-[#0A2540]' : 'text-ink/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 sm:w-12 ${i < currentIndex ? 'bg-[#7C71FF]' : 'bg-ink/10'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
