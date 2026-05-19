'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function resolveSession() {
      // PKCE flow: Supabase redirects with ?code=<code>&type=recovery
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) {
          setError('El enlace expiró o ya fue usado. Solicita uno nuevo.');
          return;
        }
        // Clean the code from the URL so a reload doesn't re-exchange
        const clean = new URL(window.location.href);
        clean.searchParams.delete('code');
        clean.searchParams.delete('type');
        window.history.replaceState(null, '', clean.toString());
        setReady(true);
        return;
      }

      // Implicit flow: only accept when hash explicitly signals a recovery token.
      // Do NOT fall through to checking active sessions — a regular authenticated
      // user navigating here directly would also have a session, which would let
      // them change their password without a recovery link (H29).
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('type') === 'recovery' && hashParams.get('access_token')) {
        // supabase-js parses the hash on init; give it one tick to establish the session.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
          return;
        }
        setTimeout(async () => {
          const { data: d2 } = await supabase.auth.getSession();
          if (d2.session) {
            setReady(true);
          } else {
            setError('El enlace expiró o ya fue usado. Solicita uno nuevo.');
          }
        }, 250);
        return;
      }

      // No recovery token found in URL — reject regardless of any active session.
      setError('El enlace expiró o ya fue usado. Solicita uno nuevo.');
    }

    resolveSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Mínimo 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/auth/post-login'), 1200);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <IconCheck size={24} />
        </div>
        <p className="text-sm text-[#0A2540]">Contraseña actualizada. Redirigiendo…</p>
      </div>
    );
  }

  if (!ready && error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/20 bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
        <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pw" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Nueva contraseña
        </label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] outline-none transition-all focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20"
        />
      </div>
      <div>
        <label htmlFor="pw2" className="mb-1.5 block text-sm font-medium text-[#0A2540]">
          Confirma la contraseña
        </label>
        <input
          id="pw2"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] outline-none transition-all focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/20"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-sm text-[#DC2626]">
          <IconAlertCircle size={14} /> {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !ready}
        className="w-full rounded-lg bg-[#635BFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f48d9] disabled:opacity-60"
      >
        {!ready ? 'Validando enlace…' : pending ? 'Guardando…' : 'Actualizar contraseña'}
      </button>
    </form>
  );
}
