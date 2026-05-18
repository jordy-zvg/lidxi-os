import type { CentsMXN, ChannelKey } from '@kobi/shared';

export interface ReceiptOrder {
  id: string;
  channel: ChannelKey;
  externalId: string | null;
  createdAt: string;
  customer?: { name?: string; phone?: string; address?: string };
  items: { qty: number; name: string; notes?: string; modifiers?: string[] }[];
  subtotal: CentsMXN;
  tax: CentsMXN;
  deliveryFee?: CentsMXN;
  total: CentsMXN;
  paymentMethod?: string;
}

export interface PrinterTarget {
  type: 'network' | 'usb' | 'mock';
  /** Para network: "192.168.1.50:9100" o solo IP (puerto default 9100). */
  address?: string;
  /** Para USB: { vendorId, productId } como números o hex string. */
  vendor?: string;
  product?: string;
}

export type TemplateName =
  | 'kitchen-ticket'
  | 'packing-label'
  | 'customer-receipt'
  | 'shift-closeout';
