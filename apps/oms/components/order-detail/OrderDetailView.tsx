'use client';

import { useOperationSession } from '@/components/OperationSessionProvider';
import {
  KitchenTicketPrint,
  printComanda,
  printCss,
} from '@/components/comanda/KitchenTicketPrint';
import type { OrderDetail } from '@/lib/operations/order-actions';
import { useTenant } from '@/lib/tenant';
import type { ReceiptOrder } from '@kobi/printing';
import { type ChannelKey, cents, formatMXN, formatTimeMX, isMarketplace } from '@kobi/shared';
import { Button, ChannelBadge, StatusPill } from '@kobi/ui';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Detalle de un pedido, con datos reales de la base (Sprint 20, H20.4).
 *
 * Antes renderizaba `MOCK_ORDERS.find(...) ?? MOCK_ORDERS[0]`, así que
 * CUALQUIER id abría el pedido de otra persona — nombre, dirección y teléfono
 * de un cliente inventado, presentados como si fueran del pedido buscado.
 *
 * Aquí vive el botón de reimprimir, que es la razón de que la pantalla entre
 * al día 1: el papel se atora, alguien tira la comanda, llega el repartidor y
 * nadie encuentra el pedido. Reimprimir NO toca la base ni cambia el estado:
 * monta la MISMA comanda del Sprint 19 y llama a imprimir.
 */

const STATUS_LABEL: Record<string, string> = {
  received: 'Nueva',
  preparing: 'En preparación',
  ready: 'Lista',
  dispatched: 'En camino',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const STATUS_VARIANT: Record<string, 'info' | 'warn' | 'ok' | 'neutral' | 'danger'> = {
  received: 'info',
  preparing: 'warn',
  ready: 'ok',
  dispatched: 'neutral',
  delivered: 'neutral',
  cancelled: 'danger',
};

export const OrderDetailView = ({ order }: { order: OrderDetail }) => {
  const tenant = useTenant();
  const session = useOperationSession();
  const [printOrder, setPrintOrder] = useState<ReceiptOrder | null>(null);
  const [printFailed, setPrintFailed] = useState(false);

  const esDePlataforma = isMarketplace(order.channel as ChannelKey);

  /** Misma comanda que imprime la captura: se reusa el componente, no el formato. */
  const construirComanda = (): ReceiptOrder => ({
    id: order.id,
    channel: order.channel as ChannelKey,
    externalId: order.external_id,
    createdAt: order.created_at,
    customer: { name: order.customer_name },
    // Las filas van tal como se guardaron: la captura ya explotó las líneas
    // con nota o modificadores en una fila por unidad. Reagrupar perdería
    // notas, que es justo lo que cocina necesita ver.
    items: order.items.map((it) => ({
      qty: it.qty,
      name: it.name,
      notes: it.notes ?? undefined,
      modifiers: it.modifiers,
    })),
    subtotal: cents(order.subtotal_cents),
    tax: cents(order.tax_cents),
    total: cents(order.total_cents),
  });

  const reimprimir = () => {
    setPrintFailed(false);
    const receipt = construirComanda();
    try {
      // flushSync monta la comanda en el DOM ANTES de imprimir; sin esto
      // print() dispararía contra el árbol anterior.
      flushSync(() => setPrintOrder(receipt));
    } catch {
      setPrintFailed(true);
      return;
    }
    if (!printComanda()) setPrintFailed(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSS estático propio, sin entrada de usuario. */}
      <style dangerouslySetInnerHTML={{ __html: printCss() }} />

      <div className="kobi-comanda-no-print flex flex-col gap-4">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-1.5 text-ink-400 text-sm hover:text-ink"
        >
          <IconArrowLeft size={16} /> Pedidos
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-semibold text-ink text-xl">{order.folio}</h1>
              <ChannelBadge channel={order.channel as ChannelKey} short />
            </div>
            <p className="mt-1 text-ink-300 text-sm">
              {order.customer_name} · {formatTimeMX(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill variant={STATUS_VARIANT[order.status] ?? 'neutral'}>
              {STATUS_LABEL[order.status] ?? order.status}
            </StatusPill>
            <Button variant="secondary" size="sm" onClick={reimprimir}>
              <IconPrinter size={14} className="mr-1.5" />
              Reimprimir comanda
            </Button>
          </div>
        </header>

        {printFailed && (
          <output className="rounded-md border border-line-2 bg-surface-2 px-3 py-2 text-ink text-sm">
            No se pudo abrir el diálogo de impresión. El pedido no cambió.
          </output>
        )}

        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="mb-3 font-medium text-ink text-sm">Comanda</h2>
          <ul className="flex flex-col gap-2">
            {order.items.map((it, idx) => {
              // El índice ES la identidad: dos filas pueden ser idénticas en
              // todos sus campos (explote por unidad) y una clave derivada del
              // contenido las colapsaría, perdiendo ítems. La lista es estática.
              const itemKey = `${idx}`;
              return (
                <li key={itemKey} className="border-line border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-ink text-sm">
                      {it.qty}× {it.name}
                    </span>
                    <span className="font-mono text-ink-400 text-xs">
                      {formatMXN(cents(it.unit_price_cents))}
                    </span>
                  </div>
                  {it.modifiers.map((m, mIdx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: dos modificadores repetidos deben mostrarse los dos.
                    <p key={`${idx}-${mIdx}`} className="ml-3 text-ink-300 text-xs">
                      + {m}
                    </p>
                  ))}
                  {it.notes && (
                    <p className="ml-3 font-medium text-ink text-xs">NOTA: {it.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between border-line border-t pt-3">
            <span className="font-medium text-ink text-sm">Total</span>
            <span className="font-mono font-semibold text-ink">
              {formatMXN(cents(order.total_cents))}
            </span>
          </div>
          <p className="mt-1 text-ink-400 text-xs">
            {esDePlataforma
              ? 'Cobrado por la plataforma'
              : order.is_paid
                ? `Pagado · ${order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}`
                : 'Pendiente de cobro'}
          </p>
        </section>

        {/* En marketplace no hay dirección ni teléfono: el repartidor de la
            plataforma entrega, y Kobi nunca recibe esos datos. Se omite el
            bloque entero en vez de mostrar campos vacíos, que harían dudar al
            operador de si falta un dato o no aplica. */}
        {!esDePlataforma && (order.customer_address || order.customer_phone) && (
          <section className="rounded-lg border border-line bg-surface p-4">
            <h2 className="mb-2 font-medium text-ink text-sm">Cliente</h2>
            <p className="text-ink text-sm">{order.customer_name}</p>
            {order.customer_phone && <p className="text-ink-300 text-sm">{order.customer_phone}</p>}
            {order.customer_address && (
              <p className="text-ink-300 text-sm">{order.customer_address}</p>
            )}
          </section>
        )}

        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="mb-2 font-medium text-ink text-sm">Tiempos</h2>
          <dl className="flex flex-col gap-1 text-sm">
            <Tiempo label="Capturado" iso={order.created_at} />
            <Tiempo label="Listo" iso={order.ready_at} />
            <Tiempo
              label={esDePlataforma ? 'Recogido por el repartidor' : 'Despachado'}
              iso={order.dispatched_at}
            />
            {/* En marketplace la entrega final la sabe la plataforma, no Kobi:
                mostrar la fila vacía sugeriría que Kobi debería saberlo. */}
            {!esDePlataforma && <Tiempo label="Entregado" iso={order.delivered_at} />}
          </dl>
        </section>
      </div>

      {/* Montada solo para el papel; fuera de la vista pero medible. */}
      {printOrder ? (
        <div className="kobi-comanda-solo-impresion">
          <KitchenTicketPrint
            order={printOrder}
            tenantName={tenant.displayName}
            branchName={session?.branchName}
          />
        </div>
      ) : null}
    </div>
  );
};

const Tiempo = ({ label, iso }: { label: string; iso: string | null }) => (
  <div className="flex items-center justify-between">
    <dt className="text-ink-300">{label}</dt>
    <dd className={iso ? 'font-mono text-ink' : 'text-ink-400'}>{iso ? formatTimeMX(iso) : '—'}</dd>
  </div>
);
