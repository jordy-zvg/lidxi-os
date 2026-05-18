'use client';

import { formatMXN } from '@kobi/shared';
import type { CentsMXN } from '@kobi/shared';
import { Modal } from '@kobi/ui';
import { IconCheck, IconCreditCard, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import type { CreateSaleInput } from '../../lib/pos-actions';
import { createSaleOrder } from '../../lib/pos-actions';
import type { SaleResult } from './types';

type CardState = 'waiting' | 'approved';

interface CobrarTarjetaModalProps {
  open: boolean;
  onClose: () => void;
  totalCents: CentsMXN;
  taxCents: CentsMXN;
  netCents: CentsMXN;
  saleInput: Omit<CreateSaleInput, 'paymentMethod' | 'paidCents' | 'changeCents'>;
  onSuccess: (result: SaleResult) => void;
}

export const CobrarTarjetaModal = ({
  open,
  onClose,
  totalCents,
  taxCents,
  netCents,
  saleInput,
  onSuccess,
}: CobrarTarjetaModalProps) => {
  const [cardState, setCardState] = useState<CardState>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSimulateApproval = () => {
    setCardState('approved');
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await createSaleOrder({
        ...saleInput,
        paymentMethod: 'card',
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
        paymentMethod: 'card',
        customerName: saleInput.customerName,
        createdAt: new Date().toISOString(),
      });
    });
  };

  const handleClose = () => {
    setCardState('waiting');
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} maxWidth="380px" closeOnEscape={!isPending}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-ink">Cobro con tarjeta</h2>
          <button
            type="button"
            onClick={handleClose}
            className="h-8 w-8 flex items-center justify-center rounded text-ink-300 hover:bg-surface-2"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Total */}
        <div className="bg-canvas rounded-lg p-4 mb-6 text-center">
          <p className="text-xs text-ink-400 mb-1">Total</p>
          <p className="font-mono text-3xl font-semibold text-ink tabular-nums">
            {formatMXN(totalCents)}
          </p>
        </div>

        {cardState === 'waiting' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-brand-soft flex items-center justify-center">
              <IconCreditCard size={36} className="text-brand" />
            </div>
            <div className="text-center">
              <p className="font-medium text-ink mb-1">Terminal lista</p>
              <p className="text-sm text-ink-400">Deslice o acerque la tarjeta al lector</p>
            </div>
            {/* Botón demo para simular cobro */}
            <button
              type="button"
              onClick={handleSimulateApproval}
              className="text-xs text-ink-400 underline hover:text-ink-200 transition-colors"
            >
              Simular cobro autorizado
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-ok-soft flex items-center justify-center">
              <IconCheck size={36} className="text-ok" />
            </div>
            <div className="text-center">
              <p className="font-medium text-ok-text mb-1">Cobro autorizado</p>
              <p className="text-sm text-ink-400">Confirma para registrar la venta</p>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-danger-text mt-4 text-center">{error}</p>}

        {cardState === 'approved' && (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full h-12 rounded-md bg-brand text-white text-base font-semibold mt-6 hover:bg-brand-hover disabled:opacity-40 transition-colors"
          >
            {isPending ? 'Registrando…' : 'Confirmar venta'}
          </button>
        )}
      </div>
    </Modal>
  );
};
