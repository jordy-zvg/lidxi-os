'use client';

import { ROLE_LABEL, formatDateMX, formatTimeMX } from '@lidxi/shared';
import { Keypad, Modal, PinDots } from '@lidxi/ui';
import {
  IconCheck,
  IconClock,
  IconClockStop,
  IconFingerprint,
  IconKeyboard,
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
interface CheckOutConfirm {
  kind: 'check_out_confirm';
  employee: LookupForClockResult['employee'];
  openShift: { id: string; started_at: string };
}
interface CheckOutDone {
  kind: 'check_out_done';
  employee: LookupForClockResult['employee'];
  shift: { id: string; endedAt: string };
}

type Step =
  | { kind: 'identify' }
  | { kind: 'pin_clockin' }
  | {
      kind: 'pin_confirm';
      employee: LookupForClockResult['employee'];
      openShift: { id: string; started_at: string };
    }
  | CheckInDone
  | CheckOutPreview
  | CheckOutConfirm
  | CheckOutDone;

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

  const finalizeClockOut = useCallback(
    async (shiftId: string, employee: LookupForClockResult['employee']) => {
      setBusy(true);
      setError(null);
      const result = await performClockOut(shiftId);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      setStep({
        kind: 'check_out_done',
        employee,
        shift: { id: result.data.shiftId, endedAt: result.data.endedAt },
      });
      setBusy(false);
      scheduleAutoDismiss();
    },
    [scheduleAutoDismiss],
  );

  const goToConfirm = useCallback(() => {
    if (step.kind !== 'check_out_preview') return;
    setStep({ kind: 'check_out_confirm', employee: step.employee, openShift: step.openShift });
  }, [step]);

  const onDigit = (d: string) => {
    if (busy || pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      if (step.kind === 'pin_confirm') {
        void finalizeClockOut(step.openShift.id, step.employee);
      } else {
        void handleSubmitPin(next);
      }
    }
  };

  const isPinStep = step.kind === 'pin_clockin' || step.kind === 'pin_confirm';

  return (
    <Modal open={open} onClose={resetAndClose} closeOnEscape={!busy} maxWidth="480px">
      {step.kind === 'identify' && (
        <IdentifyStep
          onClose={resetAndClose}
          onUsePin={() => setStep({ kind: 'pin_clockin' })}
          onPinSubmit={handleSubmitPin}
        />
      )}
      {isPinStep && (
        <PinStep
          pin={pin}
          shake={shake}
          error={error}
          busy={busy}
          onDigit={onDigit}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
          onBack={() => {
            if (step.kind === 'pin_confirm') {
              setStep({
                kind: 'check_out_confirm',
                employee: step.employee,
                openShift: step.openShift,
              });
            } else {
              setStep({ kind: 'identify' });
            }
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
          onProceedToConfirm={goToConfirm}
          onCancel={resetAndClose}
        />
      )}
      {step.kind === 'check_out_confirm' && (
        <CheckOutConfirmStep
          onClose={resetAndClose}
          onConfirmBiometric={() => finalizeClockOut(step.openShift.id, step.employee)}
          onUsePin={() =>
            setStep({ kind: 'pin_confirm', employee: step.employee, openShift: step.openShift })
          }
          onBack={() =>
            setStep({
              kind: 'check_out_preview',
              employee: step.employee,
              openShift: step.openShift,
            })
          }
        />
      )}
      {step.kind === 'check_out_done' && (
        <CheckOutDoneView employee={step.employee} endedAt={step.shift.endedAt} />
      )}
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// FingerprintButton — animación de llenado con clip-path
// ---------------------------------------------------------------------------

type FpPhase = 'idle' | 'scanning' | 'done' | 'error';

interface FingerprintButtonProps {
  onSubmit: () => Promise<void>;
  label: string;
}

const FingerprintButton = ({ onSubmit, label }: FingerprintButtonProps) => {
  const [fillProgress, setFillProgress] = useState(0);
  const [fpPhase, setFpPhase] = useState<FpPhase>('idle');
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (fpPhase !== 'idle') return;
    setFpPhase('scanning');
    setFillProgress(0);

    // Fill animation ~800ms (100 / 4 = 25 ticks × 30ms = 750ms)
    await new Promise<void>((resolve) => {
      let progress = 0;
      const id = setInterval(() => {
        if (!mountedRef.current) {
          clearInterval(id);
          resolve();
          return;
        }
        progress = Math.min(progress + 4, 100);
        setFillProgress(progress);
        if (progress >= 100) {
          clearInterval(id);
          intervalRef.current = null;
          resolve();
        }
      }, 30);
      intervalRef.current = id;
    });

    if (!mountedRef.current) return;
    setFpPhase('done');
    await new Promise<void>((r) => setTimeout(r, 300));
    if (!mountedRef.current) return;

    await onSubmit();
    if (!mountedRef.current) return;

    // Still mounted → onSubmit resulted in an error
    setFpPhase('error');
    setFillProgress(100);
    await new Promise<void>((r) => setTimeout(r, 400));
    if (!mountedRef.current) return;
    setFpPhase('idle');
    setFillProgress(0);
  }, [fpPhase, onSubmit]);

  const fillColor = fpPhase === 'error' ? 'text-danger' : 'text-ok';
  const ringColor =
    fpPhase === 'error'
      ? 'border-danger'
      : fpPhase === 'scanning' || fpPhase === 'done'
        ? 'border-ok'
        : 'border-brand';
  const ringSpeed = fpPhase === 'scanning' ? '[animation-duration:0.8s]' : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={fpPhase !== 'idle'}
      className="relative h-24 w-24 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-default cursor-pointer"
      aria-label="Simular lectura de huella (demo)"
      title={label}
    >
      <span
        className={`absolute inset-0 animate-ring-pulse rounded-full border-2 ${ringColor} ${ringSpeed}`}
      />
      <span
        className={`absolute inset-0 animate-ring-pulse rounded-full border-2 ${ringColor} ${ringSpeed} [animation-delay:600ms]`}
      />
      <span className="absolute inset-2 flex items-center justify-center rounded-full bg-canvas">
        <div className="relative h-12 w-12">
          <IconFingerprint size={48} className="text-ink-500" />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(${100 - fillProgress}% 0 0 0)` }}
          >
            <IconFingerprint size={48} className={`absolute top-0 left-0 ${fillColor}`} />
          </div>
        </div>
      </span>
    </button>
  );
};

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

const IdentifyStep = ({
  onClose,
  onUsePin,
  onPinSubmit,
}: {
  onClose: () => void;
  onUsePin: () => void;
  onPinSubmit: (pin: string) => Promise<void>;
}) => (
  <div className="relative p-8">
    <CloseButton onClick={onClose} />

    <header className="text-center">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-400">
        Registro de horario
      </p>
      <h2 className="mb-6 text-xl font-medium text-ink">Identifícate para registrar</h2>
    </header>

    <div className="flex flex-col items-center rounded-lg bg-canvas py-9 px-6">
      <FingerprintButton
        onSubmit={() => onPinSubmit(DEMO_FINGERPRINT_PIN)}
        label="Haz clic en la huella para simular · demo"
      />
      <p className="mt-5 text-[11px] italic text-ink-400">
        Haz clic en la huella para simular · demo
      </p>
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

const CheckOutConfirmStep = ({
  onClose,
  onConfirmBiometric,
  onUsePin,
  onBack,
}: {
  onClose: () => void;
  onConfirmBiometric: () => Promise<void>;
  onUsePin: () => void;
  onBack: () => void;
}) => (
  <div className="relative p-8">
    <CloseButton onClick={onClose} />

    <header className="text-center">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-400">
        Confirmar salida
      </p>
      <h2 className="mb-6 text-xl font-medium text-ink">Confirma con tu huella o PIN</h2>
    </header>

    <div className="flex flex-col items-center rounded-lg bg-canvas py-9 px-6">
      <FingerprintButton
        onSubmit={onConfirmBiometric}
        label="Haz clic en la huella para confirmar · demo"
      />
      <p className="mt-5 text-[11px] italic text-ink-400">
        Haz clic en la huella para confirmar · demo
      </p>
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

    <button
      type="button"
      onClick={onBack}
      className="mt-3 w-full h-9 rounded-md text-sm font-medium text-ink-300 hover:bg-canvas transition-colors"
    >
      Volver
    </button>
  </div>
);

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
  onProceedToConfirm,
  onCancel,
}: {
  employee: LookupForClockResult['employee'];
  openShift: { id: string; started_at: string };
  busy: boolean;
  onProceedToConfirm: () => void;
  onCancel: () => void;
}) => {
  const duration = useNowMinusMinutes(openShift.started_at);
  return (
    <div className="p-8">
      <header className="flex items-center gap-3">
        <Avatar seed={employee.id} />
        <div className="flex-1">
          <p className="text-base font-medium text-ink">{employee.full_name}</p>
          <p className="text-xs text-ink-400">{ROLE_LABEL[employee.role]}</p>
        </div>
      </header>

      <p className="mt-5 text-sm text-ink">
        Tienes un turno abierto desde las{' '}
        <span className="font-mono font-medium">{formatTimeMX(openShift.started_at)}</span>.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-200">
        Han pasado <span className="font-mono">{duration}</span> desde tu entrada. ¿Quieres
        registrar tu salida?
      </p>

      <div className="mt-4 rounded-lg bg-canvas p-5 mb-6">
        <div className="space-y-2">
          <DataRow label="Entrada" value={formatTimeMX(openShift.started_at)} />
          <DataRow label="Salida" value={<NowTime />} />
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <button
          type="button"
          onClick={onProceedToConfirm}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand min-h-[44px] px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          <IconClockStop size={16} />
          Registrar salida
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="w-full rounded-md border border-line-2 bg-surface min-h-[44px] text-sm font-medium text-ink-200 hover:bg-canvas disabled:opacity-50"
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
  <div className="flex items-baseline justify-between gap-3 py-0.5">
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
      if (minutes < 1) {
        setLabel('3h 24m (demo)');
        return;
      }
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
