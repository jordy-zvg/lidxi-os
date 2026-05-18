import type { CentsMXN } from '@kobi/shared';

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  basePriceCents: CentsMXN;
  displayPriceCents: CentsMXN;
  description: string | null;
}

export interface TicketLine {
  /** ID estable por línea — permite múltiples líneas del mismo platillo */
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPriceCents: CentsMXN;
  /** Nota para cocina, ej. "Sin cebolla". Vacío = sin nota. */
  note: string;
}

export type PaymentMethod = 'cash' | 'card';

export interface SaleResult {
  orderId: string;
  folio: string;
  items: TicketLine[];
  totalCents: CentsMXN;
  taxCents: CentsMXN;
  netCents: CentsMXN;
  paymentMethod: PaymentMethod;
  paidCents?: CentsMXN;
  changeCents?: CentsMXN;
  customerName: string;
  createdAt: string;
}
