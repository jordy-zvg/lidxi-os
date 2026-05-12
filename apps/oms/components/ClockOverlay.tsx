'use client';

import { ROLE_LABEL, formatDateMX, formatTimeMX } from '@lidxi/shared';
import { Keypad, Modal, PinDots } from '@lidxi/ui';
import {
  IconCheck,
  IconClock,
  IconClockStop,
  IconFingerprint,
  IconKeyboard,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LookupForClockResult,
  lookupForClock,
  performClockIn,
  performClockOut,
} from '../lib/auth-actions';

const PIN_LENGTH = 4;
const AUTO_DISMISS_MS = 3000;
// Jorge Vargas (manager) del seed demo — PIN para simular huella en demo
const DEMO_FINGERPRINT_PIN = '1234';

interface CheckInDone {
  kind: 'check_in_done';
  employee: LookupForClockResult['employee'];
  shift: { id: string; startedAt: string };
}
interface CheckOutPreview {
  kind: 'check_out_preview';
  employee: LookupForClockResult['employee'];
  openShift: { id: string; started_at: string };
}
interface CheckOutDone {
  kind: 'check_out_done';
  employee: LookupForClockResult['employee'];
  shift: { id: string; endedAt: string };
}
type Step = { kind: 'identify' } | { kind: 'pin' } | CheckInDone | CheckOutPreview | CheckOutDone;

export interface ClockOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const ClockOverlay = ({ open, onClose }: ClockOverlayProps) => {
  const [step, setStep] = useState<Step>({ kind: 'identify' });
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAndClose = useCallback(() => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    setStep({ kind: 'identify' });
    setPin('');
    setShake(false);
    setError(null);
    setBusy(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
      setStep({ kind: 'identify' });
      setPin('');
      setShake(false);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  const scheduleAutoDismiss = useCallback(() => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    autoDismissTimer.current = setTimeout(resetAndClose, AUTO_DISMISS_MS);
  }, [resetAndClose]);

  const handleSubmitPin = useCallback(
    async (fullPin: string) => {
      setBusy(true);
      setError(null);
      const lookup = await lookupForClock(fullPin);
      if (!lookup.ok) {
        setShake(true);
        setError(lookup.error);
        setPin('');
        setBusy(false);
        setTimeout(() => setShake(false), 320);
        return;
      }
      const { employee, openShift } = lookup.data;
      if (!openShift) {
        const result = await performClockIn(employee.id);
        if (!result.ok) {
          setError(result.error);
          setBusy(false);
          return;
        }
        setStep({
          kind: 'check_in_done',
          employee,
          shift: { id: result.data.shiftId, startedAt: result.data.startedAt },
        });
        setBusy(false);
        scheduleAutoDismiss();
        return;
      }
      setStep({ kind: 'check_out_preview', employee, openShift });
      setBusy(false);
    },
    [scheduleAutoDismiss],
  );

  const confirmCheckOut = useCallback(async () => {
    if (step.kind !== 'check_out_preview') return;
    setBusy(true);
    const result = await performClockOut(step.openShift.id);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setStep({
      kind: 'check_out_done',
      employee: step.employee,
      shift: { id: result.data.shiftId, endedAt: result.data.endedAt },
    });
    setBusy(false);
    scheduleAutoDismiss();
  }, [step, scheduleAutoDismiss]);

  const onDigit = (d: string) => {
    if (busy || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      void handleSubmitPin(next);
    }
  };

  return (
    <Modal open={open} onClose={resetAndClose} closeOnEscape={!busy} maxWidth="480px">
      {step.kind === 'identify' && (
        <IdentifyStep
          onClose={resetAndClose}
          onUsePin={() => setStep({ kind: 'pin' })}
          onPinSubmit={handleSubmitPin}
        />
      )}
      {step.kind === 'pin' && (
        <PinStep
          pin={pin}
          shake={shake}
          error={error}
          busy={busy}
          onDigit={onDigit}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
          onBack={() => {
            setStep({ kind: 'identify' });
            setPin('');
            setError(null);
          }}
          onClose={resetAndClose}
        />
      )}
      {step.kind === 'check_in_done' && (
        <CheckInDoneView employee={step.employee} startedAt={step.shift.startedAt} />
      )}
      {step.kind === 'check_out_preview' && (
        <CheckOutPreviewView
          employee={step.employee}
          openShift={step.openShift}
          busy={busy}
          onConfirm={confirmCheckOut}
          onCancel={resetAndClose}
        />
      )}
      {step.kind === 'check_out_done' && (
        <CheckOutDoneView employee={step.employee} endedAt={step.shift.endedAt} />
      )}
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

type FpState = 'idle' | 'scanning' | 'error';

const IdentifyStep = ({
  onClose,
  onUsePin,
  onPinSubmit,
}: {
  onClose: () => void;
  onUsePin: () => void;
  onPinSubmit: (pin: string) => Promise<void>;
}) => {
  const [fpState, setFpState] = useState<FpState>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleFingerprintSim = useCallback(async () => {
    if (fpState !== 'idle') return;
    setFpState('scanning');
    await new Promise<void>((r) => setTimeout(r, 800));
    await onPinSubmit(DEMO_FINGERPRINT_PIN);
    if (!mountedRef.current) return; // Success → parent unmounted this component
    // Still mounted → lookup failed, show error briefly
    setFpState('error');
    await new Promise<void>((r) => setTimeout(r, 600));
    if (!mountedRef.current) return;
    setFpState('idle');
  }, [fpState, onPinSubmit]);

  const ringColor =
    fpState === 'error' ? 'border-danger' : fpState === 'scanning' ? 'border-ok' : 'border-brand';

  const innerBg =
    fpState === 'error'
      ? 'bg-danger-soft'
      : fpState === 'scanning'
        ? 'bg-ok-soft scale-105'
        : 'bg-brand-soft';

  return (
    <div className="relative p-8">
      <CloseButton onClick={onClose} />

      <header className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400 mb-2">
          Registro de horario
        </p>
        <h2 className="text-xl font-medium text-ink mb-6">Identifícate para registrar</h2>
      </header>

      <div className="flex flex-col items-center rounded-lg bg-canvas py-9 px-6">
        <button
          type="button"
          onClick={handleFingerprintSim}
          disabled={fpState !== 'idle'}
          className="relative h-24 w-24 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-default cursor-pointer"
          aria-label="Simular lectura de huella (demo)"
          title="Haz clic para simular huella digital"
        >
          {fpState !== 'scanning' && (
            <>
              <span
                className={`absolute inset-0 animate-ring-pulse rounded-full border-2 ${ringColor}`}
              />
              <span
                className={`absolute inset-0 animate-ring-pulse rounded-full border-2 ${ringColor} [animation-delay:600ms]`}
              />
            </>
          )}
          <span
            className={`absolute inset-2 flex items-center justify-center rounded-full transition-all duration-200 ${innerBg}`}
          >
            {fpState === 'scanning' ? (
              <IconLoader2 size={28} className="text-ok animate-spin" />
            ) : fpState === 'error' ? (
              <IconX size={28} className="text-danger" />
            ) : (
              <IconFingerprint size={36} className="text-brand" />
            )}
          </span>
        </button>

        <p className="mt-5 text-[11px] italic text-ink-400">Haz clic para simular huella · demo</p>
        <p className="mt-1.5 text-xs text-ink-400">Por ahora usa tu PIN</p>
      </div>

      <div className="my-5 flex items-center gap-3">
        <hr className="flex-1 border-line" />
        <span className="text-xs text-ink-400">o usa tu PIN</span>
        <hr className="flex-1 border-line" />
      </div>

      <button
        type="button"
        onClick={onUsePin}
        className="flex w-full items-center justify-center gap-2 min-h-[44px] rounded-lg border-[0.5px] border-line-2 bg-surface px-4 py-3 text-sm font-medium text-ink hover:bg-canvas focus-visible:outline-none focus-visible:shadow-focus"
      >
        <IconKeyboard size={16} />
        Ingresar PIN
      </button>
    </div>
  );
};

const PinStep = ({
  pin,
  shake,
  error,
  busy,
  onDigit,
  onBackspace,
  onBack,
  onClose,
}: {
  pin: string;
  shake: boolean;
  error: string | null;
  busy: boolean;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onBack: () => void;
  onClose: () => void;
}) => (
  <div className="relative p-8">
    <CloseButton onClick={onClose} />
    <header className="mb-6 text-center">
      <h2 className="text-lg font-medium text-ink">Ingresa tu PIN</h2>
      {error ? (
        <p className="mt-1 text-xs text-danger-text">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-ink-400">
          {busy ? 'Verificando…' : 'Cualquier rol puede registrar entrada/salida'}
        </p>
      )}
    </header>

    <div className="mb-6 flex justify-center">
      <PinDots value={pin} shake={shake} />
    </div>

    <Keypad
      onDigit={onDigit}
      onBackspace={onBackspace}
      disabled={busy}
      size="sm"
      className="gap-[10px] py-4"
    />

    <button
      type="button"
      onClick={onBack}
      disabled={busy}
      className="mt-4 w-full h-10 rounded-md border border-line-2 bg-surface text-sm font-medium text-ink-200 hover:bg-canvas disabled:opacity-50"
    >
      Volver
    </button>
  </div>
);

const CheckInDoneView = ({
  employee,
  startedAt,
}: { employee: LookupForClockResult['employee']; startedAt: string }) => (
  <div className="p-8 text-center">
    <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-soft">
      <IconCheck size={40} className="text-ok" />
    </div>
    <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
      Entrada registrada
    </p>
    <h2 className="mt-1 text-[22px] font-medium text-ink">{employee.full_name}</h2>
    <p className="mt-1 text-sm text-ink-400">{ROLE_LABEL[employee.role]}</p>

    <div className="mt-5 rounded-lg bg-canvas p-4 text-left">
      <DataRow
        label="Hora de entrada"
        value={formatTimeMX(startedAt)}
        valueClass="text-lg font-semibold"
      />
      <DataRow label="Fecha" value={formatDateMX(startedAt)} valueClass="text-[13px]" />
    </div>

    <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-400">
      <IconClock size={12} />
      Esta ventana se cierra en 3 segundos
    </p>
  </div>
);

const CheckOutPreviewView = ({
  employee,
  openShift,
  busy,
  onConfirm,
  onCancel,
}: {
  employee: LookupForClockResult['employee'];
  openShift: { id: string; started_at: string };
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const duration = useNowMinusMinutes(openShift.started_at);
  return (
    <div className="p-8">
      <header className="mb-5 flex items-center gap-3">
        <Avatar seed={employee.id} />
        <div className="flex-1">
          <p className="text-base font-medium text-ink">{employee.full_name}</p>
          <p className="text-xs text-ink-400">{ROLE_LABEL[employee.role]}</p>
        </div>
      </header>

      <p className="text-sm text-ink">
        Tienes un turno abierto desde las{' '}
        <span className="font-mono font-medium">{formatTimeMX(openShift.started_at)}</span>.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-200">
        Han pasado <span className="font-mono">{duration}</span> desde tu entrada. ¿Quieres
        registrar tu salida?
      </p>

      <div className="mt-5 rounded-lg bg-canvas p-4">
        <DataRow label="Entrada" value={formatTimeMX(openShift.started_at)} />
        <DataRow label="Salida" value={<NowTime />} />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          <IconClockStop size={16} />
          {busy ? 'Registrando…' : 'Registrar salida'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="w-full rounded-md border border-line-2 bg-surface py-2 text-sm font-medium text-ink-200 hover:bg-canvas disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

const CheckOutDoneView = ({
  employee,
  endedAt,
}: { employee: LookupForClockResult['employee']; endedAt: string }) => (
  <div className="p-8 text-center">
    <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-soft">
      <IconCheck size={40} className="text-ok" />
    </div>
    <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
      Salida registrada
    </p>
    <h2 className="mt-1 text-[22px] font-medium text-ink">{employee.full_name}</h2>
    <p className="mt-1 text-sm text-ink-400">{ROLE_LABEL[employee.role]}</p>

    <div className="mt-5 rounded-lg bg-canvas p-4 text-left">
      <DataRow
        label="Hora de salida"
        value={formatTimeMX(endedAt)}
        valueClass="text-lg font-semibold"
      />
    </div>

    <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-400">
      <IconClock size={12} />
      Esta ventana se cierra en 3 segundos
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Cerrar"
    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-ink-300 hover:bg-canvas"
  >
    <IconX size={16} />
  </button>
);

const DataRow = ({
  label,
  value,
  valueClass = 'text-sm',
}: { label: string; value: React.ReactNode; valueClass?: string }) => (
  <div className="flex items-baseline justify-between gap-3 py-1">
    <span className="text-xs text-ink-400">{label}</span>
    <span className={`font-mono ${valueClass} text-ink`}>{value}</span>
  </div>
);

const NowTime = () => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return <>{now ? formatTimeMX(now) : '--:--'}</>;
};

const Avatar = ({ seed }: { seed: string }) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const h1 = hash;
  const h2 = (hash + 40) % 360;
  return (
    <div
      className="h-12 w-12 shrink-0 rounded-full"
      style={{ background: `linear-gradient(135deg, hsl(${h1} 70% 60%), hsl(${h2} 70% 50%))` }}
      aria-hidden
    />
  );
};

const useNowMinusMinutes = (startedAt: string): string => {
  const [label, setLabel] = useState('—');
  useEffect(() => {
    const tick = () => {
      const minutes = Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 60_000),
      );
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      setLabel(h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [startedAt]);
  return label;
};
