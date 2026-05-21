/**
 * Esquema de campos por canal. La UI usa esto para renderizar el sub-formulario
 * con los inputs correctos. Server-side `channel-actions.ts` re-importa este
 * objeto para sanitizar credentials y rechazar llaves arbitrarias.
 */

export type ChannelId = 'uber_eats' | 'rappi' | 'didi_food' | 'mercado_pago';
export type ChannelStatus = 'disconnected' | 'pending' | 'connected' | 'error';

export interface ChannelFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
  required?: boolean;
}

export interface ChannelSchema {
  label: string;
  brand: string;
  fields: ChannelFieldSchema[];
}

export const CHANNEL_IDS: ChannelId[] = ['uber_eats', 'rappi', 'didi_food', 'mercado_pago'];

export const CHANNEL_SCHEMAS: Record<ChannelId, ChannelSchema> = {
  uber_eats: {
    label: 'Uber Eats',
    brand: '#06C167',
    fields: [
      {
        name: 'store_id',
        label: 'Store ID',
        type: 'text',
        placeholder: 'UE-12345-MX',
        required: true,
      },
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
    ],
  },
  rappi: {
    label: 'Rappi',
    brand: '#FF441F',
    fields: [
      {
        name: 'store_id',
        label: 'Store ID',
        type: 'text',
        placeholder: 'RP-12345',
        required: true,
      },
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  didi_food: {
    label: 'Didi Food',
    brand: '#FF6E14',
    fields: [
      {
        name: 'store_id',
        label: 'Store ID',
        type: 'text',
        placeholder: 'DF-12345',
        required: true,
      },
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  mercado_pago: {
    label: 'Mercado Pago',
    brand: '#00B1EA',
    fields: [
      {
        name: 'public_key',
        label: 'Public Key',
        type: 'text',
        placeholder: 'APP_USR-…',
        required: true,
      },
      {
        name: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'APP_USR-…',
        required: true,
      },
      { name: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true },
    ],
  },
};
