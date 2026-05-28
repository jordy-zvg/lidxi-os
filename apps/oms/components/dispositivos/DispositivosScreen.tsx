'use client';

import { revokeDevice } from '@/app/admin/dispositivos/actions';
import { Button, EmptyState } from '@kobi/ui';
import { IconDeviceTablet, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PairingCodeModal } from './PairingCodeModal';

export interface DeviceRecord {
  id: string;
  name: string;
  status: 'active' | 'revoked';
  pairedAt: string;
  lastSeenAt: string | null;
}

interface DispositivosScreenProps {
  devices: DeviceRecord[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const DispositivosScreen = ({ devices }: DispositivosScreenProps) => {
  const router = useRouter();
  const [pairingOpen, setPairingOpen] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = devices.filter((d) => d.status === 'active');

  const handleRevoke = (id: string, name: string) => {
    if (!window.confirm(`¿Revocar acceso de "${name}"? La tablet pedirá emparejar de nuevo.`))
      return;
    setRevoking(id);
    setRevokeError(null);
    startTransition(async () => {
      const result = await revokeDevice(id);
      if (result.ok) {
        router.refresh();
      } else {
        setRevokeError(result.error);
      }
      setRevoking(null);
    });
  };

  return (
    <div className="flex flex-col gap-section-sm h-full">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-medium text-ink">Dispositivos</h1>
        <Button onClick={() => setPairingOpen(true)} size="sm">
          <IconPlus size={16} className="mr-1.5" />
          Vincular nuevo dispositivo
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-card-gap shrink-0">
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Total</p>
          <p className="font-mono text-2xl font-semibold text-ink">{devices.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Activos</p>
          <p className="font-mono text-2xl font-semibold text-ok">{active.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-lg p-card">
          <p className="text-xs text-ink-400 mb-kpi-label">Revocados</p>
          <p className="font-mono text-2xl font-semibold text-ink-400">
            {devices.length - active.length}
          </p>
        </div>
      </div>

      {revokeError && (
        <div
          role="alert"
          className="bg-danger-soft border border-danger text-danger-text text-sm px-3 py-2 rounded-md shrink-0"
        >
          {revokeError}
        </div>
      )}

      {devices.length === 0 ? (
        <EmptyState
          size="block"
          className="flex-1"
          icon={<IconDeviceTablet size={36} />}
          title="No hay dispositivos vinculados"
          description="Genera un código de emparejamiento y úsalo en la tablet para vincularla a tu restaurante."
        />
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden flex-1">
          <table className="w-full text-sm">
            <thead className="bg-canvas border-b border-line">
              <tr className="text-left text-xs text-ink-400">
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5 font-medium">Última actividad</th>
                <th className="px-4 py-2.5 font-medium">Vinculado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 text-ink font-medium">{d.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${d.status === 'active' ? 'bg-ok' : 'bg-ink-500'}`}
                      />
                      <span className={d.status === 'active' ? 'text-ink-200' : 'text-ink-400'}>
                        {d.status === 'active' ? 'Activo' : 'Revocado'}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-200 font-mono text-xs">
                    {formatDate(d.lastSeenAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-400 font-mono text-xs">
                    {formatDate(d.pairedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status === 'active' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRevoke(d.id, d.name)}
                        disabled={isPending && revoking === d.id}
                      >
                        {isPending && revoking === d.id ? 'Revocando…' : 'Revocar'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PairingCodeModal
        open={pairingOpen}
        onClose={() => {
          setPairingOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
};
