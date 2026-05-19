'use client';

import { saveRestauranteStep } from '@/app/(marketing)/onboarding/actions';
import { useRef, useState } from 'react';

const OPERATION_TYPES = [
  { value: 'dark_kitchen', label: 'Dark kitchen', sub: 'Solo delivery, sin sala' },
  {
    value: 'restaurante_delivery',
    label: 'Restaurante con delivery',
    sub: 'Sala + marketplace o propio',
  },
  { value: 'restaurante_sala', label: 'Restaurante con sala', sub: 'Sin delivery por ahora' },
  { value: 'cadena', label: 'Cadena multi-sucursal', sub: 'Varias ubicaciones' },
];

function validateRfc(rfc: string) {
  if (!rfc) return null;
  const clean = rfc.toUpperCase().replace(/\s/g, '');
  if (!/^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/.test(clean)) {
    return 'RFC inválido. Debe tener 12–13 caracteres (ej. MAPJ850312AB1)';
  }
  return null;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Ingresa 10 dígitos';
  return null;
}

export function RestauranteForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function validate(data: FormData): Record<string, string> {
    const errs: Record<string, string> = {};
    const name = (data.get('name') as string).trim();
    const rfc = (data.get('rfc') as string).trim();
    const address = (data.get('address') as string).trim();
    const phone = (data.get('phone') as string).trim();
    const op = data.get('operation_type') as string;

    if (name.length < 2) errs.name = 'Mínimo 2 caracteres';
    const rfcErr = validateRfc(rfc);
    if (rfcErr) errs.rfc = rfcErr;
    if (address.length < 10) errs.address = 'Ingresa una dirección más completa';
    const phoneErr = validatePhone(phone);
    if (phoneErr) errs.phone = phoneErr;
    if (!op) errs.operation_type = 'Elige un tipo de operación';

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errs = validate(data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    await saveRestauranteStep(data);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="rest-name" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Nombre del restaurante <span className="text-red-500">*</span>
        </label>
        <input
          id="rest-name"
          name="name"
          type="text"
          placeholder="El Mesón de los Sueños"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#635BFF]/30 ${errors.name ? 'border-red-400' : 'border-ink/15 focus:border-[#635BFF]'}`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* RFC */}
      <div>
        <label htmlFor="rest-rfc" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          RFC <span className="text-ink/40 font-normal">(opcional)</span>
        </label>
        <input
          id="rest-rfc"
          name="rfc"
          type="text"
          placeholder="MAPJ850312AB1"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm uppercase outline-none transition focus:ring-2 focus:ring-[#635BFF]/30 ${errors.rfc ? 'border-red-400' : 'border-ink/15 focus:border-[#635BFF]'}`}
        />
        {errors.rfc && <p className="mt-1 text-xs text-red-500">{errors.rfc}</p>}
      </div>

      {/* Dirección */}
      <div>
        <label htmlFor="rest-address" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Dirección <span className="text-red-500">*</span>
        </label>
        <textarea
          id="rest-address"
          name="address"
          rows={2}
          placeholder="Av. Álvaro Obregón 123, Roma Norte, CDMX"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#635BFF]/30 resize-none ${errors.address ? 'border-red-400' : 'border-ink/15 focus:border-[#635BFF]'}`}
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="rest-phone" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Teléfono <span className="text-red-500">*</span>
        </label>
        <input
          id="rest-phone"
          name="phone"
          type="tel"
          placeholder="55 1234 5678"
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#635BFF]/30 ${errors.phone ? 'border-red-400' : 'border-ink/15 focus:border-[#635BFF]'}`}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Tipo de operación */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[#0A2540]">
          Tipo de operación <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-2">
          {OPERATION_TYPES.map((op) => (
            <label
              key={op.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 p-3.5 transition hover:border-[#635BFF]/40 has-[:checked]:border-[#635BFF] has-[:checked]:bg-[#635BFF]/5"
            >
              <input
                type="radio"
                name="operation_type"
                value={op.value}
                className="mt-0.5 accent-[#635BFF]"
              />
              <div>
                <span className="text-sm font-medium text-[#0A2540]">{op.label}</span>
                <span className="block text-xs text-ink/50">{op.sub}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.operation_type && (
          <p className="mt-1 text-xs text-red-500">{errors.operation_type}</p>
        )}
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
