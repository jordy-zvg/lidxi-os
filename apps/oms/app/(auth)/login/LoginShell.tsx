'use client';

import { HoraEnVivo } from '@/components/HoraEnVivo';
import { activatePosStation } from '@/lib/auth-actions';
import { formatTimeMX } from '@lidxi/shared';
import { Card, Keypad, PinDots, StatusPill } from '@lidxi/ui';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

const PIN_LENGTH = 4;

export interface LoginShellProps {
  stationName: string;
  branch: { id: string; name: string; restaurantName: string };
  lastActivation: { employee_full_name: string; started_at: string } | null;
}

export const LoginShell = ({ stationName, branch, lastActivation }: LoginShellProps) => {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = useCallback(
    (full: string) => {
      setError(null);
      startTransition(async () => {
        const r = await activatePosStation(full);
        if (!r.ok) {
          setShake(true);
          setError(r.error);
          setPin('');
          setTimeout(() => setShake(false), 320);
          return;
        }
        setSuccess(true);
        setTimeout(() => router.push('/pedidos'), 200);
      });
    },
    [router],
  );

  const onDigit = (d: string) => {
    if (pending || success || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  };
  const onBackspace = () => {
    if (pending || success) return;
    setPin((p) => p.slice(0, -1));
  };
  const onClear = () => {
    if (pending || success) return;
    setPin('');
  };

  return (
    <div className="grid w-full max-w-[980px] grid-cols-1 gap-10 px-10 py-10 md:grid-cols-2">
      <Card padding="lg" className="flex min-h-[520px] flex-col justify-between p-10">
        <header className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-semibold text-white">
            L
          </span>
          <span className="text-base font-semibold text-ink">LidxiOS</span>
        </header>

        <section className="flex flex-col gap-3">
          <Eyebrow>Estación</Eyebrow>
          <h1 className="text-[22px] font-medium text-ink">{stationName}</h1>
          <p className="text-[13px] text-ink-200">
            {branch.name} · {branch.restaurantName}
          </p>
          <div>
            <StatusPill variant="warn">Estación inactiva</StatusPill>
          </div>
        </section>

        <section className="space-y-3 border-t border-line pt-6">
          <Eyebrow>Estado del día</Eyebrow>
          <DataRow label={<LongDateLabel />} value={<HoraEnVivo className="font-mono" />} />
          <DataRow
            label="Última activación"
            value={
              lastActivation ? (
                <span>
                  <span className="font-mono">
                    {formatRelativeShort(new Date(lastActivation.started_at))}
                  </span>
                  {' · '}
                  {abbreviateName(lastActivation.employee_full_name)}
                </span>
              ) : (
                <span className="text-ink-400">Sin activaciones previas</span>
              )
            }
          />
          <DataRow
            label="Caja"
            value={<span className="text-ink-300">Cerrada · pendiente apertura</span>}
          />
        </section>
      </Card>

      <Card padding="lg" className="flex min-h-[520px] flex-col items-center p-10">
        <header className="flex flex-col items-center gap-2">
          <Eyebrow>Activar estación</Eyebrow>
          <h2 className="text-lg font-medium text-ink">Ingresa tu PIN para empezar</h2>
          <p className="text-[13px] text-ink-300">Solo gerentes y cajeros autorizados</p>
        </header>

        <div className="my-8">
          <PinDots value={pin} shake={shake} success={success} />
        </div>

        <Keypad
          onDigit={onDigit}
          onBackspace={onBackspace}
          onClear={onClear}
          disabled={pending || success}
          size="md"
        />

        {error && (
          <p className="mt-5 text-[13px] font-medium text-danger-text" role="alert">
            {error}
          </p>
        )}

        <div className="mt-auto pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] text-ink-400">
            <IconInfoCircle size={13} />
            Activar el POS también registra tu hora de entrada
          </span>
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------------------------------------

const Eyebrow = ({ children }: { children: string }) => (
  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">{children}</p>
);

const DataRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-3 text-[13px]">
    <span className="text-ink-300">{label}</span>
    <span className="text-ink">{value}</span>
  </div>
);

const LongDateLabel = () => {
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(formatLongDateMX(new Date()));
  }, []);
  return <span>{label || '…'}</span>;
};

const longDateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Mexico_City',
});

const formatLongDateMX = (d: Date): string => {
  const raw = longDateFormatter.format(d); // "lunes, 11 de mayo"
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatRelativeShort = (d: Date): string => {
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = formatTimeMX(d);
  if (sameDay) return `Hoy ${time}`;
  if (isYesterday) return `Ayer ${time}`;
  const short = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Mexico_City',
  }).format(d);
  return `${short} · ${time}`;
};

/** "Jorge Vargas" → "J. Vargas" */
const abbreviateName = (full: string): string => {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last) return full;
  return `${first.charAt(0)}. ${last}`;
};
