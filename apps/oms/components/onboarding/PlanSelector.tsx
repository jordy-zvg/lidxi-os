'use client';

import { savePlanStep } from '@/app/(marketing)/onboarding/actions';
import { useState } from 'react';

interface Plan {
  id: 'arranque' | 'crecimiento' | 'escala';
  name: string;
  price: string | null;
  priceSub: string;
  description: string;
  features: string[];
  salesContact?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'arranque',
    name: 'Arranque',
    price: '$499',
    priceSub: '/mes',
    description: 'Para cocinas que están empezando o tienen bajo volumen.',
    features: [
      '1 sucursal',
      'Hasta 100 pedidos/día',
      'POS + KDS básico',
      'Integración con 1 marketplace',
      'Soporte por email',
    ],
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    price: '$999',
    priceSub: '/mes',
    description: 'Para operaciones en expansión con múltiples canales.',
    features: [
      'Hasta 3 sucursales',
      'Pedidos ilimitados',
      'POS + KDS + Reportes avanzados',
      'Todos los marketplaces',
      'Sitio propio incluido',
      'Soporte prioritario WhatsApp',
    ],
  },
  {
    id: 'escala',
    name: 'Escala',
    price: null,
    priceSub: '',
    description: 'Para cadenas y operaciones de alto volumen con necesidades especiales.',
    features: [
      'Sucursales ilimitadas',
      'SLA personalizado',
      'Integraciones enterprise',
      'Account manager dedicado',
      'Onboarding asistido',
    ],
    salesContact: true,
  },
];

function suggestPlan(volumen: string): Plan['id'] {
  if (volumen === 'menos_50') return 'arranque';
  if (volumen === 'mas_500') return 'escala';
  return 'crecimiento';
}

interface PlanSelectorProps {
  volumen: string;
}

export function PlanSelector({ volumen }: PlanSelectorProps) {
  const suggested = suggestPlan(volumen);
  const [selected, setSelected] = useState<Plan['id']>(suggested);
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
                  ? 'border-[#635BFF] bg-[#635BFF]/5 ring-1 ring-[#635BFF]/40'
                  : 'border-ink/10 hover:border-[#635BFF]/30'
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
                      <span className="rounded-full bg-[#635BFF] px-2 py-0.5 text-[10px] font-semibold text-white">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-xs text-ink/50">{plan.description}</p>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-ink/70">
                        <span className="text-[#635BFF]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 text-right">
                  {plan.price ? (
                    <>
                      <span className="text-xl font-semibold text-[#0A2540]">{plan.price}</span>
                      <span className="block text-xs text-ink/40">{plan.priceSub}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold text-[#0A2540]">Cotización</span>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selected === 'escala' && (
        <div className="mb-5 rounded-lg border border-[#635BFF]/20 bg-[#635BFF]/5 p-4 text-sm text-[#0A2540]">
          Un especialista te contactará en 24 horas para armar tu plan Escala a medida.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#635BFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f48d9] disabled:opacity-60 active:scale-[0.98]"
        >
          {pending
            ? 'Guardando…'
            : selected === 'escala'
              ? 'Hablar con ventas'
              : `Elegir ${PLANS.find((p) => p.id === selected)?.name}`}
        </button>
      </div>
    </form>
  );
}
