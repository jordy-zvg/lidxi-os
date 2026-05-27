'use client';
import {
  type EmployeeRole,
  getEmployeeBranches,
  suspendEmployee,
  updateEmployee,
} from '@/app/admin/equipo/actions';
import type { Role } from '@kobi/shared';
import { Button, SegmentedControl, Toggle } from '@kobi/ui';
import { IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { BranchOption, EmployeeRecord } from './EquipoScreen';

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
  employee: EmployeeRecord | null;
  branches: BranchOption[];
  onClose: () => void;
}

export const EmployeeSlideOver = ({ employee, branches, onClose }: EmployeeSlideOverProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('cook');
  const [pin, setPin] = useState('••••');
  const [pinGenerated, setPinGenerated] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    cancel_tickets: false,
    discounts: false,
    open_cash: false,
    view_reports: false,
    edit_inventory: false,
  });
  const [branchIds, setBranchIds] = useState<Set<string>>(new Set());
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    setName(employee.name);
    setRole((employee.role as Role) ?? 'cook');
    setPin('••••');
    setPinGenerated(false);
    setPinVisible(false);
    setPerms({
      cancel_tickets: employee.role === 'manager',
      discounts: employee.role === 'manager',
      open_cash: employee.role !== 'cook' && employee.role !== 'courier',
      view_reports: employee.role === 'manager',
      edit_inventory: employee.role === 'manager',
    });
    setToast(null);
    setError(null);
    setBranchesLoaded(false);
    setBranchIds(new Set());
    // Cargar asignación actual de sucursales — solo si hay >1 (caso multi-sucursal).
    if (branches.length > 1) {
      getEmployeeBranches(employee.id).then((ids) => {
        setBranchIds(new Set(ids));
        setBranchesLoaded(true);
      });
    } else {
      setBranchesLoaded(true);
    }
  }, [employee, branches.length]);

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
    setPinGenerated(true);
    setPinVisible(true);
    setToast(`PIN generado: ${newPin} — guárdalo ahora, no se volverá a mostrar`);
    setTimeout(() => {
      setPinVisible(false);
      setToast(null);
    }, 5000);
  };

  const togglePerm = (key: PermKey) => setPerms((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleBranch = (branchId: string) => {
    setBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) next.delete(branchId);
      else next.add(branchId);
      return next;
    });
  };

  const handleSave = () => {
    if (!employee) return;
    setError(null);
    startTransition(async () => {
      const result = await updateEmployee(employee.id, {
        name,
        role: role as EmployeeRole,
        ...(pinGenerated ? { pin } : {}),
        // Solo enviar branchIds si hay multi-sucursal Y ya cargamos.
        ...(branches.length > 1 && branchesLoaded ? { branchIds: Array.from(branchIds) } : {}),
        permissions: {
          cancel_tickets: perms.cancel_tickets,
          discounts: perms.discounts,
          open_cash: perms.open_cash,
          view_reports: perms.view_reports,
          edit_inventory: perms.edit_inventory,
        },
      });
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  const handleSuspend = () => {
    if (
      !employee ||
      !window.confirm(`¿Suspender a ${employee.name}? No podrá operar hasta reactivación.`)
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await suspendEmployee(employee.id);
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.error);
      }
    });
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

          {/* Sucursales — solo se muestra con 2+ */}
          {branches.length > 1 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                Sucursales asignadas
              </h3>
              <div className="bg-canvas rounded-lg border border-line px-3">
                {branches.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center justify-between py-2.5 border-b border-line last:border-b-0 cursor-pointer"
                  >
                    <span className="text-sm text-ink-200">{b.name}</span>
                    <input
                      type="checkbox"
                      checked={branchIds.has(b.id)}
                      onChange={() => toggleBranch(b.id)}
                      disabled={!branchesLoaded}
                      className="h-4 w-4 accent-brand"
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-2">
                Si no marcas ninguna, el empleado podrá operar en cualquier sucursal activa (default
                backwards compat).
              </p>
            </section>
          )}

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

        <footer className="shrink-0 border-t border-line px-5 py-4 flex flex-col gap-3">
          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md"
            >
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="text-sm font-medium text-danger-text hover:underline disabled:opacity-50"
              onClick={handleSuspend}
              disabled={isPending}
            >
              Suspender empleado
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </footer>
      </dialog>
    </>
  );
};
