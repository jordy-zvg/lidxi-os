'use client';
import { Button, SegmentedControl, Toggle } from '@lidxi/ui';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { MockEmployee } from './mock-employees';

type PermKey = 'cancel_tickets' | 'discounts' | 'open_cash' | 'view_reports' | 'edit_inventory';

const PERM_LABELS: Record<PermKey, string> = {
  cancel_tickets: 'Cancelar tickets',
  discounts: 'Aplicar descuentos manuales',
  open_cash: 'Abrir caja',
  view_reports: 'Ver reportes financieros',
  edit_inventory: 'Editar inventario',
};

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Gerente' },
  { value: 'cashier', label: 'Cajero' },
  { value: 'cook', label: 'Cocinero' },
  { value: 'courier', label: 'Repartidor' },
] as const;

interface EmployeeSlideOverProps {
  employee: MockEmployee | null;
  onClose: () => void;
}

export const EmployeeSlideOver = ({ employee, onClose }: EmployeeSlideOverProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<MockEmployee['role']>('cook');
  const [pin, setPin] = useState('••••');
  const [pinVisible, setPinVisible] = useState(false);
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    cancel_tickets: false,
    discounts: false,
    open_cash: false,
    view_reports: false,
    edit_inventory: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    setName(employee.name);
    setRole(employee.role);
    setPin('••••');
    setPinVisible(false);
    setPerms({
      cancel_tickets: employee.role === 'manager',
      discounts: employee.role === 'manager',
      open_cash: employee.role !== 'cook' && employee.role !== 'courier',
      view_reports: employee.role === 'manager',
      edit_inventory: employee.role === 'manager',
    });
    setToast(null);
  }, [employee]);

  useEffect(() => {
    if (!employee) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [employee, onClose]);

  if (!employee) return null;

  const generatePin = () => {
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    setPin(newPin);
    setPinVisible(true);
    setToast(`PIN generado: ${newPin} — guárdalo ahora, no se volverá a mostrar`);
    setTimeout(() => {
      setPinVisible(false);
      setToast(null);
    }, 5000);
  };

  const togglePerm = (key: PermKey) => setPerms((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40"
        onClick={onClose}
        role="presentation"
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label={`Editar empleado ${employee.name}`}
        className="fixed right-0 top-0 bottom-0 z-50 w-[480px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-ok-soft border border-ok text-ok-text text-sm px-4 py-2.5 rounded-lg shadow">
            {toast}
          </div>
        )}

        <header className="shrink-0 border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">{employee.name}</span>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Datos básicos */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Datos básicos
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="emp-name">
                  Nombre
                </label>
                <input
                  id="emp-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 rounded-md border border-line-2 bg-canvas px-3 text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <span className="block text-xs text-ink-400 mb-1">Rol</span>
                <SegmentedControl
                  options={ROLE_OPTIONS}
                  value={role}
                  onChange={setRole}
                  size="sm"
                />
              </div>
            </div>
          </section>

          {/* PIN */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              PIN de acceso
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {(['d1', 'd2', 'd3', 'd4'] as const).map((key, i) => (
                  <div
                    key={key}
                    className="h-9 w-9 rounded-md border border-line-2 bg-canvas flex items-center justify-center font-mono text-sm text-ink"
                  >
                    {pinVisible ? pin[i] : '●'}
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={generatePin}>
                Generar nuevo PIN
              </Button>
            </div>
          </section>

          {/* Permisos */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
              Permisos especiales
            </h3>
            <div className="bg-canvas rounded-lg border border-line px-3">
              {(Object.keys(PERM_LABELS) as PermKey[]).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 border-b border-line last:border-b-0"
                >
                  <span className="text-sm text-ink-200">{PERM_LABELS[key]}</span>
                  <Toggle
                    checked={perms[key]}
                    onChange={() => togglePerm(key)}
                    label={PERM_LABELS[key]}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm font-medium text-danger-text hover:underline"
            onClick={onClose}
          >
            Suspender empleado
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onClose}>Guardar cambios</Button>
          </div>
        </footer>
      </dialog>
    </>
  );
};
