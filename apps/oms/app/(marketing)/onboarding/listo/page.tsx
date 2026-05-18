import type { Metadata } from 'next';

export const metadata: Metadata = { title: '¡Listo! · Onboarding' };

export default function OnboardingListoPage() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#635BFF]/10">
        <span className="text-3xl">🎉</span>
      </div>
      <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">¡Tu cuenta está lista!</h1>
      <p className="mb-8 text-sm text-ink/50">Paso 4 de 4 — Ya puedes empezar a operar.</p>

      {/* Activación disponible en Fase 4 */}
      <div className="rounded-xl border border-ink/8 bg-[#F6F9FC] p-6">
        <p className="text-sm text-ink/40">
          Activación y próximos pasos disponibles en Fase 4 del sprint.
        </p>
      </div>
    </div>
  );
}
