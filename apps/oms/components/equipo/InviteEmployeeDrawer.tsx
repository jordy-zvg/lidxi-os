'use client';

import { type EmployeeRole, inviteEmployee } from '@/app/admin/equipo/actions';
import { Button } from '@kobi/ui';
import { IconX } from '@tabler/icons-react';
import { useActionState, useEffect, useState } from 'react';

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: 'manager', label: 'Gerente' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'courier', label: 'Repartidor' },
];

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

interface InviteEmployeeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function InviteEmployeeDrawer({ open, onClose }: InviteEmployeeDrawerProps) {
  const [pin, setPin] = useState(randomPin);
  const [pinVisible, setPinVisible] = useState(true);
  const [state, action, pending] = useActionState(inviteEmployee, {});

  useEffect(() => {
    if (!open) return;
    setPin(randomPin());
    setPinVisible(true);
  }, [open]);

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [state.success, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

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
        aria-label="Invitar empleado"
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
          <span className="font-medium text-sm text-ink">Invitar empleado</span>
        </header>

        <form action={action} className="flex flex-col flex-1 overflow-hidden">
          <input type="hidden" name="pin" value={pin} />

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {state.error && (
              <div className="rounded-md bg-danger-soft border border-danger px-4 py-2.5 text-sm text-danger-text">
                {state.error}
              </div>
            )}
            {state.success && (
              <div className="rounded-md bg-ok-soft border border-ok px-4 py-2.5 text-sm text-ok-text">
                Empleado creado correctamente.
              </div>
            )}

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                Datos básicos
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1" htmlFor="inv-name">
                    Nombre completo
                  </label>
                  <input
                    id="inv-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ej. María López"
                    className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1" htmlFor="inv-role">
                    Rol
                  </label>
                  <select
                    id="inv-role"
                    name="role"
                    required
                    defaultValue="cashier"
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
                PIN generado automáticamente. Compártelo con el empleado — no se mostrará de nuevo.
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
            <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || state.success}>
              {pending ? 'Guardando…' : 'Crear empleado'}
            </Button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
