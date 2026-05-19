'use client';

import { signUp } from '@/lib/supabase/auth-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FormState {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  acepto: boolean;
}

const INITIAL: FormState = {
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  acepto: false,
};

function passwordStrength(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0) return { label: '', color: 'bg-ink/10', pct: 0 };
  const score =
    (pw.length >= 8 ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(pw) ? 1 : 0) +
    (pw.length >= 12 ? 1 : 0);
  if (score <= 1) return { label: 'Débil', color: 'bg-red-400', pct: 25 };
  if (score === 2) return { label: 'Regular', color: 'bg-amber-400', pct: 50 };
  if (score === 3) return { label: 'Buena', color: 'bg-[#635BFF]', pct: 75 };
  return { label: 'Fuerte', color: 'bg-green-400', pct: 100 };
}

export function RegistroForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
    setServerError('');
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim()) errs.nombre = 'Nombre requerido';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email inválido';
    }
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Debe incluir al menos un número';
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = 'Las contraseñas no coinciden';
    if (!form.acepto) errs.acepto = 'Debes aceptar los términos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signUp(form.email, form.password, form.nombre);
    setLoading(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/registro/confirma-email?email=${encodeURIComponent(form.email)}`);
  };

  const strength = passwordStrength(form.password);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Nombre completo" error={errors.nombre} required>
        <input
          type="text"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="María García"
          autoComplete="name"
          className={inputCls(!!errors.nombre)}
        />
      </Field>

      <Field label="Email del trabajo" error={errors.email} required>
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="maria@micocina.mx"
          autoComplete="email"
          className={inputCls(!!errors.email)}
        />
      </Field>

      <Field label="Contraseña" error={errors.password} required>
        <input
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          className={inputCls(!!errors.password)}
        />
        {form.password.length > 0 && (
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-ink/10">
              <div
                className={`h-1.5 rounded-full transition-all ${strength.color}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink/50">{strength.label}</p>
          </div>
        )}
      </Field>

      <Field label="Confirmar contraseña" error={errors.confirmPassword} required>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          className={inputCls(!!errors.confirmPassword)}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.acepto}
            onChange={set('acepto')}
            className="mt-0.5 h-4 w-4 rounded border-ink/20 text-[#635BFF] focus:ring-[#635BFF]/30"
          />
          <span className="text-sm text-ink/60">
            Acepto los{' '}
            <Link href="/terminos" className="text-[#635BFF] hover:underline">
              términos de uso
            </Link>{' '}
            y el{' '}
            <Link href="/privacidad" className="text-[#635BFF] hover:underline">
              aviso de privacidad
            </Link>
            .
          </span>
        </label>
        {errors.acepto && <p className="mt-1 text-xs text-red-500">{errors.acepto}</p>}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4f48d9] active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <div className="relative my-2 flex items-center gap-3">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="text-xs text-ink/30">o</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-ink/50">
        ¿Ya tienes cuenta?{' '}
        <Link href="/ingresar" className="font-medium text-[#635BFF] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    const { signInWithGoogle } = await import('@/lib/supabase/auth-actions');
    const result = await signInWithGoogle();
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-ink/15 bg-white px-6 py-2.5 text-sm font-medium text-[#0A2540] transition-all hover:border-ink/30 hover:bg-ink/[0.02] active:scale-[0.98] disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </svg>
      {loading ? 'Redirigiendo…' : 'Continuar con Google'}
    </button>
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
    // biome-ignore lint/a11y/noLabelWithoutControl: control is passed via children
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#0A2540]">
        {label}
        {required && <span className="ml-0.5 text-[#635BFF]">*</span>}
      </span>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0A2540] outline-none transition-all',
    'placeholder:text-ink/30 focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20',
    hasError ? 'border-red-400 bg-red-50/50' : 'border-ink/15 bg-white hover:border-ink/30',
  ].join(' ');
}
