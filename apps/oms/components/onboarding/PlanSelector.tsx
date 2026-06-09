'use client';

import { savePlanStep } from '@/app/(onboarding)/onboarding/actions';
import { PLANS, type PlanId, formatMXN, isValidPlanSlug } from '@/lib/constants/plans';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

function suggestPlan(volumen: string): PlanId {
  if (volumen === 'menos_50') return 'arranque';
  if (volumen === 'mas_500') return 'escala';
  return 'crecimiento';
}

interface PlanSelectorProps {
  volumen: string;
}

export function PlanSelector({ volumen }: PlanSelectorProps) {
  const searchParams = useSearchParams();
  const queryPlan = searchParams?.get('plan');

  const suggested = useMemo<PlanId>(() => {
    if (isValidPlanSlug(queryPlan)) return queryPlan;
    return suggestPlan(volumen);
  }, [queryPlan, volumen]);

  const [selected, setSelected] = useState<PlanId>(suggested);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const data = new FormData(e.currentTarget);
    await savePlanStep(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 space-y-3">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <label
              key={plan.id}
              className={`block cursor-pointer rounded-xl border p-5 transition ${
                isSelected
                  ? 'border-[#7C71FF] bg-[#7C71FF]/5 ring-1 ring-[#7C71FF]/40'
                  : 'border-ink/10 hover:border-[#7C71FF]/30'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={isSelected}
                onChange={() => setSelected(plan.id)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0A2540]">{plan.name}</span>
                    {plan.id === suggested && (
                      <span className="rounded-full bg-[#7C71FF] px-2 py-0.5 text-[10px] font-semibold text-white">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-xs text-ink/50">{plan.description}</p>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-ink/70">
                        <span className="text-[#7C71FF]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xl font-semibold text-[#0A2540]">
                    {formatMXN(plan.priceMonthlyMXN)}
                  </span>
                  <span className="block text-xs text-ink/40">{plan.priceSub}</span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selected === 'escala' && (
        <div className="mb-5 rounded-lg border border-[#7C71FF]/20 bg-[#7C71FF]/5 p-4 text-sm text-[#0A2540]">
          Un especialista te contactará en 24 horas para armar tu plan Escala a medida.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#7C71FF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5E52F5] disabled:opacity-60 active:scale-[0.98]"
        >
          {pending ? 'Guardando…' : `Elegir ${PLANS.find((p) => p.id === selected)?.name}`}
        </button>
      </div>
    </form>
  );
}
