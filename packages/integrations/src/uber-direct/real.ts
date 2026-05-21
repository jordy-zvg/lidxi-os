/**
 * Cliente real de Uber Direct (sandbox + production).
 *
 * Esqueleto listo para activar cuando tengamos credenciales de partner.
 * Toda la lógica de hostnames + OAuth está cableada; falta solo poblar
 * env vars y popular UBER_DIRECT_MODE=sandbox|production.
 *
 * Referencia: https://developer.uber.com/docs/deliveries/api/uber-direct
 *
 * Auth flow:
 *   1. POST {AUTH_HOST}/oauth/v2/token con grant_type=client_credentials,
 *      scope=eats.deliveries. Devuelve access_token + expires_in.
 *   2. Cache del token en memoria; refresh cuando expira en < 60s.
 *
 * Endpoints:
 *   POST {API_HOST}/v1/customers/{customer_id}/delivery_quotes
 *   POST {API_HOST}/v1/customers/{customer_id}/deliveries
 *   GET  {API_HOST}/v1/customers/{customer_id}/deliveries/{delivery_id}
 *   POST {API_HOST}/v1/customers/{customer_id}/deliveries/{delivery_id}/cancel
 *
 * Webhook: verifica firma HMAC-SHA256 con `X-Uber-Signature`.
 */

import { type Result, err, ok } from '@kobi/shared';
import { apiError } from '../common';
import type {
  UberDirectDelivery,
  UberDirectDeliveryStatus,
  UberDirectQuote,
  UberDirectQuoteRequest,
  UberDirectWebhookEvent,
} from './types';

export interface UberDirectRealCredentials {
  customerId: string;
  clientId: string;
  clientSecret: string;
  webhookSecret?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

const tokenCache = new Map<string, CachedToken>();

function hosts(mode: 'sandbox' | 'production'): { auth: string; api: string } {
  // Uber's sandbox and production share the auth host today; sandbox
  // applies to the deliveries API key/customer. Documentation may shift —
  // si cambia, sólo se ajusta aquí.
  return {
    auth: 'https://auth.uber.com',
    api: 'https://api.uber.com',
  };
}

async function getAccessToken(
  mode: 'sandbox' | 'production',
  creds: UberDirectRealCredentials,
): Promise<Result<string>> {
  const cacheKey = `${mode}:${creds.clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAtMs - Date.now() > 60_000) {
    return ok(cached.accessToken);
  }
  const { auth } = hosts(mode);
  try {
    const res = await fetch(`${auth}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        scope: 'eats.deliveries',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return err(apiError('auth_failed', `Token endpoint ${res.status}: ${text}`, res.status));
    }
    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json.access_token) return err(apiError('auth_failed', 'access_token ausente'));
    const expiresAtMs = Date.now() + (json.expires_in ?? 3_600) * 1_000;
    tokenCache.set(cacheKey, { accessToken: json.access_token, expiresAtMs });
    return ok(json.access_token);
  } catch (e) {
    return err(apiError('network', e instanceof Error ? e.message : 'fetch failed'));
  }
}

async function callJson<T>(url: string, init: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const text = await res.text();
      return err(apiError('upstream_error', `${res.status}: ${text}`, res.status));
    }
    return ok((await res.json()) as T);
  } catch (e) {
    return err(apiError('network', e instanceof Error ? e.message : 'fetch failed'));
  }
}

/**
 * Normaliza el status crudo del payload Uber al enum de Kobi.
 * Uber usa `pickup_complete`, `dropoff`, `pickup` — los mapeamos.
 */
function normalizeStatus(raw: string): UberDirectDeliveryStatus {
  const map: Record<string, UberDirectDeliveryStatus> = {
    pending: 'pending',
    pickup: 'courier_assigned',
    courier_assigned: 'courier_assigned',
    en_route_to_pickup: 'courier_assigned',
    arrived_at_pickup: 'pickup_arrived',
    pickup_complete: 'picked_up',
    picked_up: 'picked_up',
    en_route_to_dropoff: 'picked_up',
    dropoff: 'dropoff_arrived',
    arrived_at_dropoff: 'dropoff_arrived',
    delivered: 'delivered',
    canceled: 'canceled',
    cancelled: 'canceled',
    returned: 'returned',
  };
  return map[raw] ?? 'pending';
}

function parseDelivery(raw: Record<string, unknown>): UberDirectDelivery {
  const id = raw.id as string;
  const status = normalizeStatus((raw.status as string) ?? 'pending');
  const courierRaw = raw.courier as Record<string, unknown> | undefined;
  const location = courierRaw?.location as Record<string, unknown> | undefined;
  return {
    id,
    status,
    trackingUrl: (raw.tracking_url as string) ?? `https://track.uber.com/${id}`,
    courier: courierRaw
      ? {
          name: (courierRaw.name as string) ?? 'Courier',
          phone: courierRaw.phone_number as string | undefined,
          vehicle: courierRaw.vehicle_type as 'bike' | 'car' | 'motorcycle' | 'scooter' | undefined,
          plate: courierRaw.vehicle_make as string | undefined,
          photoUrl: courierRaw.img_href as string | undefined,
          rating: courierRaw.rating as number | undefined,
          lat: location?.lat as number | undefined,
          lng: location?.lng as number | undefined,
        }
      : undefined,
    pickupEta: raw.pickup_eta as string | undefined,
    dropoffEta: raw.dropoff_eta as string | undefined,
    proofOfDeliveryUrl: raw.proof_of_delivery_image_url as string | undefined,
  };
}

function parseQuote(raw: Record<string, unknown>): UberDirectQuote {
  return {
    id: raw.id as string,
    feeCents: (raw.fee as number) ?? 0,
    currency: ((raw.currency_type as string) ?? 'MXN') as 'MXN' | 'USD',
    distanceMeters: (raw.distance_meters as number) ?? 0,
    durationSeconds: ((raw.duration as number) ?? 1_800) * 60,
    pickupEta: (raw.pickup_eta as string) ?? new Date().toISOString(),
    dropoffEta: (raw.dropoff_eta as string) ?? new Date(Date.now() + 1.8e6).toISOString(),
    expiresAt: (raw.expires_at as string) ?? new Date(Date.now() + 300_000).toISOString(),
  };
}

export interface UberDirectRealClient {
  quote(req: UberDirectQuoteRequest): Promise<Result<UberDirectQuote>>;
  createDelivery(quoteId: string): Promise<Result<UberDirectDelivery>>;
  getDelivery(deliveryId: string): Promise<Result<UberDirectDelivery>>;
  cancelDelivery(deliveryId: string): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<UberDirectWebhookEvent>>;
}

export function createRealUberDirectClient(
  mode: 'sandbox' | 'production',
  creds: UberDirectRealCredentials,
): UberDirectRealClient {
  const { api } = hosts(mode);
  const customerEndpoint = `${api}/v1/customers/${creds.customerId}`;

  async function authed<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
    const tokenRes = await getAccessToken(mode, creds);
    if (!tokenRes.ok) return tokenRes;
    return callJson<T>(`${customerEndpoint}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${tokenRes.data}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return {
    async quote(req) {
      const res = await authed<Record<string, unknown>>('/delivery_quotes', {
        method: 'POST',
        body: JSON.stringify({
          pickup_address: JSON.stringify(req.pickupAddress),
          dropoff_address: JSON.stringify(req.dropoffAddress),
          pickup_phone_number: req.pickupContact.phone,
          dropoff_phone_number: req.dropoffContact.phone,
          pickup_ready_dt: req.pickupReadyAt,
          pickup_deadline_dt: req.pickupDeadlineAt,
          manifest_total_value: req.manifestTotalCents ?? 0,
        }),
      });
      if (!res.ok) return res;
      return ok(parseQuote(res.data));
    },

    async createDelivery(quoteId) {
      const res = await authed<Record<string, unknown>>('/deliveries', {
        method: 'POST',
        body: JSON.stringify({ quote_id: quoteId }),
      });
      if (!res.ok) return res;
      return ok(parseDelivery(res.data));
    },

    async getDelivery(deliveryId) {
      const res = await authed<Record<string, unknown>>(`/deliveries/${deliveryId}`);
      if (!res.ok) return res;
      return ok(parseDelivery(res.data));
    },

    async cancelDelivery(deliveryId) {
      const res = await authed<Record<string, unknown>>(`/deliveries/${deliveryId}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) return res;
      return ok(undefined);
    },

    async verifyWebhook(rawBody, signature) {
      if (!creds.webhookSecret) {
        return err(apiError('config', 'UBER_DIRECT_WEBHOOK_SECRET no configurado'));
      }
      try {
        // Node imports lazy para no romper edge runtime si no se llama.
        const { createHmac, timingSafeEqual } = await import('node:crypto');
        const expected = createHmac('sha256', creds.webhookSecret).update(rawBody).digest('hex');
        const provided = signature.replace(/^sha256=/, '');
        if (
          provided.length !== expected.length ||
          !timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
        ) {
          return err(apiError('invalid_signature', 'webhook signature mismatch', 401));
        }
        const parsed = JSON.parse(rawBody) as Record<string, unknown>;
        return ok({
          type:
            (parsed.event_type as string) === 'delivery.proof'
              ? 'delivery.proof'
              : (parsed.event_type as string) === 'courier.update'
                ? 'courier.update'
                : 'delivery.status',
          deliveryId: (parsed.delivery_id as string) ?? '',
          data: parseDelivery(parsed),
          timestamp: (parsed.created as string) ?? new Date().toISOString(),
        });
      } catch (e) {
        return err(apiError('invalid_payload', e instanceof Error ? e.message : 'parse error'));
      }
    },
  };
}
