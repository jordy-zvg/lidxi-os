'use client';

import { activateBranchAction, deactivateBranchAction } from '@/app/admin/sucursales/actions';
import { Button } from '@kobi/ui';
import { IconBuildingStore, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SucursalSlideOver } from './SucursalSlideOver';

export interface BranchRecord {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface SucursalesScreenProps {
  branches: BranchRecord[];
}

export const SucursalesScreen = ({ branches }: SucursalesScreenProps) => {
  const router = useRouter();
  const [editing, setEditing] = useState<BranchRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = branches.filter((b) => b.status === 'active');

  const handleToggleStatus = (b: BranchRecord) => {
    const next = b.status === 'active' ? 'inactive' : 'active';
    const verb = next === 'inactive' ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿${verb.charAt(0).toUpperCase() + verb.slice(1)} "${b.name}"?`)) return;

    setPendingId(b.id);
    setError(null);
    startTransition(async () => {
      const result =
        next === 'inactive' ? await deactivateBranchAction(b.id) : await activateBranchAction(b.id);
      if (result.ok) router.refresh();
      else setError(result.error);
      setPendingId(null);
    });
  };

  return (
    <div className="flex flex-col gap-section-sm h-full">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-medium text-ink">Sucursales</h1>
        <Button onClick={() => setCreating(true)} size="sm">
          <IconPlus size={16} className="mr-1.5" />
          Nueva sucursal
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-card-gap shrink-0">
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Total</p>
          <p className="font-mono text-2xl font-semibold text-ink">{branches.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Activas</p>
          <p className="font-mono text-2xl font-semibold text-ok">{active.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Inactivas</p>
          <p className="font-mono text-2xl font-semibold text-ink-400">
            {branches.length - active.length}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md shrink-0"
        >
          {error}
        </div>
      )}

      {branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
          <IconBuildingStore size={36} className="text-ink-400" />
          <p className="text-sm font-medium text-ink">Aún no hay sucursales</p>
          <p className="text-xs text-ink-400 max-w-xs">
            Crea tu primera sucursal para empezar a recibir pedidos y abrir turnos.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden flex-1">
          <table className="w-full text-sm">
            <thead className="bg-canvas border-b border-line">
              <tr className="text-left text-xs text-ink-400">
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                <th className="px-4 py-2.5 font-medium">Dirección</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 text-ink font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-ink-200">{b.address || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${b.status === 'active' ? 'bg-ok' : 'bg-ink-500'}`}
                      />
                      <span className={b.status === 'active' ? 'text-ink-200' : 'text-ink-400'}>
                        {b.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(b)}>
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleStatus(b)}
                      disabled={isPending && pendingId === b.id}
                    >
                      {isPending && pendingId === b.id
                        ? '…'
                        : b.status === 'active'
                          ? 'Desactivar'
                          : 'Reactivar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SucursalSlideOver
        branch={editing}
        creating={creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          router.refresh();
        }}
      />
    </div>
  );
};
