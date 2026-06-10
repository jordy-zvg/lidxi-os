/**
 * Cliente real de Mercado Pago (sandbox + production), usando el SDK oficial
 * `mercadopago`.
 *
 * Las CREDENCIALES (qué cuenta cobra) ya NO se leen aquí: vienen del seam
 * `getCollectorCredentials(tenantId, environment)`, de modo que migrar a MP
 * Connect/OAuth sea cambiar SOLO ese resolver. Este módulo decide el ENTORNO
 * (sandbox vs production) y arma la request de la preference.
 */

import { type Result, err, ok } from '@kobi/shared';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { apiError } from '../common';
import { type MercadoPagoEnvironment, getCollectorCredentials } from './credentials';
import type { MercadoPagoPreference, MercadoPagoPreferenceRequest } from './types';

/** Construye un cliente del SDK a partir de un access token ya resuelto. */
export function buildMercadoPagoSdk(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken, options: { timeout: 5_000 } });
}

export async function createRealPreference(
  environment: MercadoPagoEnvironment,
  req: MercadoPagoPreferenceRequest,
): Promise<Result<MercadoPagoPreference>> {
  const creds = await getCollectorCredentials(req.tenantId, environment);
  if (!creds.ok) return creds;

  const sdk = buildMercadoPagoSdk(creds.data.accessToken);

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
        metadata: {
          tenant_id: req.tenantId,
          environment,
          restaurant_slug: req.restaurantSlug,
        },
      },
    });

    return ok({
      id: result.id ?? '',
      initPoint:
        (environment === 'production' ? result.init_point : result.sandbox_init_point) ?? '',
      sandboxInitPoint: result.sandbox_init_point ?? undefined,
    });
  } catch (e) {
    return err(
      apiError('upstream_error', e instanceof Error ? e.message : 'MP createPreference falló'),
    );
  }
}
