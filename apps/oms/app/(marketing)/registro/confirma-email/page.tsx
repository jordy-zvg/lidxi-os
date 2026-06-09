'use client';

import { resendConfirmationEmail } from '@/lib/supabase/auth-actions';
import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

const COOLDOWN_S = 60;

function ConfirmaEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [cooldown, setCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResendStatus('sending');
    const result = await resendConfirmationEmail(email);
    if (!result.ok) {
      setResendStatus('error');
      return;
    }
    setResendStatus('sent');
    setCooldown(COOLDOWN_S);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F9FC] px-4">
      <div className="mb-8">
        <KobiWordmark size="sm" variant="light" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-10 text-center shadow-sm">
        {/* Email icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7C71FF]/10">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="4" y="8" width="24" height="16" rx="3" stroke="#7C71FF" strokeWidth="2" />
            <path d="M4 11l12 8 12-8" stroke="#7C71FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-[#0A2540]">Confirma tu correo</h1>
        <p className="mb-1 text-sm text-ink/60">Te enviamos un enlace a</p>
        <p className="mb-6 text-sm font-medium text-[#0A2540]">{email || 'tu correo'}</p>
        <p className="mb-8 text-sm leading-relaxed text-ink/50">
          Haz click en el enlace del correo para activar tu cuenta. Revisa también tu carpeta de
          spam.
        </p>

        {/* Resend */}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendStatus === 'sending'}
          className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-[#0A2540] transition-all hover:border-ink/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendStatus === 'sending'
            ? 'Enviando…'
            : cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : 'Reenviar correo'}
        </button>

        {resendStatus === 'sent' && (
          <p className="mt-3 text-xs text-green-600">Correo reenviado. Revisa tu bandeja.</p>
        )}
        {resendStatus === 'error' && (
          <p className="mt-3 text-xs text-red-500">Error al reenviar. Intenta de nuevo.</p>
        )}

        <p className="mt-6 text-xs text-ink/40">
          ¿Usaste el correo equivocado?{' '}
          <Link href="/registro" className="text-[#7C71FF] hover:underline">
            Vuelve al registro
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmaEmailPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center bg-[#F6F9FC]" />}
    >
      <ConfirmaEmailContent />
    </Suspense>
  );
}
