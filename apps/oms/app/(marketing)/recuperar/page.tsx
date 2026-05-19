'use client';

import { sendPasswordResetEmail } from '@/lib/supabase/auth-actions';
import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';
import { useState } from 'react';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido.');
      return;
    }
    setStatus('sending');
    const result = await sendPasswordResetEmail(email);
    if (!result.ok) {
      setError(result.error);
      setStatus('error');
      return;
    }
    setStatus('sent');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F9FC] px-4">
      <div className="mb-8">
        <KobiWordmark size="sm" variant="light" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-10 shadow-sm">
        {status === 'sent' ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Correo enviado</h1>
            <p className="mb-6 text-sm leading-relaxed text-ink/60">
              Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu
              contraseña.
            </p>
            <Link href="/ingresar" className="text-sm font-medium text-[#635BFF] hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Recupera tu contraseña</h1>
            <p className="mb-6 text-sm text-ink/50">
              Ingresa tu correo y te enviamos un enlace para crear una nueva contraseña.
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="recover-email"
                  className="mb-1.5 block text-sm font-medium text-[#0A2540]"
                >
                  Email <span className="text-[#635BFF]">*</span>
                </label>
                <input
                  id="recover-email"
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
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4f48d9] active:scale-[0.98] disabled:opacity-60"
              >
                {status === 'sending' ? 'Enviando…' : 'Enviar enlace'}
              </button>

              <p className="text-center text-sm text-ink/50">
                <Link href="/ingresar" className="font-medium text-[#635BFF] hover:underline">
                  Volver a iniciar sesión
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
