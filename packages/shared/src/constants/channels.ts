/**
 * Canales de venta. El sistema soporta marketplaces (Eats/Rappi/Didi),
 * el sitio propio del restaurante (direct) y la venta presencial (mostrador).
 *
 * Los colores son los hex que usan los badges de canal en el sistema.
 * `ChannelBadge` en @kobi/ui consume este mapa directamente — editar aquí
 * propaga a todos los badges y a la comanda impresa.
 */

export const CHANNELS = {
  direct: {
    key: 'direct',
    label: 'Sitio propio',
    short: 'Web',
    bg: '#EFF4FF',
    color: '#1A56DB',
  },
  eats: {
    key: 'eats',
    label: 'Uber Eats',
    // 'UBER', no 'Eats': la comanda la lee un cocinero de reojo y el
    // repartidor dice "vengo por un pedido de Uber". (Sprint 19, Fase 3a)
    short: 'UBER',
    bg: '#E6F4EA',
    color: '#137333',
  },
  rappi: {
    key: 'rappi',
    label: 'Rappi',
    short: 'Rappi',
    // Fondo neutro + texto ink — el rojo Rappi (#FF441F) es brand del canal,
    // no del sistema. Chip neutral evita colisión con rojo de errores (--danger).
    bg: '#F8FAFC',
    color: '#425466',
  },
  didi: {
    key: 'didi',
    label: 'Didi Food',
    short: 'Didi',
    bg: '#FEF7E6',
    color: '#93530A',
  },
  mostrador: {
    key: 'mostrador',
    label: 'Mostrador',
    short: 'POS',
    bg: '#F1F5F9',
    color: '#425466',
  },
  whatsapp: {
    key: 'whatsapp',
    label: 'WhatsApp',
    short: 'WA',
    // Teal en vez del verde brand (#25D366): el verde claro ya lo ocupa Eats.
    bg: '#E6F7F4',
    color: '#0F766E',
  },
} as const;

export type ChannelKey = keyof typeof CHANNELS;

export const CHANNEL_KEYS = Object.keys(CHANNELS) as ChannelKey[];

/**
 * Canales con precio propio en `menu_channel_prices` (CHECK de la tabla).
 * 'mostrador' queda fuera a propósito: el POS cobra `base_price`.
 */
export const PRICE_CHANNELS = ['direct', 'eats', 'rappi', 'didi', 'whatsapp'] as const;

export type PriceChannel = (typeof PRICE_CHANNELS)[number];

export const isMarketplace = (channel: ChannelKey): boolean =>
  channel === 'eats' || channel === 'rappi' || channel === 'didi';
