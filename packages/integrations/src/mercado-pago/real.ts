/**
 * Cliente real de Mercado Pago (sandbox + production).
 *
 * Usa el SDK oficial `mercadopago`. El access token se decide por modo:
 *   - sandbox     → MERCADO_PAGO_ACCESS_TOKEN_TEST
 *   - production  → MERCADO_PAGO_ACCESS_TOKEN_PROD
 *
 * Si la env var del modo solicitado no está poblada, devuelve null y el
 * caller decide qué hacer (típicamente: 503 + log).
 */

import { type Result, err, ok } from '@kobi/shared';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { apiError } from '../common';
import type { MercadoPagoPreference, MercadoPagoPreferenceRequest } from './types';

export type MercadoPagoMode = 'sandbox' | 'production';

function tokenForMode(mode: MercadoPagoMode): string | null {
  if (mode === 'production') {
    return process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD ?? null;
  }
  return process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST ?? null;
}

export function buildMercadoPagoSdk(mode: MercadoPagoMode): MercadoPagoConfig | null {
  const token = tokenForMode(mode);
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 5_000 } });
}

export async function createRealPreference(
  mode: MercadoPagoMode,
  req: MercadoPagoPreferenceRequest,
): Promise<Result<MercadoPagoPreference>> {
  const sdk = buildMercadoPagoSdk(mode);
  if (!sdk) {
    return err(apiError('config', `MP no configurado para modo ${mode}`, 503));
  }

  try {
    const preference = new Preference(sdk);
    const result = await preference.create({
      body: {
        external_reference: req.orderId,
        payer: { email: req.payerEmail },
        items: req.items.map((it, i) => ({
          id: `${req.orderId}-${i}`,
          title: it.title,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          currency_id: 'MXN',
        })),
        back_urls: {
          success: `${req.storefrontBaseUrl}/${req.restaurantSlug}/pago/exito?orderId=${req.orderId}`,
          failure: `${req.storefrontBaseUrl}/${req.restaurantSlug}/pago/error?orderId=${req.orderId}`,
          pending: `${req.storefrontBaseUrl}/${req.restaurantSlug}/pago/pendiente?orderId=${req.orderId}`,
        },
        auto_return: 'approved',
        notification_url: `${req.omsBaseUrl}/api/webhooks/mercado-pago`,
        metadata: { tenant_id: req.tenantId, mode, restaurant_slug: req.restaurantSlug },
      },
    });

    return ok({
      id: result.id ?? '',
      initPoint: (mode === 'production' ? result.init_point : result.sandbox_init_point) ?? '',
      sandboxInitPoint: result.sandbox_init_point ?? undefined,
    });
  } catch (e) {
    return err(
      apiError('upstream_error', e instanceof Error ? e.message : 'MP createPreference falló'),
    );
  }
}
