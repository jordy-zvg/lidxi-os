import { ORDER_TYPES, ORDER_TYPE_KEYS, cents, formatMXN } from '@kobi/shared';
import { Button, EmptyState } from '@kobi/ui';
import { IconReceipt } from '@tabler/icons-react';
import { AddressAutocomplete, type AddressValue } from './AddressAutocomplete';
import { TicketLine } from './TicketLine';
import type { OrderType, PaymentMethod, TicketLine as TicketLineType } from './types';

const IVA_RATE = 0.16;

function calcTotals(lines: TicketLineType[]) {
  const total = cents(lines.reduce((s, l) => s + l.unitPriceCents * l.qty, 0));
  const tax = cents(Math.round((total * IVA_RATE) / (1 + IVA_RATE)));
  const net = cents(total - tax);
  return { total, tax, net };
}

interface TicketProps {
  lines: TicketLineType[];
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  orderType: OrderType;
  onOrderTypeChange: (t: OrderType) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  customerAddress: string;
  onAddressChange: (v: AddressValue) => void;
  onIncrement: (lineId: string) => void;
  onDecrement: (lineId: string) => void;
  onSetNote: (lineId: string, note: string, scope: 'all' | 'one') => void;
  onCobrarEfectivo: () => void;
  onCobrarTarjeta: () => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
}

export const Ticket = ({
  lines,
  customerName,
  onCustomerNameChange,
  orderType,
  onOrderTypeChange,
  customerPhone,
  onCustomerPhoneChange,
  customerAddress,
  onAddressChange,
  onIncrement,
  onDecrement,
  onSetNote,
  onCobrarEfectivo,
  onCobrarTarjeta,
  paymentMethod,
  onPaymentMethodChange,
}: TicketProps) => {
  const { total, tax, net } = calcTotals(lines);
  const empty = lines.length === 0;

  // 'envio' exige teléfono + dirección antes de poder cobrar.
  const needsDelivery = orderType === 'envio';
  const deliveryReady =
    !needsDelivery || (customerPhone.trim().length > 0 && customerAddress.trim().length > 0);
  const canCharge = !empty && deliveryReady;

  return (
    <div className="flex flex-col h-full bg-surface border border-line rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line shrink-0 space-y-3">
        {/* Tipo de pedido */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
            Tipo de pedido
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {ORDER_TYPE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onOrderTypeChange(key)}
                className={`h-8 rounded-md text-xs font-medium border transition-colors ${
                  orderType === key
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-ink-200 border-line-2 hover:bg-surface-2'
                }`}
              >
                {ORDER_TYPES[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Cliente */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
            Cliente
          </p>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Mostrador"
            className="w-full h-8 text-sm text-ink bg-canvas border border-line-2 rounded px-2 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Datos de envío (solo 'envio') */}
        {needsDelivery && (
          <div className="space-y-2">
            <div>
              <label
                htmlFor="customer-phone"
                className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1"
              >
                Teléfono <span className="text-danger-text">*</span>
              </label>
              <input
                id="customer-phone"
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                placeholder="55 1234 5678"
                className="w-full h-8 text-sm text-ink bg-canvas border border-line-2 rounded px-2 focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
                Dirección de entrega <span className="text-danger-text">*</span>
              </p>
              <AddressAutocomplete value={customerAddress} onChange={onAddressChange} />
            </div>
          </div>
        )}
      </div>

      {/* Líneas del ticket */}
      <div className="flex-1 overflow-y-auto px-4">
        {empty ? (
          <EmptyState
            icon={<IconReceipt size={36} />}
            title="Agrega platillos al ticket"
            description="Selecciona platillos del menú para empezar a cobrar."
          />
        ) : (
          <div className="py-2">
            {lines.map((line) => (
              <TicketLine
                key={line.id}
                line={line}
                onIncrement={() => onIncrement(line.id)}
                onDecrement={() => onDecrement(line.id)}
                onSetNote={(note, scope) => onSetNote(line.id, note, scope)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="border-t border-line px-4 py-3 shrink-0 space-y-1.5">
        <div className="flex justify-between text-sm text-ink-300">
          <span>Subtotal (sin IVA)</span>
          <span className="font-mono">{empty ? '—' : formatMXN(net)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-300">
          <span>IVA 16%</span>
          <span className="font-mono">{empty ? '—' : formatMXN(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-ink pt-1 border-t border-line">
          <span className="text-base">Total</span>
          <span className="font-mono text-2xl tabular-nums">
            {empty ? '$0.00' : formatMXN(total)}
          </span>
        </div>
      </div>

      {/* Método de pago */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex gap-2 mb-3">
          {(['cash', 'card'] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onPaymentMethodChange(m)}
              className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors border ${
                paymentMethod === m
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-ink-200 border-line-2 hover:bg-surface-2'
              }`}
            >
              {m === 'cash' ? 'Efectivo' : 'Tarjeta'}
            </button>
          ))}
        </div>

        {needsDelivery && !empty && !deliveryReady && (
          <p className="text-[11px] text-ink-400 mb-2 text-center">
            Captura teléfono y dirección para despachar el envío.
          </p>
        )}

        <Button
          className="w-full h-12 text-base"
          disabled={!canCharge}
          onClick={paymentMethod === 'cash' ? onCobrarEfectivo : onCobrarTarjeta}
        >
          Cobrar
        </Button>
      </div>
    </div>
  );
};

export { calcTotals };
