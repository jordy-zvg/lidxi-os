'use client';

import { pairDevice } from '@/app/(auth)/login/pairing-actions';
import { Button, KobiWordmark } from '@kobi/ui';
import { IconDeviceTablet } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

const CODE_MAX = 8;

export const PairingShell = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await pairDevice(code);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <KobiWordmark className="h-7 text-ink" />
        </div>

        <div className="bg-surface border border-line rounded-xl p-6 shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-canvas border border-line-2 flex items-center justify-center">
              <IconDeviceTablet size={24} className="text-brand" />
            </div>
          </div>

          <h1 className="text-lg font-medium text-ink text-center">Vincular dispositivo</h1>
          <p className="text-sm text-ink-400 text-center mt-1.5">
            Pide al administrador un código en{' '}
            <span className="font-mono text-ink-200">Admin → Dispositivos</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-xs text-ink-400 mb-1.5" htmlFor="pairing-code">
              Código de emparejamiento
            </label>
            <input
              ref={inputRef}
              id="pairing-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="A1B2C3"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={CODE_MAX}
              inputMode="text"
              className="w-full h-12 rounded-md border border-line-2 bg-canvas px-3 text-center font-mono text-2xl tracking-[0.3em] text-ink focus:outline-none focus:border-brand"
            />

            {error && (
              <div
                role="alert"
                className="mt-3 bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={isPending || !code.trim()}>
              {isPending ? 'Vinculando…' : 'Vincular dispositivo'}
            </Button>
          </form>
        </div>

        <p className="text-xs text-ink-400 text-center mt-6">
          El código expira a los 10 minutos de generarse.
        </p>
      </div>
    </div>
  );
};
