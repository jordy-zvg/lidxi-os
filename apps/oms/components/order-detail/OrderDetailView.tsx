'use client';

import { cents, formatMXN } from '@kobi/shared';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { MOCK_ORDERS } from '../orders/mock-orders';
import { TrackingPanel } from './TrackingPanel';

interface OrderDetailViewProps {
  orderId: string;
}

export const OrderDetailView = ({ orderId }: OrderDetailViewProps) => {
  // En producción, cargar desde BD. Por ahora usamos mocks.
  const order = MOCK_ORDERS.find((o) => o.id === orderId) ?? MOCK_ORDERS[0];

  const isUberDirect = order?.channel === 'direct';

  const { tracking, status: connectionStatus } = useOrderTracking(isUberDirect ? orderId : null);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-ink-400">Pedido {orderId} no encontrado</p>
        <Link href="/pedidos" className="text-sm text-brand hover:underline">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const iva = Math.round((subtotal * 0.16) / 1.16);
  const net = subtotal - iva;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <Link
        href="/pedidos"
        className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-ink mb-6 w-fit"
      >
        <IconArrowLeft size={16} /> Pedidos
      </Link>

      <div className="flex gap-6 items-start">
        {/* Columna izquierda — Detalle */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-ink">#{order.id}</h1>
              <p className="text-sm text-ink-300 mt-1">
                {order.customer} · {order.channel.toUpperCase()}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                order.status === 'delivered'
                  ? 'bg-ok-soft text-ok-text'
                  : order.status === 'cancelled'
                    ? 'bg-danger-soft text-danger-text'
                    : order.status === 'ready'
                      ? 'bg-ok-soft text-ok-text'
                      : 'bg-brand-soft text-brand-text'
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Items */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-base font-semibold text-ink mb-4">Comanda</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-400 border-b border-line">
                  <th className="text-left pb-2 font-medium">Producto</th>
                  <th className="text-right pb-2 font-medium font-mono">Qty</th>
                  <th className="text-right pb-2 font-medium font-mono">Precio</th>
                  <th className="text-right pb-2 font-medium font-mono">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 text-ink">{item.name}</td>
                    <td className="py-2.5 text-right font-mono text-ink-300">{item.qty}</td>
                    <td className="py-2.5 text-right font-mono text-ink-300">
                      {formatMXN(cents(item.unitPrice))}
                    </td>
                    <td className="py-2.5 text-right font-mono text-ink">
                      {formatMXN(cents(item.unitPrice * item.qty))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-line space-y-1.5">
              <div className="flex justify-between text-sm text-ink-300">
                <span>Subtotal (sin IVA)</span>
                <span className="font-mono">{formatMXN(cents(net))}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-300">
                <span>IVA 16%</span>
                <span className="font-mono">{formatMXN(cents(iva))}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink">
                <span>Total</span>
                <span className="font-mono text-xl">{formatMXN(cents(subtotal))}</span>
              </div>
            </div>
          </div>

          {/* Cliente y entrega */}
          {order.channel === 'direct' && order.address && (
            <div className="bg-surface border border-line rounded-xl p-5">
              <h2 className="text-base font-semibold text-ink mb-3">Cliente y entrega</h2>
              <div className="space-y-2 text-sm">
                <p className="text-ink font-medium">{order.customer}</p>
                {order.phone && <p className="text-ink-300">{order.phone}</p>}
                <p className="text-ink-300">{order.address}</p>
                {order.distance && (
                  <p className="text-ink-400 text-xs">
                    {order.distance} · estimado {order.deliveryEta} min
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha — Tracking (solo Uber Direct) */}
        {isUberDirect && (
          <TrackingPanel
            tracking={tracking}
            connectionStatus={connectionStatus}
            clientLat={null}
            clientLng={null}
          />
        )}
      </div>
    </div>
  );
};
