'use client';

import type { StorefrontTenant } from '@/lib/storefront-actions';
import { useEffect, useState } from 'react';

interface OrderTrackingClientProps {
  tenant: StorefrontTenant;
  orderId: string;
  initialStatus: string;
  initialPaid: boolean;
  customerName: string;
  totalCents: number;
}

interface OrderStateResponse {
  order: {
    status: string;
    payment_method: string | null;
    created_at: string;
  };
  delivery: {
    status: string;
    courier_name: string | null;
    courier_vehicle: string | null;
    courier_lat: number | null;
    courier_lng: number | null;
    pickup_eta: string | null;
    dropoff_eta: string | null;
  } | null;
}

function pesos(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

const STAGES = [
  { key: 'received', label: 'Recibimos tu pedido' },
  { key: 'preparing', label: 'En la cocina' },
  { key: 'ready', label: 'Listo · esperando courier' },
  { key: 'dispatched', label: 'En camino' },
  { key: 'delivered', label: 'Entregado' },
];

const DELIVERY_LABEL: Record<string, string> = {
  pending: 'Esperando courier asignado',
  courier_assigned: 'Tu courier va camino al restaurante',
  pickup_arrived: 'Courier en el restaurante recogiendo tu pedido',
  picked_up: 'En camino a tu dirección',
  dropoff_arrived: 'El courier llegó a tu dirección',
  delivered: 'Pedido entregado',
};

export function OrderTrackingClient({
  tenant,
  orderId,
  initialStatus,
  initialPaid,
  customerName,
  totalCents,
}: OrderTrackingClientProps) {
  const [state, setState] = useState<OrderStateResponse | null>({
    order: {
      status: initialStatus,
      payment_method: initialPaid ? 'mercado_pago' : null,
      created_at: new Date().toISOString(),
    },
    delivery: null,
  });

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (!res.ok) return;
        const json = (await res.json()) as OrderStateResponse;
        if (!cancelled) setState(json);
      } catch {
        // ignore transient error
      }
    };
    poll();
    const id = setInterval(poll, 4_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [orderId]);

  const currentStage = STAGES.findIndex((s) => s.key === state?.order.status);

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="bg-surface border-b border-line">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4">
          <p className="text-[11px] text-ink-400 uppercase tracking-wider">Pedido</p>
          <h1 className="text-lg sm:text-xl font-semibold text-ink">
            {tenant.name} · {customerName}
          </h1>
          <p className="font-mono text-[11px] text-ink-400 mt-0.5 break-all">{orderId}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <section className="bg-surface border border-line rounded-lg p-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">Estado del pedido</h2>
            <span className="font-mono text-sm font-semibold text-ink">{pesos(totalCents)}</span>
          </div>
          <ol className="relative">
            {STAGES.map((stage, idx) => {
              const reached = idx <= currentStage;
              const active = idx === currentStage;
              const done = reached && !active;
              const isLast = idx === STAGES.length - 1;
              return (
                <li key={stage.key} className="flex gap-3 pb-5 last:pb-0">
                  <div className="flex flex-col items-center self-stretch">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors ${
                        reached
                          ? 'bg-brand text-white'
                          : 'bg-canvas border border-line-2 text-ink-400'
                      } ${active ? 'ring-4 ring-brand/20' : ''}`}
                    >
                      {done ? '✓' : idx + 1}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-px flex-1 mt-1 ${idx < currentStage ? 'bg-brand' : 'bg-line-2'}`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-medium ${reached ? 'text-ink' : 'text-ink-400'}`}>
                      {stage.label}
                    </p>
                    {active && <p className="text-[11px] text-ink-400 mt-0.5">En progreso…</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {state?.delivery && (
          <section className="bg-surface border border-line rounded-lg p-card">
            <h2 className="text-sm font-semibold text-ink mb-3">Courier</h2>
            <p className="text-sm text-ink-200">
              {DELIVERY_LABEL[state.delivery.status] ?? state.delivery.status}
            </p>
            {state.delivery.courier_name && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-canvas border border-line-2 flex items-center justify-center text-ink font-medium">
                  {state.delivery.courier_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{state.delivery.courier_name}</p>
                  <p className="text-[11px] text-ink-400 capitalize">
                    {state.delivery.courier_vehicle ?? 'vehículo'}
                  </p>
                </div>
              </div>
            )}
            {state.delivery.dropoff_eta && (
              <p className="mt-3 text-[11px] text-ink-400">
                ETA{' '}
                <span className="font-mono text-ink-200">
                  {new Date(state.delivery.dropoff_eta).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            )}
          </section>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          Esta página se actualiza automáticamente cada 4 segundos.
        </p>
      </main>
    </div>
  );
}
