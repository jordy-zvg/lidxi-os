import type { EatsOrder } from './types';

export const mockOrder = (id: string): EatsOrder => ({
  id,
  externalReference: `EATS-${id.slice(0, 6).toUpperCase()}`,
  storeId: 'store_demo',
  status: 'created',
  customer: { firstName: 'Demo' },
  items: [
    {
      id: 'i1',
      externalId: 'sku_pastor',
      title: 'Taco de pastor',
      quantity: 3,
      priceCents: 4025,
      customizations: [],
    },
  ],
  totalCents: 12075,
  currency: 'MXN',
  estimatedReadyAt: new Date(Date.now() + 18 * 60_000).toISOString(),
});
