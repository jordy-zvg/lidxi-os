'use client';

import { signIn } from '@/lib/supabase/auth-actions';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

function safeRedirectTo(raw: string | null): string | null {
  if (!raw) return null;
  // Only allow same-origin internal admin paths to prevent open-redirect.
  if (!raw.startsWith('/admin/')) return null;
  return raw;
}

export function IngresarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectTo(searchParams.get('redirectTo'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const target = redirectTo
      ? `/auth/post-login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/post-login';
    router.push(target as import('next').Route);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="ingresar-email" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Email <span className="text-[#635BFF]">*</span>
        </label>
        <input
          id="ingresar-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="maria@micocina.mx"
          autoComplete="email"
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-ink/30 outline-none transition-all focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 hover:border-ink/30"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="ingresar-password" className="text-sm font-medium text-[#0A2540]">
            Contraseña <span className="text-[#635BFF]">*</span>
          </label>
          <Link href="/recuperar" className="text-xs text-[#635BFF] hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>
        <input
          id="ingresar-password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-ink/30 outline-none transition-all focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20 hover:border-ink/30"
        />
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4f48d9] active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="text-xs text-ink/30">o</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-sm text-ink/50">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-[#635BFF] hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}

function GoogleSignInButton() {
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
