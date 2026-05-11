import type { DidiOrder } from './types.js';

export const mockOrder = (id: string): DidiOrder => ({
  id,
  reference: `DIDI-${id.slice(0, 4).toUpperCase()}`,
  status: 'pending',
  customer: { name: 'Demo Didi' },
  items: [
    {
      externalId: 'sku_bistec',
      name: 'Taco de bistec',
      quantity: 2,
      priceCents: 4370,
      options: [],
    },
  ],
  totalCents: 8740,
  currency: 'MXN',
});
