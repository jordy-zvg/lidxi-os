/**
 * Canales de venta. El sistema soporta marketplaces (Eats/Rappi/Didi),
 * el sitio propio del restaurante (direct) y la venta presencial (mostrador).
 *
 * Los colores son los hex que usan los badges de canal en el sistema.
 * Mantén estos sincronizados con `ChannelBadge` en @lidxi/ui.
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
    short: 'Eats',
    bg: '#E6F4EA',
    color: '#137333',
  },
  rappi: {
    key: 'rappi',
    label: 'Rappi',
    short: 'Rappi',
    bg: '#FEE7EB',
    color: '#A8112E',
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
} as const;

export type ChannelKey = keyof typeof CHANNELS;

export const CHANNEL_KEYS = Object.keys(CHANNELS) as ChannelKey[];

export const isMarketplace = (channel: ChannelKey): boolean =>
  channel === 'eats' || channel === 'rappi' || channel === 'didi';
