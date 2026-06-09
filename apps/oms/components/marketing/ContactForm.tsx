'use client';

import { IconAlertCircle } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TIPOS = [
  { value: 'demo', label: 'Demo personalizada' },
  { value: 'soporte', label: 'Soporte (cliente existente)' },
  { value: 'escala', label: 'Cotización plan Escala' },
  { value: 'prensa', label: 'Prensa y medios' },
  { value: 'otro', label: 'Otro' },
];

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  tipo: string;
  mensaje: string;
  acepto: boolean;
}

const INITIAL: FormState = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  tipo: '',
  mensaje: '',
  acepto: false,
};

function validate(state: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!state.nombre.trim()) {
    errors.nombre = 'Este campo es requerido';
  } else if (state.nombre.trim().length < 2) {
    errors.nombre = 'Tu nombre debe tener al menos 2 caracteres';
  }
  if (!state.email.trim()) {
    errors.email = 'Este campo es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.email = 'Necesitamos un correo válido para responderte';
  }
  if (state.telefono && !/^[\d\s\-+()]{10,15}$/.test(state.telefono)) {
    errors.telefono = 'Formato de teléfono inválido';
  }
  if (!state.empresa.trim()) errors.empresa = 'Este campo es requerido';
  if (!state.tipo) errors.tipo = 'Este campo es requerido';
  if (!state.mensaje.trim()) {
    errors.mensaje = 'Este campo es requerido';
  } else if (state.mensaje.trim().length < 10) {
    errors.mensaje = 'Cuéntanos un poco más, mínimo 10 caracteres';
  } else if (state.mensaje.trim().length > 2000) {
    errors.mensaje = 'Por brevedad, mantén tu mensaje bajo 2000 caracteres';
  }
  if (!state.acepto) errors.acepto = 'Debes aceptar para continuar';
  return errors;
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo) setForm((f) => ({ ...f, tipo }));
  }, [searchParams]);

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.nombre,
          email: form.email,
          message: form.mensaje,
          source: `web_contact_form:${form.tipo || 'otro'}`,
        }),
      });
      if (res.status === 429) {
        setServerError('Demasiados intentos, espera unos minutos antes de reintentar.');
        setStatus('idle');
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as {
          details?: Record<string, { _errors?: string[] }>;
        } | null;
        const apiErrors: Partial<Record<keyof FormState, string>> = {};
        const details = body?.details;
        if (details?.name?._errors?.length) apiErrors.nombre = 'Este campo es requerido';
        if (details?.email?._errors?.length)
          apiErrors.email = 'Necesitamos un correo válido para responderte';
        if (details?.message?._errors?.length)
          apiErrors.mensaje = 'Cuéntanos un poco más, mínimo 10 caracteres';
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else {
          setServerError('Revisa los campos del formulario e inténtalo de nuevo.');
        }
        setStatus('idle');
        return;
      }
      if (!res.ok) throw new Error('Server error');
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#7C71FF]/20 bg-[#7C71FF]/5 px-8 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7C71FF]/10">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-[#0A2540]">Mensaje recibido.</h3>
        <p className="text-ink/60">Te contactamos en menos de 24 horas hábiles.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
          <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}
      <Field label="Nombre completo" error={errors.nombre} required>
        <input
          type="text"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="María García"
          className={inputCls(!!errors.nombre)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email} required>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="maria@micocina.mx"
            className={inputCls(!!errors.email)}
          />
        </Field>
        <Field label="Teléfono" error={errors.telefono}>
          <input
            type="tel"
            value={form.telefono}
            onChange={set('telefono')}
            placeholder="+52 55 0000 0000"
            className={inputCls(!!errors.telefono)}
          />
        </Field>
      </div>

      <Field label="Restaurante / Empresa" error={errors.empresa} required>
        <input
          type="text"
          value={form.empresa}
          onChange={set('empresa')}
          placeholder="Mi Cocina"
          className={inputCls(!!errors.empresa)}
        />
      </Field>

      <Field label="Tipo de consulta" error={errors.tipo} required>
        <select value={form.tipo} onChange={set('tipo')} className={inputCls(!!errors.tipo)}>
          <option value="">Selecciona...</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Mensaje" error={errors.mensaje} required>
        <textarea
          value={form.mensaje}
          onChange={set('mensaje')}
          placeholder="Cuéntanos sobre tu operación y cómo podemos ayudarte..."
          rows={4}
          className={inputCls(!!errors.mensaje)}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.acepto}
            onChange={set('acepto')}
            className="mt-0.5 h-4 w-4 rounded border-ink/20 text-[#7C71FF] focus:ring-[#7C71FF]/30"
          />
          <span className="text-sm text-ink/60">
            Acepto que Kobi me contacte en relación a esta consulta.{' '}
            <a href="/privacidad" className="text-[#7C71FF] hover:underline">
              Aviso de privacidad
            </a>
            .
          </span>
        </label>
        {errors.acepto && (
          <p className="mt-1 flex items-center gap-1 text-sm text-[#DC2626]">
            <IconAlertCircle size={14} className="shrink-0" />
            <span>{errors.acepto}</span>
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Ocurrió un error al enviar. Inténtalo de nuevo o escríbenos directamente a ventas@kobi.mx
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-[#7C71FF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5E52F5] active:scale-[0.98] disabled:opacity-60"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-[#0A2540]">
        {label}
        {required && <span className="ml-0.5 text-[#7C71FF]">*</span>}
      </p>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#DC2626]">
          <IconAlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0A2540] outline-none transition-all',
    'placeholder:text-ink/30',
    'focus:border-[#7C71FF] focus:ring-2 focus:ring-[#7C71FF]/20',
    hasError
      ? 'border-b-2 border-b-[#DC2626] border-x-ink/15 border-t-ink/15 bg-red-50/50'
      : 'border-ink/15 bg-white hover:border-ink/30',
  ].join(' ');
}
