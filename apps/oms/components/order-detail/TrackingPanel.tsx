'use client';

import { IconBike, IconPhone } from '@tabler/icons-react';
import type { TrackingStatus } from '../../hooks/useOrderTracking';
import type { TrackingSnapshot } from '../../lib/tracker';
import { CourierMap } from './CourierMap';

// Coordenadas del restaurante demo (Miztli Pardo, Roma Norte)
const RESTAURANT_LAT = 19.4194;
const RESTAURANT_LNG = -99.1678;

const STATUS_LABELS: Record<string, { label: string; bg: string }> = {
  pending: { label: 'Pendiente', bg: 'bg-surface-2 text-ink-200' },
  accepted: { label: 'Aceptado', bg: 'bg-brand-soft text-brand-text' },
  picking_up: { label: 'Recogiendo', bg: 'bg-warn-soft text-warn-text' },
  on_route: { label: 'En camino', bg: 'bg-brand-soft text-brand-text' },
  arrived: { label: 'Llegó', bg: 'bg-ok-soft text-ok-text' },
  delivered: { label: 'Entregado', bg: 'bg-ok-soft text-ok-text' },
  canceled: { label: 'Cancelado', bg: 'bg-danger-soft text-danger-text' },
};

const ConnectionBadge = ({ status }: { status: TrackingStatus }) => (
  <div className="flex items-center gap-1.5">
    <span
      className={`h-2 w-2 rounded-full ${
        status === 'live'
          ? 'bg-ok animate-pulse'
          : status === 'connecting'
            ? 'bg-warn animate-pulse'
            : 'bg-ink-500'
      }`}
    />
    <span className="text-xs font-mono text-ink-400 uppercase tracking-wider">
      {status === 'live' ? 'EN VIVO' : status === 'connecting' ? 'CONECTANDO' : 'DESCONECTADO'}
    </span>
  </div>
);

function formatEta(seconds: number | null): string {
  if (!seconds) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 1) return '< 1 min';
  return `~${mins} min`;
}

function avatarInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function avatarGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 60%), hsl(${(h + 40) % 360} 70% 50%))`;
}

interface TrackingPanelProps {
  tracking: TrackingSnapshot | null;
  connectionStatus: TrackingStatus;
  clientLat: number | null;
  clientLng: number | null;
}

export const TrackingPanel = ({
  tracking,
  connectionStatus,
  clientLat,
  clientLng,
}: TrackingPanelProps) => {
  const statusInfo = tracking ? (STATUS_LABELS[tracking.status] ?? STATUS_LABELS.pending) : null;

  return (
    <div className="w-[420px] shrink-0 flex flex-col gap-4 sticky top-0 self-start">
      {/* Badge EN VIVO */}
      <ConnectionBadge status={connectionStatus} />

      {/* Mapa */}
      {tracking ? (
        <CourierMap
          tracking={tracking}
          restaurantLat={RESTAURANT_LAT}
          restaurantLng={RESTAURANT_LNG}
          clientLat={clientLat}
          clientLng={clientLng}
        />
      ) : (
        <div className="h-[360px] rounded-xl bg-surface-2 border border-line flex items-center justify-center">
          <p className="text-sm text-ink-400">Esperando asignación de courier…</p>
        </div>
      )}

      {/* Status + ETA */}
      {tracking && statusInfo && (
        <div className="rounded-xl border border-line bg-surface p-5 space-y-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.bg}`}
          >
            {statusInfo.label}
          </span>
          <div>
            <p className="text-xs text-ink-400 mb-1">Llega en</p>
            <p className="font-mono text-4xl font-semibold text-ink tabular-nums">
              {formatEta(tracking.etaSeconds)}
            </p>
          </div>
          <p className="font-mono text-xs text-ink-400">
            Actualizado{' '}
            {new Date(tracking.lastEventAt).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
      )}

      {/* Courier */}
      {tracking?.courierName && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-3 mb-4">
            {tracking.courierPhoto ? (
              <img
                src={tracking.courierPhoto}
                alt={tracking.courierName}
                className="h-12 w-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                style={{ background: avatarGradient(tracking.courierName) }}
              >
                {avatarInitials(tracking.courierName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{tracking.courierName}</p>
              {tracking.courierRating && (
                <p className="font-mono text-xs text-ink-300">
                  ★ {tracking.courierRating.toFixed(2)}
                </p>
              )}
              {(tracking.courierVehicle || tracking.plate) && (
                <p className="text-xs text-ink-400">
                  <IconBike size={12} className="inline mr-1" />
                  {tracking.courierVehicle ?? 'Bicicleta'}
                  {tracking.plate && ` · ${tracking.plate}`}
                </p>
              )}
            </div>
          </div>
          {tracking.courierPhone && (
            <a
              href={`tel:${tracking.courierPhone}`}
              className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-line-2 text-sm text-ink-200 hover:bg-surface-2 transition-colors"
            >
              <IconPhone size={15} /> Llamar al courier
            </a>
          )}
        </div>
      )}
    </div>
  );
};
