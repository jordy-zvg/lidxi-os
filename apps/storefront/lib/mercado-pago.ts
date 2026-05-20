import { MercadoPagoConfig } from 'mercadopago';

/**
 * Build a Mercado Pago SDK client for the given mode.
 *
 * El access token se decide en runtime según `tenants.payment_mode`:
 *   - 'test'       → MERCADO_PAGO_ACCESS_TOKEN_TEST
 *   - 'production' → MERCADO_PAGO_ACCESS_TOKEN_PROD
 *
 * Si la env var correspondiente no está poblada, devuelve null y el caller
 * decide cómo manejar (típicamente: 500 + log). En Sprint 8 prep esto es lo
 * esperado — el código existe pero no se ejecuta contra MP real hasta mañana.
 */
export function buildMercadoPagoClient(mode: 'test' | 'production'): MercadoPagoConfig | null {
  const token =
    mode === 'production'
      ? process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD
      : process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST;

  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 5_000 } });
}
