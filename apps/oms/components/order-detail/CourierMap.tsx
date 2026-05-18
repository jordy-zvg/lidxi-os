'use client';

import { IconMapOff } from '@tabler/icons-react';
import type { TrackingSnapshot } from '../../lib/tracker';

interface CourierMapProps {
  tracking: TrackingSnapshot;
  restaurantLat: number;
  restaurantLng: number;
  clientLat: number | null;
  clientLng: number | null;
}

/**
 * Mapa de Mapbox GL con 3 marcadores: cocina, cliente, courier.
 *
 * Cuando NEXT_PUBLIC_MAPBOX_TOKEN no está configurado, renderiza un
 * fallback informativo. La integración real de Mapbox GL requiere
 * agregar mapbox-gl como dependencia npm y configurar el token.
 *
 * TODO: reemplazar el bloque MapboxFallback por MapboxMap cuando
 * el token esté disponible en .env.local.
 */
export const CourierMap = ({
  tracking,
  restaurantLat,
  restaurantLng,
  clientLat,
  clientLng,
}: CourierMapProps) => {
  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!hasToken) {
    return (
      <div className="h-[360px] rounded-xl bg-surface-2 border border-line flex flex-col items-center justify-center gap-3">
        <IconMapOff size={36} className="text-ink-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-ink">Mapa no disponible</p>
          <p className="text-xs text-ink-400 mt-1">
            Configura{' '}
            <code className="font-mono bg-surface px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> en{' '}
            .env.local
          </p>
        </div>
        {/* Coordenadas de debug en dev */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 text-xs text-ink-500 font-mono text-center space-y-0.5">
            <p>
              🏪 Cocina: {restaurantLat.toFixed(4)}, {restaurantLng.toFixed(4)}
            </p>
            {clientLat && clientLng && (
              <p>
                📍 Cliente: {clientLat.toFixed(4)}, {clientLng.toFixed(4)}
              </p>
            )}
            {tracking.courierLat && tracking.courierLng && (
              <p>
                🚴 Courier: {tracking.courierLat.toFixed(4)}, {tracking.courierLng.toFixed(4)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Con token: aquí iría la integración de Mapbox GL
  // import mapboxgl from 'mapbox-gl'; + useEffect con mapa
  return (
    <div
      id="courier-map"
      className="h-[360px] rounded-xl border border-line overflow-hidden bg-surface-2"
    >
      {/* mapboxgl map se monta aquí via useEffect */}
    </div>
  );
};
