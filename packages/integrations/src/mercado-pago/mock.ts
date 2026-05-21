/**
 * Mock de Mercado Pago.
 *
 * Genera preferences que apuntan a una página interna del storefront
 * (`/[restaurantSlug]/pago-mock?orderId=...`) en lugar de redirigir al
 * checkout real de MP. Esa página renderiza un UI "tarjeta de prueba"
 * que dispara el webhook simulado al hacer click en "Pagar".
 *
 * Las preferences se guardan en un Map en memoria para que el webhook
 * mock pueda recuperar `amount` y `tenantId` cuando se ejecuta.
 */

import type {
  MercadoPagoPaymentStatus,
  MercadoPagoPreference,
  MercadoPagoPreferenceRequest,
  MercadoPagoWebhookEvent,
} from './types';

interface StoredPreference {
  preferenceId: string;
  orderId: string;
  tenantId: string;
  total: number;
  payerEmail: string;
  createdAt: number;
}

const preferences = new Map<string, StoredPreference>();

const randomId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 12)}`;

export function createMockPreference(req: MercadoPagoPreferenceRequest): MercadoPagoPreference {
  const preferenceId = randomId('pref-mock');
  const total = req.items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  preferences.set(preferenceId, {
    preferenceId,
    orderId: req.orderId,
    tenantId: req.tenantId,
    total,
    payerEmail: req.payerEmail,
    createdAt: Date.now(),
  });

  // El init_point apunta a una página del storefront que muestra "tarjeta
  // de prueba" y dispara el webhook al confirmar.
  const initPoint = `${req.storefrontBaseUrl}/${req.restaurantSlug}/pago-mock?preferenceId=${preferenceId}&orderId=${req.orderId}`;
  return {
    id: preferenceId,
    initPoint,
    sandboxInitPoint: initPoint,
  };
}

export function getMockPreference(preferenceId: string): StoredPreference | null {
  return preferences.get(preferenceId) ?? null;
}

/**
 * Simula el evento de webhook que MP enviaría tras un pago exitoso.
 * Devuelve el payload que normalmente recibiría el endpoint /api/webhooks/mercado-pago.
 */
export function simulateWebhook(
  preferenceId: string,
  status: MercadoPagoPaymentStatus = 'paid',
): MercadoPagoWebhookEvent | null {
  const pref = preferences.get(preferenceId);
  if (!pref) return null;
  const rawStatusMap: Record<MercadoPagoPaymentStatus, string> = {
    paid: 'approved',
    pending: 'in_process',
    failed: 'rejected',
    cancelled: 'cancelled',
    refunded: 'refunded',
  };
  return {
    status,
    paymentId: randomId('pay-mock'),
    orderId: pref.orderId,
    tenantId: pref.tenantId,
    rawStatus: rawStatusMap[status],
    amount: pref.total,
    currency: 'MXN',
    createdAt: new Date().toISOString(),
  };
}

export function _resetMercadoPagoMockState(): void {
  preferences.clear();
}
