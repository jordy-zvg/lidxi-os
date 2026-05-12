'use client';

import { Button, ChannelBadge, StatusPill } from '@lidxi/ui';
import { IconBuildingStore, IconMapPin, IconPhone, IconX } from '@tabler/icons-react';

const CHANNEL_NAMES: Record<string, string> = {
  eats: 'Uber Eats',
  rappi: 'Rappi',
  didi: 'Didi Food',
};
import { useEffect } from 'react';
import type { MockOrder } from './orders/mock-orders';

const STATUS_PILL: Record<
  string,
  { variant: 'ok' | 'warn' | 'danger' | 'info' | 'neutral'; label: string }
> = {
  received: { variant: 'info', label: 'Recibido' },
  preparing: { variant: 'warn', label: 'En preparación' },
  ready: { variant: 'ok', label: 'Listo' },
  dispatched: { variant: 'info', label: 'En camino' },
  delivered: { variant: 'neutral', label: 'Entregado' },
  cancelled: { variant: 'danger', label: 'Cancelado' },
};

const formatHour = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const formatCurrency = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section = ({ title, children }: SectionProps) => (
  <section className="border-t border-line px-5 py-4">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">{title}</h3>
    {children}
  </section>
);

interface OrderDetailSlideOverProps {
  order: MockOrder | null;
  onClose: () => void;
}

export const OrderDetailSlideOver = ({ order, onClose }: OrderDetailSlideOverProps) => {
  useEffect(() => {
    if (!order) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [order, onClose]);

  if (!order) return null;

  const pill = STATUS_PILL[order.status] ?? { variant: 'neutral' as const, label: order.status };
  const subtotal = order.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const total = subtotal - (order.platformFee ?? 0);

  const showUberDirect =
    order.channel === 'direct' && (order.status === 'ready' || order.status === 'dispatched');

  const timelineSteps = [
    { key: 'received', label: 'Recibido' },
    { key: 'preparing', label: 'Preparando' },
    { key: 'ready', label: 'Listo' },
    { key: 'dispatched', label: 'Despachado' },
    { key: 'delivered', label: 'Entregado' },
  ];

  const statusOrder = ['received', 'preparing', 'ready', 'dispatched', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="presentation"
      />

      <dialog
        open
        aria-label={`Detalle pedido ${order.id}`}
        className="fixed right-0 top-0 bottom-0 z-50 w-[480px] m-0 p-0 bg-surface border-l border-line shadow-lg flex flex-col overflow-hidden"
      >
        {/* Header sticky */}
        <header className="border-b border-line px-5 py-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2 transition-colors shrink-0"
            >
              <IconX size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-medium text-ink text-sm">#{order.id}</span>
                <StatusPill variant={pill.variant} pulse={order.status === 'preparing'}>
                  {pill.label}
                </StatusPill>
                <span className="font-mono text-xs text-ink-400">
                  {formatHour(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ChannelBadge channel={order.channel} short />
                <span className="text-sm text-ink-200">{order.customer}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Comanda */}
          <Section title="Comanda">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-400">
                  <th className="text-left font-medium pb-2 w-10">Qty</th>
                  <th className="text-left font-medium pb-2">Producto</th>
                  <th className="text-right font-mono font-medium pb-2">Unit.</th>
                  <th className="text-right font-mono font-medium pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-ink-300 py-2">{item.qty}×</td>
                    <td className="py-2">
                      <span className="text-ink">{item.name}</span>
                      {item.mods.length > 0 && (
                        <span className="block text-xs text-ink-400">{item.mods.join(', ')}</span>
                      )}
                    </td>
                    <td className="font-mono text-ink-300 text-right py-2">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="font-mono text-ink text-right py-2">
                      {formatCurrency(item.unitPrice * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 space-y-1.5 pt-3 border-t border-line">
              <div className="flex justify-between text-sm text-ink-200">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {order.platformFee !== null && (
                <div className="flex justify-between text-sm text-danger-text">
                  <span>Comisión plataforma</span>
                  <span className="font-mono">−{formatCurrency(order.platformFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-ink">
                <span>Total</span>
                <span className="font-mono text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
          </Section>

          {/* Cliente y entrega */}
          <Section title="Cliente y entrega">
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2 text-ink-200">
                <span className="font-medium text-ink">{order.customer}</span>
                {order.phone && (
                  <>
                    <span className="text-ink-400">·</span>
                    <IconPhone size={14} className="text-ink-400 shrink-0" />
                    <span className="font-mono">{order.phone}</span>
                  </>
                )}
              </div>
            </div>

            {order.channel === 'direct' && order.address ? (
              <>
                <div className="flex items-start gap-2 text-sm text-ink-200">
                  <IconMapPin size={14} className="text-ink-400 shrink-0 mt-0.5" />
                  <div>
                    <span>{order.address}</span>
                    <span className="block text-xs text-ink-400">
                      {order.distance} · estimado {order.deliveryEta} min
                    </span>
                  </div>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded border border-line-2 text-sm text-ink-200 hover:bg-surface-2 transition-colors"
                >
                  Ver en mapa
                </a>
              </>
            ) : order.channel === 'mostrador' ? (
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <IconBuildingStore size={16} className="shrink-0" />
                <span>Entrega en mostrador</span>
              </div>
            ) : (
              <div className="rounded-lg bg-canvas p-3 text-sm text-ink-300">
                <p className="font-medium text-ink-200 mb-1">
                  Entrega gestionada por {CHANNEL_NAMES[order.channel] ?? order.channel}
                </p>
                <p className="text-xs text-ink-400">
                  El courier de la plataforma recoge aquí y entrega al cliente.
                </p>
              </div>
            )}
          </Section>

          {/* Uber Direct */}
          {showUberDirect && order.courier && (
            <Section title="Uber Direct">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{order.courier.name}</p>
                    <p className="text-xs text-ink-400">en camino · ETA {order.courier.eta} min</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-400">
                    <span>Progreso</span>
                    <span className="font-mono">{order.courier.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${order.courier.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Ver tracking
                  </Button>
                  <Button variant="ghost" size="sm">
                    Contactar courier
                  </Button>
                </div>
              </div>
            </Section>
          )}

          {/* Timeline */}
          <Section title="Timeline">
            <ol className="relative space-y-0">
              {timelineSteps.map((step, idx) => {
                const stepIdx = statusOrder.indexOf(step.key);
                const isDone = stepIdx < currentIdx;
                const isCurrent = stepIdx === currentIdx;

                const matchedTimeline = order.timeline.find(
                  (t) => t.label === step.label || t.status === step.key,
                );
                const timestamp = matchedTimeline?.timestamp;

                return (
                  <li key={step.key} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={
                          isDone
                            ? 'h-3 w-3 rounded-full bg-ok shrink-0 mt-0.5'
                            : isCurrent
                              ? 'h-3 w-3 rounded-full bg-brand animate-pulse shrink-0 mt-0.5'
                              : 'h-3 w-3 rounded-full border border-line-2 shrink-0 mt-0.5'
                        }
                      />
                      {idx < timelineSteps.length - 1 && (
                        <div className="w-px flex-1 bg-line mt-1" />
                      )}
                    </div>
                    <div className="pb-1">
                      <span
                        className={
                          isDone
                            ? 'text-sm text-ink-200'
                            : isCurrent
                              ? 'text-sm font-medium text-ink'
                              : 'text-sm text-ink-400'
                        }
                      >
                        {step.label}
                      </span>
                      {timestamp && (
                        <span className="ml-2 font-mono text-xs text-ink-400">{timestamp}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>
        </div>

        {/* Footer sticky */}
        <footer className="shrink-0 border-t border-line px-5 py-4">
          {order.status === 'received' && <Button className="w-full">Aceptar pedido</Button>}
          {order.status === 'preparing' && <Button className="w-full">Marcar listo</Button>}
          {order.status === 'ready' && order.channel === 'direct' && (
            <div className="flex gap-2">
              <Button className="flex-1">Despachar con Uber Direct</Button>
              <Button variant="secondary">Ver alternativas</Button>
            </div>
          )}
          {order.status === 'ready' && order.channel !== 'direct' && (
            <p className="text-sm text-ink-400 text-center">
              Courier en camino · ETA {order.deliveryEta} min
            </p>
          )}
          {order.status === 'dispatched' && (
            <p className="text-sm text-ink-400 text-center">
              En camino · {order.courier?.name ?? 'Courier'}
            </p>
          )}
          {order.status === 'delivered' && (
            <p className="text-sm text-ink-400 text-center">Pedido entregado</p>
          )}
        </footer>
      </dialog>
    </>
  );
};
