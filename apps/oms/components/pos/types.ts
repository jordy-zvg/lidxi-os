import type { CentsMXN } from '@lidxi/shared';

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  /** Precio neto de BD (sin IVA) */
  basePriceCents: CentsMXN;
  /** Precio con IVA 16% — lo que se muestra al cliente */
  displayPriceCents: CentsMXN;
  description: string | null;
}

export interface TicketLine {
  menuItemId: string;
  name: string;
  qty: number;
  /** unitPriceCents = displayPriceCents (con IVA) */
  unitPriceCents: CentsMXN;
}

export type PaymentMethod = 'cash' | 'card';

export interface SaleResult {
  orderId: string;
  folio: string;
  items: TicketLine[];
  /** Total bruto (con IVA) */
  totalCents: CentsMXN;
  /** IVA contenido en el total: total * 16/116 */
  taxCents: CentsMXN;
  /** Neto sin IVA: total - tax */
  netCents: CentsMXN;
  paymentMethod: PaymentMethod;
  paidCents?: CentsMXN;
  changeCents?: CentsMXN;
  customerName: string;
  createdAt: string;
}
