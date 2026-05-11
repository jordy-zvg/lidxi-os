import type { RappiOrder } from './types';

export const mockOrder = (id: string): RappiOrder => ({
  id,
  reference: `RAP-${id.slice(0, 4).toUpperCase()}`,
  status: 'pending',
  customer: { name: 'Demo Rappi' },
  items: [
    {
      externalId: 'sku_quesa_huit',
      name: 'Quesadilla de huitlacoche',
      quantity: 1,
      priceCents: 7475,
      toppings: [],
    },
  ],
  totalCents: 7475,
  currency: 'MXN',
  paymentMethod: 'app',
});
