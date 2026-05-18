'use client';

import { OrderDetailSlideOver } from '@/components/OrderDetailSlideOver';
import { MOCK_ORDERS, type MockOrder, STATUS_COLUMN } from '@/components/orders/mock-orders';
import type { OrderStatus } from '@kobi/shared';
import { Button, ChannelBadge, StatusPill } from '@kobi/ui';
import { useState } from 'react';

const COLUMN_LABEL: Record<OrderStatus, string> = {
  received: 'Recibido',
  preparing: 'En preparación',
  ready: 'Listo',
  dispatched: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_PILL: Record<
  OrderStatus,
  { variant: 'ok' | 'warn' | 'danger' | 'info' | 'neutral'; pulse?: boolean }
> = {
  received: { variant: 'info' },
  preparing: { variant: 'warn', pulse: true },
  ready: { variant: 'ok' },
  dispatched: { variant: 'info' },
  delivered: { variant: 'neutral' },
  cancelled: { variant: 'danger' },
};

const formatHour = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

interface KanbanCardProps {
  order: MockOrder;
  onView: () => void;
}

const KanbanCard = ({ order, onView }: KanbanCardProps) => {
  const pill = STATUS_PILL[order.status];
  const subtotal = order.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  return (
    <article className="bg-surface border border-line rounded-lg p-3 space-y-2.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <ChannelBadge channel={order.channel} short />
        <span className="font-mono text-xs text-ink-300">{formatHour(order.createdAt)}</span>
      </div>

      <div>
        <span className="font-mono text-sm font-semibold text-ink">#{order.id}</span>
        <p className="text-sm text-ink-200 mt-0.5">{order.customer}</p>
      </div>

      <ul className="text-xs text-ink-300 space-y-0.5">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.qty}× {item.name}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
        <StatusPill variant={pill.variant} pulse={pill.pulse}>
          {COLUMN_LABEL[order.status]}
        </StatusPill>
        <span className="font-mono text-xs text-ink-200">${subtotal.toLocaleString('es-MX')}</span>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={onView}>
        Ver detalle
      </Button>
    </article>
  );
};

export default function PedidosPage() {
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Pedidos en vivo</h1>
        <span className="text-sm text-ink-400">{MOCK_ORDERS.length} pedidos activos</span>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {STATUS_COLUMN.map((status) => {
          const orders = MOCK_ORDERS.filter((o) => o.status === status);
          return (
            <div key={status} className="flex flex-col gap-3 min-h-0">
              <div className="flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-ink-200">{COLUMN_LABEL[status]}</h2>
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-surface-2 text-xs font-mono text-ink-300">
                  {orders.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pb-2">
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line py-8 flex items-center justify-center text-xs text-ink-400">
                    Sin pedidos
                  </div>
                ) : (
                  orders.map((order) => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      onView={() => setSelectedOrder(order)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailSlideOver order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
