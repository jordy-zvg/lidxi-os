'use client';

import { useTenant } from '@/lib/tenant';
import type { MockOrder } from './orders/mock-orders';

/**
 * Vista web del ticket de venta — optimizada para window.print().
 * Se usa en el modal de impresión del OrderDetailSlideOver.
 *
 * NO es el template térmico de @kobi/printing (ese es para ESC/POS).
 * Este componente genera HTML estándar que el navegador puede imprimir.
 */
interface WebReceiptProps {
  order: MockOrder;
}

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(n / 100);

export const WebReceipt = ({ order }: WebReceiptProps) => {
  const tenant = useTenant();
  const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const iva = Math.round((subtotal * 0.16) / 1.16);
  const net = subtotal - iva;

  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 12,
        width: 280,
        padding: '16px 12px',
        lineHeight: 1.5,
        color: '#000',
        background: '#fff',
      }}
    >
      {/* Header del cliente */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{tenant.displayName.toUpperCase()}</div>
        {tenant.address && <div style={{ fontSize: 11 }}>{tenant.address}</div>}
        {tenant.phone && <div style={{ fontSize: 11 }}>Tel: {tenant.phone}</div>}
        {tenant.rfc && <div style={{ fontSize: 11 }}>RFC: {tenant.rfc}</div>}
      </div>
      <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Datos del pedido */}
      <div style={{ fontSize: 11, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Orden:</span>
          <span>{order.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Canal:</span>
          <span>{order.channel.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cliente:</span>
          <span>{order.customer}</span>
        </div>
      </div>
      <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Items */}
      {order.items.map((item) => (
        <div
          key={item.id}
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}
        >
          <span>
            {item.qty}× {item.name}
          </span>
          <span>{formatMXN(item.unitPrice * item.qty)}</span>
        </div>
      ))}
      <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* Totales */}
      <div style={{ fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal (sin IVA)</span>
          <span>{formatMXN(net)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IVA 16%</span>
          <span>{formatMXN(iva)}</span>
        </div>
        {order.platformFee !== null && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Comisión plataforma</span>
            <span>−{formatMXN(order.platformFee)}</span>
          </div>
        )}
      </div>
      <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        <span>TOTAL</span>
        <span>{formatMXN(subtotal)}</span>
      </div>

      {/* Footer Kobi */}
      <hr style={{ borderTop: '1px dashed #000', margin: '8px 0 6px' }} />
      <div style={{ textAlign: 'center', fontSize: 10, color: '#666' }}>
        <div>Gracias por su compra</div>
        <div>Powered by Kobi · kobi.mx</div>
      </div>
    </div>
  );
};
