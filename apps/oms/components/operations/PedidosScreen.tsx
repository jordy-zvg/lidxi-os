'use client';

import {
  type ActiveOrder,
  type OrderStatus,
  advanceOrderStatus,
  chargeOrder,
} from '@/lib/operations/order-actions';
import type { ShiftInfo, ShiftSummary } from '@/lib/operations/shift-actions';
import { endShiftAndSignOut } from '@/lib/operations/shift-actions';
import { Button, EmptyState, StatusPill } from '@kobi/ui';
import { IconCash, IconCreditCard, IconReceipt, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';

interface PedidosScreenProps {
  shift: ShiftInfo;
  orders: ActiveOrder[];
  summary: ShiftSummary | null;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Nueva',
  preparing: 'En preparación',
  ready: 'Lista',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

const STATUS_VARIANT: Record<OrderStatus, 'info' | 'warn' | 'ok' | 'neutral' | 'danger'> = {
  received: 'info',
  preparing: 'warn',
  ready: 'ok',
  delivered: 'neutral',
  cancelled: 'danger',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  received: 'Marcar en preparación',
  preparing: 'Marcar lista',
  ready: 'Marcar entregada',
};

function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export const PedidosScreen = ({ shift, orders, summary }: PedidosScreenProps) => {
  const [chargingOrder, setChargingOrder] = useState<ActiveOrder | null>(null);
  const [closingShift, setClosingShift] = useState(false);

  return (
    <div className="h-full flex flex-col gap-3 sm:gap-4">
      {/* Header con info del turno + cierre */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3">
        <div>
          <h1 className="text-lg font-semibold text-ink">Pedidos en curso</h1>
          <p className="text-xs text-ink-400 mt-0.5">
            Turno de <span className="text-ink-200">{shift.employee_name}</span> · abierto a las{' '}
            <span className="font-mono">{formatTime(shift.started_at)}</span>
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {summary && (
            <div className="text-right">
              <p className="text-[11px] text-ink-400">Vendido en el turno</p>
              <p className="font-mono text-base font-semibold text-ink">
                {formatMoney(summary.total_sold_cents)}{' '}
                <span className="text-xs text-ink-400">({summary.orders_count})</span>
              </p>
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={() => setClosingShift(true)}>
            Cerrar turno
          </Button>
        </div>
      </header>

      {/* Lista de órdenes */}
      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconReceipt size={36} />}
            title="Sin pedidos todavía"
            description="Captura un pedido nuevo desde el POS para verlo aquí."
          />
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onCharge={() => setChargingOrder(order)} />
            ))}
          </div>
        )}
      </div>

      {chargingOrder && (
        <ChargeOrderModal order={chargingOrder} onClose={() => setChargingOrder(null)} />
      )}
      {closingShift && summary && (
        <CloseShiftModal summary={summary} onClose={() => setClosingShift(false)} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tarjeta de orden con acciones de estado/cobro
// ---------------------------------------------------------------------------

function OrderCard({ order, onCharge }: { order: ActiveOrder; onCharge: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdvance = () => {
    setError(null);
    startTransition(async () => {
      const r = await advanceOrderStatus(order.id);
      if (!r.ok) setError(r.error);
    });
  };

  const nextLabel = NEXT_LABEL[order.status];

  return (
    <article className="bg-surface border border-line rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-ink-400">{order.folio}</p>
          <p className="text-sm font-medium text-ink mt-0.5">{order.customer_name}</p>
        </div>
        <StatusPill variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</StatusPill>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-400">
          {order.items_count} ítem{order.items_count === 1 ? '' : 's'} ·{' '}
          {formatTime(order.created_at)}
        </span>
        <span className="font-mono font-semibold text-ink">{formatMoney(order.total_cents)}</span>
      </div>

      {error && <p className="text-xs text-danger-text">{error}</p>}

      <div className="flex flex-col gap-2 pt-2 border-t border-line">
        {nextLabel && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAdvance}
            disabled={pending}
            className="w-full"
          >
            {pending ? 'Actualizando…' : nextLabel}
          </Button>
        )}
        {!order.is_paid && (
          <Button onClick={onCharge} size="sm" disabled={pending} className="w-full">
            <IconCash size={14} className="mr-1.5" />
            Cobrar
          </Button>
        )}
        {order.is_paid && (
          <p className="text-[11px] text-ok-text text-center font-medium">
            Pagada · {order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
          </p>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Modal de cobro: efectivo (con cambio) o tarjeta
// ---------------------------------------------------------------------------

function ChargeOrderModal({ order, onClose }: { order: ActiveOrder; onClose: () => void }) {
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [cashStr, setCashStr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cashPesos = Number.parseFloat(cashStr);
  const cashCents = Number.isFinite(cashPesos) ? Math.round(cashPesos * 100) : 0;
  const changeCents = cashCents - order.total_cents;
  const canSubmitCash = method === 'cash' && cashCents >= order.total_cents;
  const canSubmit = method === 'card' || canSubmitCash;

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const r = await chargeOrder({
        orderId: order.id,
        method,
        cashReceivedCents: method === 'cash' ? cashCents : undefined,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      onClose();
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        role="presentation"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label={`Cobrar ${order.folio}`}
        className="fixed inset-0 z-50 m-auto w-[440px] h-fit p-0 rounded-xl bg-surface border border-line shadow-lg flex flex-col"
      >
        <header className="border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">Cobrar {order.folio}</span>
        </header>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400">Total a cobrar</span>
            <span className="font-mono text-2xl font-semibold text-ink">
              {formatMoney(order.total_cents)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`h-12 rounded-lg border-2 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                method === 'cash'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-line-2 text-ink-200 hover:bg-surface-2'
              }`}
            >
              <IconCash size={16} />
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`h-12 rounded-lg border-2 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                method === 'card'
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-line-2 text-ink-200 hover:bg-surface-2'
              }`}
            >
              <IconCreditCard size={16} />
              Tarjeta
            </button>
          </div>

          {method === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1" htmlFor="cash-paid">
                  Paga con
                </label>
                <div className="flex items-center border border-line-2 rounded-md bg-canvas overflow-hidden focus-within:border-brand">
                  <span className="px-3 font-mono text-sm text-ink-400 border-r border-line-2 h-10 flex items-center">
                    $
                  </span>
                  <input
                    id="cash-paid"
                    type="number"
                    inputMode="decimal"
                    value={cashStr}
                    min="0"
                    step="0.50"
                    onChange={(e) => setCashStr(e.target.value)}
                    placeholder={(order.total_cents / 100).toFixed(2)}
                    className="flex-1 h-10 px-3 font-mono text-base text-ink bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-canvas rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-ink-400">Cambio</span>
                <span
                  className={`font-mono text-xl font-semibold ${changeCents >= 0 ? 'text-ok-text' : 'text-danger-text'}`}
                >
                  {changeCents >= 0 ? formatMoney(changeCents) : `−${formatMoney(-changeCents)}`}
                </span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <p className="text-xs text-ink-400 bg-canvas rounded-lg p-3">
              Procesa el cobro en tu terminal externa y confirma. Por ahora Kobi solo registra el
              método y monto — la integración con terminal llegará en sprints futuros.
            </p>
          )}

          {error && <p className="text-xs text-danger-text">{error}</p>}
        </div>

        <footer className="border-t border-line px-5 py-3 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !canSubmit}>
            {pending ? 'Cobrando…' : 'Confirmar cobro'}
          </Button>
        </footer>
      </dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Modal de cierre de turno con corte de caja
// ---------------------------------------------------------------------------

function CloseShiftModal({
  summary,
  onClose,
}: {
  summary: ShiftSummary;
  onClose: () => void;
}) {
  const [cashCountedStr, setCashCountedStr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cashCountedPesos = Number.parseFloat(cashCountedStr);
  const cashCountedCents = Number.isFinite(cashCountedPesos)
    ? Math.round(cashCountedPesos * 100)
    : null;
  const difference = cashCountedCents !== null ? cashCountedCents - summary.cash_total_cents : null;

  const handleClose = () => {
    setError(null);
    startTransition(async () => {
      try {
        await endShiftAndSignOut(cashCountedCents);
      } catch (e) {
        // endShiftAndSignOut hace redirect en success — un throw aquí es bug real.
        setError(e instanceof Error ? e.message : 'Error cerrando turno');
      }
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/70"
        role="presentation"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <dialog
        open
        aria-label="Cerrar turno"
        className="fixed inset-0 z-50 m-auto w-[480px] h-fit p-0 rounded-xl bg-surface border border-line shadow-lg flex flex-col"
      >
        <header className="border-b border-line px-5 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
          <span className="font-medium text-sm text-ink">Corte de caja del turno</span>
        </header>

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-2">
            <Row label="Órdenes cobradas" value={String(summary.orders_count)} />
            <Row label="Cobrado en efectivo" value={formatMoney(summary.cash_total_cents)} />
            <Row label="Cobrado con tarjeta" value={formatMoney(summary.card_total_cents)} />
            <div className="pt-2 border-t border-line">
              <Row label="Total vendido" value={formatMoney(summary.total_sold_cents)} highlight />
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-line">
            <label className="block text-xs font-medium text-ink-300" htmlFor="cash-counted">
              Efectivo contado en caja (opcional)
            </label>
            <div className="flex items-center border border-line-2 rounded-md bg-canvas overflow-hidden focus-within:border-brand">
              <span className="px-3 font-mono text-sm text-ink-400 border-r border-line-2 h-10 flex items-center">
                $
              </span>
              <input
                id="cash-counted"
                type="number"
                inputMode="decimal"
                value={cashCountedStr}
                min="0"
                step="0.50"
                onChange={(e) => setCashCountedStr(e.target.value)}
                placeholder={(summary.cash_total_cents / 100).toFixed(2)}
                className="flex-1 h-10 px-3 font-mono text-base text-ink bg-transparent focus:outline-none"
              />
            </div>
            {difference !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400">Diferencia vs esperado</span>
                <span
                  className={`font-mono font-semibold ${
                    difference === 0
                      ? 'text-ok-text'
                      : difference > 0
                        ? 'text-ink-200'
                        : 'text-danger-text'
                  }`}
                >
                  {difference >= 0 ? formatMoney(difference) : `−${formatMoney(-difference)}`}
                </span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-danger-text">{error}</p>}
        </div>

        <footer className="border-t border-line px-5 py-3 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleClose} disabled={pending}>
            {pending ? 'Cerrando…' : 'Cerrar turno y salir'}
          </Button>
        </footer>
      </dialog>
    </>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-400">{label}</span>
      <span
        className={`font-mono ${highlight ? 'text-base font-semibold text-ink' : 'text-ink-200'}`}
      >
        {value}
      </span>
    </div>
  );
}
