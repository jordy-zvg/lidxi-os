'use client';

import {
  type DeliveryRow,
  type DirectOrderWithDelivery,
  syncDelivery,
} from '@/lib/delivery-actions';
import { StatusPill } from '@kobi/ui';
import { IconMapPin, IconPhone, IconRoute } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

const STAGES: Array<{ key: DeliveryRow['status']; label: string }> = [
  { key: 'pending', label: 'Buscando courier' },
  { key: 'courier_assigned', label: 'Courier en camino al restaurante' },
  { key: 'pickup_arrived', label: 'Courier en el restaurante' },
  { key: 'picked_up', label: 'En camino al cliente' },
  { key: 'dropoff_arrived', label: 'En la dirección del cliente' },
  { key: 'delivered', label: 'Entregada' },
];

function stageIndex(status: string): number {
  const i = STAGES.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

interface DeliveryTrackingPanelProps {
  delivery: DeliveryRow;
  order: DirectOrderWithDelivery | null;
}

export function DeliveryTrackingPanel({
  delivery: initialDelivery,
  order,
}: DeliveryTrackingPanelProps) {
  const [delivery, setDelivery] = useState<DeliveryRow>(initialDelivery);

  // Poll cada 4s mientras la delivery esté activa.
  useEffect(() => {
    if (delivery.status === 'delivered' || delivery.status === 'canceled') return;
    const id = setInterval(async () => {
      const r = await syncDelivery(delivery.id);
      if (r.ok) setDelivery(r.data);
    }, 4_000);
    return () => clearInterval(id);
  }, [delivery.id, delivery.status]);

  const currentStage = stageIndex(delivery.status);
  const isCanceled = delivery.status === 'canceled';
  const variant = isCanceled
    ? 'danger'
    : delivery.status === 'delivered'
      ? 'ok'
      : delivery.status === 'pending'
        ? 'warn'
        : 'info';

  return (
    <section className="bg-surface border border-line rounded-lg p-card">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
              Entrega activa
              <StatusPill variant={variant}>
                {STAGES.find((s) => s.key === delivery.status)?.label ?? delivery.status}
              </StatusPill>
            </h2>
            {order && (
              <p className="text-xs text-ink-400 mt-0.5">
                {order.folio} · {order.customer_name}
              </p>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-ink-400 flex flex-col gap-0.5">
          {delivery.dropoff_eta && (
            <span>
              ETA{' '}
              <span className="font-mono font-medium text-ink">
                {new Date(delivery.dropoff_eta).toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          )}
          <span className="text-[11px]">Refresca automáticamente</span>
        </div>
      </header>

      {/* Stepper horizontal con fallback vertical */}
      <ol className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0 mb-5">
        {STAGES.map((stage, idx) => {
          const reached = idx <= currentStage && !isCanceled;
          const active = idx === currentStage && !isCanceled;
          return (
            <li
              key={stage.key}
              className="flex sm:flex-1 sm:flex-col items-center gap-2 sm:gap-0 relative"
            >
              <div className="flex flex-col items-center sm:w-full">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono font-medium border ${
                    reached
                      ? 'bg-brand border-brand text-white'
                      : 'bg-canvas border-line-2 text-ink-400'
                  } ${active ? 'ring-2 ring-brand/30' : ''}`}
                >
                  {idx + 1}
                </div>
                {idx < STAGES.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-3.5 left-1/2 w-full h-px ${reached && idx < currentStage ? 'bg-brand' : 'bg-line-2'}`}
                  />
                )}
              </div>
              <div className="sm:mt-2 sm:text-center">
                <p className={`text-[11px] leading-tight ${reached ? 'text-ink' : 'text-ink-400'}`}>
                  {stage.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Courier card */}
        <div className="bg-canvas border border-line-2 rounded-md p-3 col-span-1">
          <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Courier</p>
          {delivery.courier_name ? (
            <>
              <p className="text-sm font-medium text-ink">{delivery.courier_name}</p>
              <p className="text-xs text-ink-400 capitalize">
                {delivery.courier_vehicle ?? 'vehículo'}
              </p>
              {delivery.courier_phone && (
                <p className="text-[11px] text-ink-300 mt-1 flex items-center gap-1">
                  <IconPhone size={10} />
                  {delivery.courier_phone}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-400 italic">Aún sin asignar</p>
          )}
        </div>

        {/* Map snippet (placeholder con la posición del courier) */}
        <div className="bg-canvas border border-line-2 rounded-md p-3 col-span-1 sm:col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1 flex items-center gap-1">
            <IconRoute size={10} />
            Ubicación en vivo
          </p>
          <DeliveryMap delivery={delivery} />
        </div>
      </div>

      {isCanceled && delivery.cancel_reason && (
        <p className="mt-3 text-xs text-danger-text">Cancelada: {delivery.cancel_reason}</p>
      )}
    </section>
  );
}

function DeliveryMap({ delivery }: { delivery: DeliveryRow }) {
  const pickup = useMemo(() => {
    const p = (delivery.pickup_address ?? {}) as Record<string, unknown>;
    return {
      lat: (p.lat as number) ?? 19.4326,
      lng: (p.lng as number) ?? -99.1332,
    };
  }, [delivery.pickup_address]);

  const dropoff = useMemo(() => {
    const d = (delivery.dropoff_address ?? {}) as Record<string, unknown>;
    return {
      lat: (d.lat as number) ?? 19.42,
      lng: (d.lng as number) ?? -99.15,
    };
  }, [delivery.dropoff_address]);

  const courier = {
    lat: delivery.courier_lat ?? pickup.lat,
    lng: delivery.courier_lng ?? pickup.lng,
  };

  // Mapeo cartesiano simple (no es realista, pero da feedback visual).
  // Tomamos el bounding box pickup/dropoff y normalizamos a 0-100.
  const minLat = Math.min(pickup.lat, dropoff.lat) - 0.005;
  const maxLat = Math.max(pickup.lat, dropoff.lat) + 0.005;
  const minLng = Math.min(pickup.lng, dropoff.lng) - 0.005;
  const maxLng = Math.max(pickup.lng, dropoff.lng) + 0.005;

  const project = (lat: number, lng: number) => ({
    x: ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / Math.max(0.0001, maxLat - minLat)) * 100,
  });

  const pickupXY = project(pickup.lat, pickup.lng);
  const dropoffXY = project(dropoff.lat, dropoff.lng);
  const courierXY = project(courier.lat, courier.lng);

  return (
    <div className="relative h-32 bg-surface rounded-md overflow-hidden border border-line-2/50">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Ruta del courier desde el restaurante hasta el cliente"
      >
        <title>Ruta del courier</title>
        {/* grid */}
        {[20, 40, 60, 80].map((y) => (
          <line
            key={`hh-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            className="text-line-2"
            strokeWidth="0.3"
          />
        ))}
        {[20, 40, 60, 80].map((x) => (
          <line
            key={`vv-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="100"
            stroke="currentColor"
            className="text-line-2"
            strokeWidth="0.3"
          />
        ))}
        {/* línea pickup → dropoff */}
        <line
          x1={pickupXY.x}
          y1={pickupXY.y}
          x2={dropoffXY.x}
          y2={dropoffXY.y}
          stroke="currentColor"
          className="text-brand/40"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
        {/* pickup marker (restaurante) */}
        <circle cx={pickupXY.x} cy={pickupXY.y} r="2.5" fill="currentColor" className="text-ink" />
        <text
          x={pickupXY.x + 3}
          y={pickupXY.y + 1}
          className="fill-current text-ink-400"
          style={{ fontSize: '3px' }}
        >
          Tú
        </text>
        {/* dropoff marker (cliente) */}
        <circle
          cx={dropoffXY.x}
          cy={dropoffXY.y}
          r="2.5"
          fill="currentColor"
          className="text-warn-text"
        />
        <text
          x={dropoffXY.x + 3}
          y={dropoffXY.y + 1}
          className="fill-current text-ink-400"
          style={{ fontSize: '3px' }}
        >
          Cliente
        </text>
        {/* courier marker (animado, pulsa) */}
        <g>
          <circle
            cx={courierXY.x}
            cy={courierXY.y}
            r="5"
            fill="currentColor"
            className="text-brand/20 animate-ping"
            style={{ transformOrigin: `${courierXY.x}px ${courierXY.y}px` }}
          />
          <circle
            cx={courierXY.x}
            cy={courierXY.y}
            r="2.5"
            fill="currentColor"
            className="text-brand"
          />
        </g>
      </svg>
      <div className="absolute bottom-1 left-1 text-[9px] text-ink-400 flex items-center gap-1 bg-surface/80 backdrop-blur px-1.5 py-0.5 rounded">
        <IconMapPin size={8} />
        Mock map · pickup → dropoff
      </div>
    </div>
  );
}
