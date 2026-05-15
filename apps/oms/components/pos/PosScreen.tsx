'use client';
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { loadMenu } from '../../lib/pos-actions';
import { CobrarEfectivoModal } from './CobrarEfectivoModal';
import { CobrarTarjetaModal } from './CobrarTarjetaModal';
import { MenuGrid } from './MenuGrid';
import { ReciboView } from './ReciboView';
import { Ticket, calcTotals } from './Ticket';
import type { MenuItemData, PaymentMethod, SaleResult, TicketLine } from './types';

type Screen = 'pos' | 'cash' | 'card' | 'receipt';

const newId = () => Math.random().toString(36).slice(2, 10);

export const PosScreen = () => {
  const [menu, setMenu] = useState<MenuItemData[]>([]);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [lines, setLines] = useState<TicketLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [screen, setScreen] = useState<Screen>('pos');
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null);

  useEffect(() => {
    loadMenu().then((result) => {
      if (result.ok) setMenu(result.data);
      else setMenuError(result.error);
      setLoading(false);
    });
  }, []);

  // Badge total por menuItemId en el menú
  const qtyMap: Record<string, number> = {};
  for (const line of lines) {
    qtyMap[line.menuItemId] = (qtyMap[line.menuItemId] ?? 0) + line.qty;
  }

  /** Clic en una card del menú: incrementa la primera línea sin nota del mismo ítem,
   *  o crea una nueva línea con qty=1 si no existe ninguna sin nota. */
  const handleAdd = useCallback((item: MenuItemData) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.menuItemId === item.id && l.note === '');
      if (idx >= 0) {
        return prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          id: newId(),
          menuItemId: item.id,
          name: item.name,
          qty: 1,
          unitPriceCents: item.displayPriceCents,
          note: '',
        },
      ];
    });
  }, []);

  const handleIncrement = useCallback((lineId: string) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, qty: l.qty + 1 } : l)));
  }, []);

  const handleDecrement = useCallback((lineId: string) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const handleSetNote = useCallback((lineId: string, note: string, scope: 'all' | 'one') => {
    setLines((prev) => {
      const line = prev.find((l) => l.id === lineId);
      if (!line) return prev;

      if (scope === 'one' && note && line.qty > 1) {
        // Separar 1 unidad con nota; el resto sin nota
        const withNote: TicketLine = { ...line, id: newId(), qty: 1, note };
        const rest: TicketLine = { ...line, qty: line.qty - 1, note: '' };
        return prev.flatMap((l) => (l.id === lineId ? [rest, withNote] : [l]));
      }

      // 'all' o qty=1: aplicar nota a toda la línea
      return prev.map((l) => (l.id === lineId ? { ...l, note } : l));
    });
  }, []);

  const handleSuccess = (result: SaleResult) => {
    setSaleResult(result);
    setScreen('receipt');
  };

  const handleNuevaVenta = () => {
    setLines([]);
    setCustomerName('');
    setPaymentMethod('cash');
    setSaleResult(null);
    setScreen('pos');
  };

  const handlePrint = () => {
    alert(`Imprimiendo recibo ${saleResult?.folio ?? ''}…`);
  };

  const { total, tax, net } = calcTotals(lines);

  const saleInput = {
    customerName: customerName || 'Mostrador',
    customerPhone: null,
    items: lines,
    totalCents: total,
    taxCents: tax,
    netCents: net,
  };

  if (screen === 'receipt' && saleResult) {
    return <ReciboView result={saleResult} onNuevaVenta={handleNuevaVenta} onPrint={handlePrint} />;
  }

  return (
    <div className="flex h-full gap-4 min-h-0">
      {/* Columna izquierda — Menú */}
      <div className="flex-[55] min-w-0 flex flex-col min-h-0">
        <h1 className="text-xl font-medium text-ink shrink-0 mb-3">Punto de venta</h1>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <IconLoader2 size={24} className="text-ink-400 animate-spin" />
          </div>
        ) : menuError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <IconAlertCircle size={32} className="text-warn" />
            <p className="text-sm font-medium text-ink">No se pudo cargar el menú</p>
            <p className="text-xs text-ink-400">{menuError}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setMenuError(null);
                loadMenu().then((r) => {
                  if (r.ok) setMenu(r.data);
                  else setMenuError(r.error);
                  setLoading(false);
                });
              }}
              className="text-sm text-brand underline mt-1"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <MenuGrid items={menu} qtyMap={qtyMap} onAdd={handleAdd} />
        )}
      </div>

      {/* Columna derecha — Ticket */}
      <div className="flex-[45] min-h-0">
        <Ticket
          lines={lines}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onSetNote={(lineId, note, scope) => handleSetNote(lineId, note, scope)}
          onCobrarEfectivo={() => setScreen('cash')}
          onCobrarTarjeta={() => setScreen('card')}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      </div>

      <CobrarEfectivoModal
        open={screen === 'cash'}
        onClose={() => setScreen('pos')}
        totalCents={total}
        taxCents={tax}
        netCents={net}
        saleInput={saleInput}
        onSuccess={handleSuccess}
      />

      <CobrarTarjetaModal
        open={screen === 'card'}
        onClose={() => setScreen('pos')}
        totalCents={total}
        taxCents={tax}
        netCents={net}
        saleInput={saleInput}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
