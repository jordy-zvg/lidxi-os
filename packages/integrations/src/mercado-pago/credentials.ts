/**
 * Seam de credenciales del COLLECTOR de Mercado Pago — el núcleo multi-tenant.
 *
 * Separamos dos conceptos que el código viejo mezclaba:
 *   - ENTORNO (sandbox vs production): lo decide `MP_MODE`, por DEPLOY.
 *   - CREDENCIALES (qué cuenta MP cobra): lo decide ESTA función, por TENANT.
 *
 * Hoy (v1) es single-collector: todos los tenants cobran a la cuenta de Miztli,
 * leída de env por entorno. `tenantId` se recibe pero NO se usa todavía — está
 * en la firma para que migrar a MP Connect/OAuth sea cambiar SOLO la fuente aquí
 * dentro, sin tocar ningún call-site (ni la creación de preferencia ni el fetch
 * del pago en el webhook).
 */

import { type Result, err, ok } from '@kobi/shared';
import { apiError } from '../common';

export type MercadoPagoEnvironment = 'sandbox' | 'production';

export interface CollectorCredentials {
  /** Access token del collector. SECRETO server-side — nunca expuesto al cliente. */
  accessToken: string;
  /**
   * Public key del collector. Solo la necesitarían Bricks/Checkout API; el flujo
   * de Checkout Pro por redirect NO la usa, así que puede ser null.
   */
  publicKey: string | null;
  /** De dónde salió la credencial. Para observabilidad / logs. */
  source: 'env' | 'oauth';
}

/**
 * Resuelve las credenciales del collector para un tenant en un entorno dado.
 *
 * `async` a propósito: en v1 resuelve sincrónicamente desde env, pero la firma
 * ya es asíncrona para que v2 (Connect) haga el lookup en DB del token OAuth del
 * tenant sin cambiar ningún call-site.
 *
 * `tenantId` nullable: el webhook lo pasa `null` en v1 porque hay un solo
 * collector. En v2 (Connect, NO ahora), el webhook resolverá el collector desde
 * el `user_id` de NIVEL SUPERIOR de la notificación de webhook (viene en el
 * payload, disponible ANTES de llamar a `payment.get`) — NO desde
 * `payment.user_id` — mapeará ese collector a un tenant, y pasará ese tenantId
 * aquí para obtener el token OAuth correcto.
 */
export async function getCollectorCredentials(
  tenantId: string | null,
  environment: MercadoPagoEnvironment,
): Promise<Result<CollectorCredentials>> {
  // v1 single-collector: tenantId se ignora (ver doc del módulo). El `void` deja
  // el parámetro presente en la firma para el seam de Connect sin warning de lint.
  void tenantId;

  const accessToken =
    environment === 'production'
      ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
      : process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST;

  if (!accessToken) {
    return err(
      apiError('config', `Mercado Pago sin access token para entorno '${environment}'`, 503),
    );
  }

  const publicKey =
    (environment === 'production'
      ? process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_PROD
      : process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST) ?? null;

  return ok({ accessToken, publicKey, source: 'env' });
}
