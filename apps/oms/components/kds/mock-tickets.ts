import type { ChannelKey } from '@kobi/shared';

export type Station = 'all' | 'hot' | 'cold' | 'pack';

export interface TicketItem {
  id: number;
  name: string;
  qty: number;
  mods: string[];
}

export interface Ticket {
  id: string;
  channel: ChannelKey;
  customer: string;
  elapsed: number;
  station: Station;
  items: TicketItem[];
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'MZTL-2892',
    channel: 'direct',
    customer: 'Andrea Castillo',
    elapsed: 245,
    station: 'hot',
    items: [
      { id: 1, name: 'Taco de pastor', qty: 2, mods: ['Sin cebolla'] },
      { id: 2, name: 'Agua de horchata', qty: 1, mods: [] },
    ],
  },
  {
    id: 'UE-58291',
    channel: 'eats',
    customer: 'Carlos Mendez',
    elapsed: 634,
    station: 'hot',
    items: [
      { id: 3, name: 'Quesadilla de huitlacoche', qty: 1, mods: ['Extra queso'] },
      { id: 4, name: 'Pozole rojo', qty: 1, mods: ['Sin rábano', 'Extra tostadas'] },
    ],
  },
  {
    id: 'RP-44102',
    channel: 'rappi',
    customer: 'María González',
    elapsed: 923,
    station: 'pack',
    items: [
      { id: 5, name: 'Taco de suadero', qty: 3, mods: [] },
      { id: 6, name: 'Refresco vidrio', qty: 2, mods: [] },
    ],
  },
  {
    id: 'MZTL-2889',
    channel: 'direct',
    customer: 'Luis Ramírez',
    elapsed: 78,
    station: 'cold',
    items: [{ id: 7, name: 'Arroz con leche', qty: 2, mods: [] }],
  },
];
