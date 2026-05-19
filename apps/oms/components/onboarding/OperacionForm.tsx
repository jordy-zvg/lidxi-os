'use client';

import { saveOperacionStep } from '@/app/(marketing)/onboarding/actions';
import { useState } from 'react';

const CANALES = [
  { value: 'uber_eats', label: 'Uber Eats' },
  { value: 'rappi', label: 'Rappi' },
  { value: 'didi_food', label: 'Didi Food' },
  { value: 'sitio_propio', label: 'Tu propio sitio (storefront)' },
  { value: 'presencial', label: 'Solo presencial / sala' },
];

const VOLUMENES = [
  { value: 'menos_50', label: 'Menos de 50 pedidos' },
  { value: '50_200', label: '50–200 pedidos' },
  { value: '200_500', label: '200–500 pedidos' },
  { value: 'mas_500', label: 'Más de 500 pedidos' },
];

const EQUIPOS = [
  { value: 'solo_yo', label: 'Solo yo' },
  { value: '2_5', label: '2–5 personas' },
  { value: '6_15', label: '6–15 personas' },
  { value: 'mas_15', label: 'Más de 15' },
];

export function OperacionForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};

    const canales = data.getAll('canales');
    if (canales.length === 0) errs.canales = 'Selecciona al menos un canal';
    if (!data.get('volumen')) errs.volumen = 'Elige una opción';
    if (!data.get('equipo')) errs.equipo = 'Elige una opción';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    await saveOperacionStep(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Canales */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          ¿Qué canales usas actualmente? <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-2">
          {CANALES.map((c) => (
            <label
              key={c.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 px-3.5 py-3 transition hover:border-[#635BFF]/40 has-[:checked]:border-[#635BFF] has-[:checked]:bg-[#635BFF]/5"
            >
              <input type="checkbox" name="canales" value={c.value} className="accent-[#635BFF]" />
              <span className="text-sm text-[#0A2540]">{c.label}</span>
            </label>
          ))}
        </div>
        {errors.canales && <p className="mt-1 text-xs text-red-500">{errors.canales}</p>}
      </fieldset>

      {/* Volumen */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Volumen diario aproximado <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {VOLUMENES.map((v) => (
            <label
              key={v.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink/10 px-3.5 py-3 transition hover:border-[#635BFF]/40 has-[:checked]:border-[#635BFF] has-[:checked]:bg-[#635BFF]/5"
            >
              <input type="radio" name="volumen" value={v.value} className="accent-[#635BFF]" />
              <span className="text-sm text-[#0A2540]">{v.label}</span>
            </label>
          ))}
        </div>
        {errors.volumen && <p className="mt-1 text-xs text-red-500">{errors.volumen}</p>}
      </fieldset>

      {/* Equipo */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Tamaño del equipo <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPOS.map((eq) => (
            <label
              key={eq.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink/10 px-3.5 py-3 transition hover:border-[#635BFF]/40 has-[:checked]:border-[#635BFF] has-[:checked]:bg-[#635BFF]/5"
            >
              <input type="radio" name="equipo" value={eq.value} className="accent-[#635BFF]" />
              <span className="text-sm text-[#0A2540]">{eq.label}</span>
            </label>
          ))}
        </div>
        {errors.equipo && <p className="mt-1 text-xs text-red-500">{errors.equipo}</p>}
      </fieldset>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#635BFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f48d9] disabled:opacity-60 active:scale-[0.98]"
        >
          {pending ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </form>
  );
}
