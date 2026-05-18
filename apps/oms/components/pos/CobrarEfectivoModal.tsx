'use client';

import { cents, formatMXN } from '@kobi/shared';
import type { CentsMXN } from '@kobi/shared';
import { Keypad, Modal } from '@kobi/ui';
import { IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import type { CreateSaleInput } from '../../lib/pos-actions';
import { createSaleOrder } from '../../lib/pos-actions';
import type { SaleResult } from './types';

interface CobrarEfectivoModalProps {
  open: boolean;
  onClose: () => void;
  totalCents: CentsMXN;
  taxCents: CentsMXN;
  netCents: CentsMXN;
  saleInput: Omit<CreateSaleInput, 'paymentMethod' | 'paidCents' | 'changeCents'>;
  onSuccess: (result: SaleResult) => void;
}

export const CobrarEfectivoModal = ({
  open,
  onClose,
  totalCents,
  taxCents,
  netCents,
  saleInput,
  onSuccess,
}: CobrarEfectivoModalProps) => {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const paidCents: CentsMXN = cents(Math.round(Number.parseFloat(digits || '0') * 100));
  const changeCents: CentsMXN = cents(Math.max(0, paidCents - totalCents));
  const canConfirm = paidCents >= totalCents;

  const handleDigit = (d: string) => {
    setDigits((prev) => {
      const next = prev + d;
      // Máximo 8 dígitos para evitar números gigantes
      if (next.replace('.', '').length > 8) return prev;
      return next;
    });
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
  };

  // Formatear digits como pesos: construye "1234" → "12.34"
  const displayPaid = (() => {
    if (!digits) return '$0.00';
    // Insertar punto decimal automáticamente (estilo keypad de caja)
    const n = Number(digits);
    if (Number.isNaN(n)) return '$0.00';
    return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  })();

  const handleConfirm = () => {
    if (!canConfirm) return;
    setError(null);
    startTransition(async () => {
      const result = await createSaleOrder({
        ...saleInput,
        paymentMethod: 'cash',
        paidCents,
        changeCents,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess({
        orderId: result.data.orderId,
        folio: result.data.folio,
        items: saleInput.items,
        totalCents,
        taxCents,
        netCents,
        paymentMethod: 'cash',
        paidCents,
        changeCents,
        customerName: saleInput.customerName,
        createdAt: new Date().toISOString(),
      });
    });
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="400px" closeOnEscape={!isPending}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-ink">Cobro en efectivo</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Total */}
        <div className="bg-canvas rounded-lg p-4 mb-5 text-center">
          <p className="text-xs text-ink-400 mb-1">Total a cobrar</p>
          <p className="font-mono text-3xl font-semibold text-ink tabular-nums">
            {formatMXN(totalCents)}
          </p>
        </div>

        {/* Pago recibido */}
        <div className="mb-4 text-center">
          <p className="text-xs text-ink-400 mb-1">Pago recibido</p>
          <p
            className={`font-mono text-2xl font-semibold tabular-nums transition-colors ${
              canConfirm ? 'text-ok' : 'text-ink'
            }`}
          >
            {displayPaid}
          </p>
        </div>

        {/* Cambio */}
        {canConfirm && (
          <div className="mb-4 bg-ok-soft rounded-lg p-3 text-center">
            <p className="text-xs text-ok-text mb-0.5">Cambio</p>
            <p className="font-mono text-xl font-semibold text-ok-text tabular-nums">
              {formatMXN(changeCents)}
            </p>
          </div>
        )}

        {/* Teclado */}
        <Keypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onClear={() => setDigits('')}
          disabled={isPending}
          size="sm"
          className="mb-5"
        />

        {error && <p className="text-xs text-danger-text mb-3 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm || isPending}
          className="w-full h-12 rounded-md bg-brand text-white text-base font-semibold hover:bg-brand-hover disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Registrando…' : 'Confirmar cobro'}
        </button>
      </div>
    </Modal>
  );
};
