/**
 * Primitivas de PROTOCOLO del webhook de Mercado Pago (sin DB).
 *
 * Aquí vive lo que es puramente "hablar MP": validar la firma oficial, consultar
 * el pago autoritativo a la API, y mapear su status al enum interno. La
 * orquestación de DB (audit log, marca idempotente de la orden) vive en el route
 * de OMS, que compone estas piezas. Así el webhook es UNO solo y reutilizable
 * (storefront y WhatsApp-B comparten esta capa sin duplicar).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { type Result, err, ok, pesos } from '@kobi/shared';
import { Payment } from 'mercadopago';
import { apiError } from '../common';
import { type MercadoPagoEnvironment, getCollectorCredentials } from './credentials';
import { buildMercadoPagoSdk } from './real';
import type { NormalizedMercadoPagoPayment, OrderPaymentStatus } from './types';

/**
 * Verifica la firma del webhook según la canonicalización OFICIAL de MP.
 *
 * MP envía:
 *   - header `x-signature: ts=<unix>,v1=<hmac_hex>`
 *   - header `x-request-id: <uuid>`
 *   - `data.id` en el payload (id del recurso/pago)
 *
 * El manifest firmado es EXACTAMENTE (incluido el `;` final):
 *
 *     id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * Si `data.id` es alfanumérico, MP lo normaliza a minúsculas antes de firmar.
 * HMAC-SHA256 con el secret de la firma (panel MP → Webhooks). Comparación en
 * tiempo constante.
 *
 * Doc: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks#validar-origen
 */
export function verifyMercadoPagoSignature(args: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = args;
  if (!secret || !xSignature || !dataId) return false;

  let ts = '';
  let v1 = '';
  for (const part of xSignature.split(',')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key === 'ts') ts = val;
    else if (key === 'v1') v1 = val;
  }
  if (!ts || !v1) return false;

  // MP normaliza data.id alfanumérico a minúsculas para el manifest.
  const normalizedId = /[a-zA-Z]/.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${normalizedId};request-id:${xRequestId ?? ''};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const provided = Buffer.from(v1, 'hex');
    const computed = Buffer.from(expected, 'hex');
    return provided.length === computed.length && timingSafeEqual(provided, computed);
  } catch {
    return false;
  }
}

/**
 * Mapea el status crudo de MP al enum interno DB-aligned. Lo desconocido NO se
 * marca pagado ni fallido: cae a 'pending' (estado seguro y no-terminal). El
 * route NO degrada órdenes en 'pending', así que un status raro no rompe nada.
 */
const STATUS_MAP: Record<string, OrderPaymentStatus> = {
  approved: 'paid',
  authorized: 'paid',
  in_process: 'pending',
  in_mediation: 'pending',
  pending: 'pending',
  rejected: 'failed',
  cancelled: 'failed',
  refunded: 'refunded',
  charged_back: 'refunded',
};

export function mapMercadoPagoStatus(rawStatus: string): OrderPaymentStatus {
  return STATUS_MAP[rawStatus] ?? 'pending';
}

/**
 * Consulta el pago a la API de MP (`payment.get`) y lo normaliza. Esta es la
 * fuente AUTORITATIVA del status — NUNCA confiamos en el status del payload del
 * webhook (de hecho la notificación real de MP solo trae `{ data: { id } }`).
 *
 * Las credenciales pasan por el seam `getCollectorCredentials` (v1: env). En v1
 * `tenantId` es null porque hay un solo collector.
 */
export async function fetchMercadoPagoPayment(
  environment: MercadoPagoEnvironment,
  paymentId: string,
): Promise<Result<NormalizedMercadoPagoPayment>> {
  const creds = await getCollectorCredentials(null, environment);
  if (!creds.ok) return creds;

  const sdk = buildMercadoPagoSdk(creds.data.accessToken);
  try {
    const payment = await new Payment(sdk).get({ id: paymentId });

    const orderId = payment.external_reference ?? '';
    if (!orderId) {
      return err(apiError('upstream_error', 'Pago MP sin external_reference', 422));
    }

    const rawStatus = payment.status ?? 'unknown';
    const metaTenant = (payment.metadata as Record<string, unknown> | undefined)?.tenant_id;

    return ok({
      mpPaymentId: String(payment.id ?? paymentId),
      orderId,
      status: mapMercadoPagoStatus(rawStatus),
      rawStatus,
      amountCents: pesos(payment.transaction_amount ?? 0),
      currency: payment.currency_id ?? 'MXN',
      tenantId: typeof metaTenant === 'string' ? metaTenant : null,
    });
  } catch (e) {
    // El SDK de MP lanza el cuerpo JSON de error (objeto plano, NO Error) con
    // un campo `.status`. Distinguimos permanente de transitorio para que el
    // caller no haga reintentar a MP indefinidamente:
    //   - 404/400/422 → permanente (pago inexistente para este collector,
    //     petición inválida): status < 500 → el webhook responde TERMINAL.
    //   - resto (timeout/red/5xx/401/403/429/sin status) → transitorio: 502 →
    //     el webhook responde 5xx y MP reintenta.
    const err_ = e as { status?: number; message?: unknown };
    const upstream = typeof err_?.status === 'number' ? err_.status : undefined;
    const message =
      e instanceof Error
        ? e.message
        : typeof err_?.message === 'string'
          ? err_.message
          : 'MP payment.get falló';
    const terminal = upstream === 404 || upstream === 400 || upstream === 422;
    return err(apiError('upstream_error', message, terminal ? 404 : 502));
  }
}
