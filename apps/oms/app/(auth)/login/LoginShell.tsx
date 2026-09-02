'use client';

import { HoraEnVivo } from '@/components/HoraEnVivo';
import { activatePosStation, activatePosStationWithBranch } from '@/lib/auth-actions';
import { NO_EMPLOYEES_ERROR } from '@/lib/auth-errors';
import { formatTimeMX } from '@kobi/shared';
import { Card, Keypad, KobiWordmark, PinDots, StatusPill } from '@kobi/ui';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

const PIN_LENGTH = 4;

export interface LoginShellProps {
  stationName: string;
  branch: { id: string; name: string; restaurantName: string };
  lastActivation: { employee_full_name: string; started_at: string } | null;
  tenantId?: string;
  /** Si la tablet está vinculada a una sucursal específica, fuerza esa. */
  deviceBranchId?: string | null;
}

interface PendingBranchChoice {
  pin: string;
  employeeName: string;
  branches: { id: string; name: string }[];
}

export const LoginShell = ({
  stationName,
  branch,
  lastActivation,
  tenantId,
  deviceBranchId,
}: LoginShellProps) => {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [branchChoice, setBranchChoice] = useState<PendingBranchChoice | null>(null);

  const submit = useCallback(
    (full: string) => {
      setError(null);
      startTransition(async () => {
        const r = await activatePosStation(full, tenantId, deviceBranchId ?? null);
        if (!r.ok) {
          setShake(true);
          setError(r.error);
          setPin('');
          setTimeout(() => setShake(false), 320);
          return;
        }
        if (r.data.kind === 'needsBranchSelection') {
          // 2+ sucursales candidatas; pedir elección sin perder el PIN.
          setBranchChoice({
            pin: full,
            employeeName: r.data.employeeName,
            branches: r.data.branches,
          });
          setPin('');
          return;
        }
        setSuccess(true);
        setTimeout(() => router.push('/pedidos'), 200);
      });
    },
    [router, tenantId, deviceBranchId],
  );

  const handleBranchPick = useCallback(
    (branchId: string) => {
      if (!branchChoice || !tenantId) return;
      setError(null);
      startTransition(async () => {
        const r = await activatePosStationWithBranch(branchChoice.pin, tenantId, branchId);
        if (!r.ok) {
          setError(r.error);
          setBranchChoice(null);
          return;
        }
        setSuccess(true);
        setTimeout(() => router.push('/pedidos'), 200);
      });
    },
    [branchChoice, tenantId, router],
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
    <div className="flex min-h-screen">
      {/* Panel izquierdo — Marca Kobi */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] shrink-0 p-16"
        style={{ background: 'var(--ink, #0A2540)' }}
      >
        <KobiWordmark size="xl" variant="dark" withTagline />
        <p className="text-lg leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Ahorra hasta 28% en comisiones al diversificar tus canales de venta.
        </p>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex flex-1 items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="lg:hidden flex justify-center mb-8">
            <KobiWordmark size="lg" withTagline />
          </div>

          <Card padding="lg" className="flex flex-col gap-5 p-8">
            <header className="space-y-1">
              <Eyebrow>Estación</Eyebrow>
              <h1 className="text-[22px] font-medium text-ink">{stationName}</h1>
              {(branch.name || branch.restaurantName) && (
                <p className="text-[13px] text-ink-200">
                  {[branch.name, branch.restaurantName].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="pt-1">
                <StatusPill variant="warn">Estación inactiva</StatusPill>
              </div>
            </header>

            <section className="space-y-3 border-t border-line pt-4">
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
            </section>
          </Card>

          {branchChoice ? (
            <Card padding="lg" className="flex flex-col gap-5 p-8">
              <header className="text-center space-y-1">
                <Eyebrow>{`Hola, ${branchChoice.employeeName.split(' ')[0] ?? ''}`}</Eyebrow>
                <h2 className="text-lg font-medium text-ink">¿En qué sucursal vas a operar?</h2>
                <p className="text-[13px] text-ink-300">Selecciona para abrir tu turno</p>
              </header>
              <div className="flex flex-col gap-2">
                {branchChoice.branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBranchPick(b.id)}
                    disabled={pending || success}
                    className="w-full text-left px-4 py-3 rounded-lg border border-line bg-canvas hover:border-brand text-sm font-medium text-ink disabled:opacity-60"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              {error &&
                (error === NO_EMPLOYEES_ERROR ? (
                  <div
                    className="space-y-2 rounded-lg border border-line bg-canvas px-4 py-3 text-center"
                    role="alert"
                  >
                    <p className="text-[13px] text-ink-200">{error}</p>
                    <a
                      href="/admin/equipo"
                      className="inline-block text-[13px] font-medium text-brand hover:underline"
                    >
                      Ir a Equipo
                    </a>
                  </div>
                ) : (
                  <p className="text-[13px] font-medium text-danger-text text-center" role="alert">
                    {error}
                  </p>
                ))}
              <button
                type="button"
                onClick={() => {
                  setBranchChoice(null);
                  setError(null);
                }}
                disabled={pending || success}
                className="text-xs text-ink-400 hover:text-ink-200 disabled:opacity-60"
              >
                ← Volver al PIN
              </button>
            </Card>
          ) : (
            <Card padding="lg" className="flex flex-col items-center gap-6 p-8">
              <header className="text-center space-y-1">
                <Eyebrow>Inicia sesión en Kobi</Eyebrow>
                <h2 className="text-lg font-medium text-ink">Ingresa tu PIN</h2>
                <p className="text-[13px] text-ink-300">Solo gerentes y cajeros autorizados</p>
              </header>

              <PinDots value={pin} shake={shake} success={success} />

              <Keypad
                onDigit={onDigit}
                onBackspace={onBackspace}
                onClear={onClear}
                disabled={pending || success}
                size="md"
              />

              {error &&
                (error === NO_EMPLOYEES_ERROR ? (
                  <div
                    className="space-y-2 rounded-lg border border-line bg-canvas px-4 py-3 text-center"
                    role="alert"
                  >
                    <p className="text-[13px] text-ink-200">{error}</p>
                    <a
                      href="/admin/equipo"
                      className="inline-block text-[13px] font-medium text-brand hover:underline"
                    >
                      Ir a Equipo
                    </a>
                  </div>
                ) : (
                  <p className="text-[13px] font-medium text-danger-text text-center" role="alert">
                    {error}
                  </p>
                ))}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] text-ink-400">
                <IconInfoCircle size={13} />
                Activar el POS también registra tu hora de entrada
              </span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const raw = longDateFormatter.format(d);
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

const abbreviateName = (full: string): string => {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first || !last) return full;
  return `${first.charAt(0)}. ${last}`;
};
