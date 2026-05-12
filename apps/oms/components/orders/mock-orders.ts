import type { ChannelKey, OrderStatus } from '@lidxi/shared';

export interface OrderItem {
  id: number;
  name: string;
  qty: number;
  mods: string[];
  unitPrice: number;
}

export interface TimelineStep {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
}

export interface CourierInfo {
  name: string;
  eta: number;
  progress: number;
}

export interface MockOrder {
  id: string;
  channel: ChannelKey;
  status: OrderStatus;
  customer: string;
  phone: string;
  address: string;
  distance: string;
  deliveryEta: number;
  items: OrderItem[];
  platformFee: number | null;
  courier: CourierInfo | null;
  createdAt: string;
  timeline: TimelineStep[];
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'MZTL-2891',
    channel: 'direct',
    status: 'ready',
    customer: 'Andrea Castillo',
    phone: '55-1234-5678',
    address: 'Tonalá 142, Roma Norte',
    distance: '2.1 km',
    deliveryEta: 11,
    items: [
      { id: 1, name: 'Taco de pastor', qty: 2, mods: ['Sin cebolla'], unitPrice: 45 },
      { id: 2, name: 'Agua de horchata', qty: 1, mods: [], unitPrice: 30 },
    ],
    platformFee: null,
    courier: { name: 'Andrés López', eta: 8, progress: 78 },
    createdAt: '2026-05-11T14:32:00Z',
    timeline: [
      { status: 'received', label: 'Recibido', timestamp: '14:32' },
      { status: 'preparing', label: 'Aceptado', timestamp: '14:33' },
      { status: 'preparing', label: 'Preparando', timestamp: '14:35' },
      { status: 'ready', label: 'Listo', timestamp: '14:50' },
      { status: 'dispatched', label: 'Despachado', timestamp: null },
      { status: 'delivered', label: 'Entregado', timestamp: null },
    ],
  },
  {
    id: 'UE-58291',
    channel: 'eats',
    status: 'preparing',
    customer: 'Carlos Mendez',
    phone: '55-9876-4321',
    address: 'Álvaro Obregón 23, Condesa',
    distance: '3.4 km',
    deliveryEta: 22,
    items: [
      { id: 3, name: 'Quesadilla de huitlacoche', qty: 1, mods: ['Extra queso'], unitPrice: 85 },
      {
        id: 4,
        name: 'Pozole rojo',
        qty: 1,
        mods: ['Sin rábano', 'Extra tostadas'],
        unitPrice: 120,
      },
    ],
    platformFee: 25,
    courier: null,
    createdAt: '2026-05-11T14:28:00Z',
    timeline: [
      { status: 'received', label: 'Recibido', timestamp: '14:28' },
      { status: 'preparing', label: 'Aceptado', timestamp: '14:29' },
      { status: 'preparing', label: 'Preparando', timestamp: '14:30' },
      { status: 'ready', label: 'Listo', timestamp: null },
      { status: 'dispatched', label: 'Despachado', timestamp: null },
      { status: 'delivered', label: 'Entregado', timestamp: null },
    ],
  },
  {
    id: 'RP-44102',
    channel: 'rappi',
    status: 'received',
    customer: 'María González',
    phone: '55-5555-1234',
    address: 'Orizaba 58, Roma Norte',
    distance: '1.8 km',
    deliveryEta: 18,
    items: [
      { id: 5, name: 'Taco de suadero', qty: 3, mods: [], unitPrice: 40 },
      { id: 6, name: 'Refresco vidrio', qty: 2, mods: [], unitPrice: 25 },
    ],
    platformFee: 18,
    courier: null,
    createdAt: '2026-05-11T14:47:00Z',
    timeline: [
      { status: 'received', label: 'Recibido', timestamp: '14:47' },
      { status: 'preparing', label: 'Aceptado', timestamp: null },
      { status: 'preparing', label: 'Preparando', timestamp: null },
      { status: 'ready', label: 'Listo', timestamp: null },
      { status: 'dispatched', label: 'Despachado', timestamp: null },
      { status: 'delivered', label: 'Entregado', timestamp: null },
    ],
  },
  {
    id: 'MZTL-2889',
    channel: 'direct',
    status: 'dispatched',
    customer: 'Luis Ramírez',
    phone: '55-2222-3333',
    address: 'Colima 101, Roma Norte',
    distance: '0.9 km',
    deliveryEta: 5,
    items: [{ id: 7, name: 'Arroz con leche', qty: 2, mods: [], unitPrice: 55 }],
    platformFee: null,
    courier: { name: 'Sofía Reyes', eta: 4, progress: 62 },
    createdAt: '2026-05-11T14:15:00Z',
    timeline: [
      { status: 'received', label: 'Recibido', timestamp: '14:15' },
      { status: 'preparing', label: 'Aceptado', timestamp: '14:16' },
      { status: 'preparing', label: 'Preparando', timestamp: '14:17' },
      { status: 'ready', label: 'Listo', timestamp: '14:28' },
      { status: 'dispatched', label: 'Despachado', timestamp: '14:35' },
      { status: 'delivered', label: 'Entregado', timestamp: null },
    ],
  },
];

export const STATUS_COLUMN: OrderStatus[] = ['received', 'preparing', 'ready', 'dispatched'];
