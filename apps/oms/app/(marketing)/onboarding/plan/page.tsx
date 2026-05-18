import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Elige tu plan · Onboarding' };

export default function OnboardingPlanPage() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Elige tu plan</h1>
      <p className="mb-8 text-sm text-ink/50">Paso 3 de 4 — 14 días gratis en cualquier plan</p>

      {/* Selector de planes disponible en Fase 4 */}
      <div className="rounded-xl border border-ink/8 bg-[#F6F9FC] p-6 text-center">
        <p className="text-sm text-ink/40">Selector de planes disponible en Fase 4 del sprint.</p>
      </div>
    </div>
  );
}
