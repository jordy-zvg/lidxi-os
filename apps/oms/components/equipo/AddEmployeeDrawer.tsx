'use client';

import { type EmployeeRole, addEmployee } from '@/app/admin/equipo/actions';
import { Button } from '@kobi/ui';
import { IconCheck, IconFingerprint, IconX } from '@tabler/icons-react';
import { useEffect, useState, useTransition } from 'react';

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: 'manager', label: 'Gerente' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'courier', label: 'Repartidor' },
];

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

type Step = 'datos' | 'huella' | 'listo';
type FingerprintState = 'idle' | 'scanning' | 'enrolled';

interface AddEmployeeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AddEmployeeDrawer({ open, onClose }: AddEmployeeDrawerProps) {
  const [step, setStep] = useState<Step>('datos');
  const [name, setName] = useState('');
  const [role, setRole] = useState<EmployeeRole>('cashier');
  const [pin, setPin] = useState(randomPin);
  const [pinVisible, setPinVisible] = useState(true);
  const [fingerprintState, setFingerprintState] = useState<FingerprintState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setStep('datos');
    setName('');
    setRole('cashier');
    setPin(randomPin());
    setPinVisible(true);
    setFingerprintState('idle');
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (withFingerprint: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await addEmployee({
        name: name.trim(),
        role,
        pin,
        fingerprintEnrolled: withFingerprint,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep('listo');
      setTimeout(onClose, 1200);
    });
  };

  const handleDatosNext = () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('El nombre es requerido.');
      return;
    }
    setStep('huella');
  };

  const handleScanFingerprint = () => {
    setFingerprintState('scanning');
    setTimeout(() => {
      setFingerprintState('enrolled');
      setTimeout(() => submit(true), 600);
    }, 1200);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        onClick={onClose}
        role="presentation"
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label="Agregar empleado"
        className="fixed right-0 top-0 bottom-0 z-50 w-[480px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">Agregar empleado</span>
          <span className="ml-auto text-xs text-ink-400 font-mono">
            {step === 'datos' ? '1/2' : step === 'huella' ? '2/2' : '✓'}
          </span>
        </header>

        {step === 'datos' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {error && (
                <div className="rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
                  {error}
                </div>
              )}

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  Datos básicos
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-ink-400 mb-1" htmlFor="add-name">
                      Nombre completo
                    </label>
                    <input
                      id="add-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. María López"
                      className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-400 mb-1" htmlFor="add-role">
                      Rol
                    </label>
                    <select
                      id="add-role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value as EmployeeRole)}
                      className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  PIN de acceso
                </h3>
                <p className="text-xs text-ink-400 mb-3">
                  PIN generado automáticamente. Compártelo con el empleado — no se mostrará de
                  nuevo.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {(['p0', 'p1', 'p2', 'p3'] as const).map((k, i) => (
                      <div
                        key={k}
                        className="h-10 w-10 rounded-md border border-line-2 bg-canvas flex items-center justify-center font-mono text-lg font-semibold text-ink"
                      >
                        {pinVisible ? pin[i] : '●'}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setPinVisible((v) => !v)}
                    >
                      {pinVisible ? 'Ocultar' : 'Mostrar'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPin(randomPin());
                        setPinVisible(true);
                      }}
                    >
                      Regenerar
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            <footer className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleDatosNext}>
                Continuar
              </Button>
            </footer>
          </div>
        )}

        {step === 'huella' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {error && (
                <div className="rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
                  {error}
                </div>
              )}

              <section className="text-center">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                  Registrar huella
                </h3>
                <p className="text-sm text-ink-300 mb-6">
                  La huella permite que {name.split(' ')[0] || 'el empleado'} active su sesión de
                  POS sin teclear el PIN. Puedes omitir este paso y registrarla después.
                </p>

                <div className="flex flex-col items-center gap-4 py-4">
                  <div
                    className={`h-32 w-32 rounded-full flex items-center justify-center transition-all ${
                      fingerprintState === 'idle'
                        ? 'bg-canvas border-2 border-line-2'
                        : fingerprintState === 'scanning'
                          ? 'bg-brand/10 border-2 border-brand animate-pulse'
                          : 'bg-ok-soft border-2 border-ok'
                    }`}
                  >
                    {fingerprintState === 'enrolled' ? (
                      <IconCheck size={56} className="text-ok-text" />
                    ) : (
                      <IconFingerprint
                        size={56}
                        className={fingerprintState === 'scanning' ? 'text-brand' : 'text-ink-400'}
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium text-ink-300 font-mono">
                    {fingerprintState === 'idle' && 'Toca el botón para registrar'}
                    {fingerprintState === 'scanning' && 'Escaneando huella…'}
                    {fingerprintState === 'enrolled' && 'Huella registrada ✓'}
                  </p>
                </div>
              </section>
            </div>

            <footer className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => submit(false)}
                disabled={pending || fingerprintState !== 'idle'}
              >
                Omitir por ahora
              </Button>
              <Button
                type="button"
                onClick={handleScanFingerprint}
                disabled={pending || fingerprintState !== 'idle'}
              >
                {fingerprintState === 'idle' && 'Registrar huella'}
                {fingerprintState === 'scanning' && 'Escaneando…'}
                {fingerprintState === 'enrolled' && 'Guardando…'}
              </Button>
            </footer>
          </div>
        )}

        {step === 'listo' && (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-4 gap-3">
            <div className="h-14 w-14 rounded-full bg-ok-soft border border-ok flex items-center justify-center">
              <IconCheck size={28} className="text-ok-text" />
            </div>
            <p className="text-sm font-medium text-ink">Empleado agregado</p>
            <p className="text-xs text-ink-400 text-center max-w-xs">
              {name} ya puede activar su sesión de POS con el PIN compartido.
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
