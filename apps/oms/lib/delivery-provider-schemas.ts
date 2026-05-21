/**
 * Esquema de credenciales por proveedor de logística. Análogo a
 * `channel-schemas.ts` pero para proveedores de entrega (Uber Direct, etc.).
 *
 * El server (`delivery-provider-actions.ts`) re-importa este objeto para
 * sanitizar credenciales y rechazar llaves arbitrarias antes de persistir.
 */

export type DeliveryProviderId = 'uber_direct';
export type DeliveryProviderStatus = 'disconnected' | 'pending' | 'connected' | 'error';

export interface DeliveryProviderFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
  required?: boolean;
  help?: string;
}

export interface DeliveryProviderSchema {
  label: string;
  brand: string;
  description: string;
  fields: DeliveryProviderFieldSchema[];
}

export const DELIVERY_PROVIDER_IDS: DeliveryProviderId[] = ['uber_direct'];

export const DELIVERY_PROVIDER_SCHEMAS: Record<DeliveryProviderId, DeliveryProviderSchema> = {
  uber_direct: {
    label: 'Uber Direct',
    brand: '#000000',
    description:
      'Logística on-demand para tu sitio propio: tú cobras, Uber Direct entrega. Cotización en tiempo real y tracking del repartidor.',
    fields: [
      {
        name: 'customer_id',
        label: 'Customer ID',
        type: 'text',
        placeholder: 'cus_…',
        required: true,
        help: 'Identificador de tu cuenta empresarial en Uber Direct',
      },
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
    ],
  },
};
