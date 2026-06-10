#!/usr/bin/env node
/**
 * Mock de webhook Mercado Pago para validar el flujo de pagos en local SIN
 * credenciales reales de MP.
 *
 * Uso:
 *   pnpm mock:mercado-pago <orderId> [status]
 *
 * status (estilo MP): approved (default) | pending | rejected | cancelled | refunded
 *
 * Requiere:
 *   - OMS corriendo (NEXT_PUBLIC_OMS_URL, default http://localhost:3000)
 *   - La migración 20260609000001 aplicada (orders.payment_status, mp_payment_id).
 *
 * Cómo funciona:
 *   El webhook real ahora (a) valida la firma OFICIAL de MP y (b) CONSULTA el
 *   pago a la API de MP (`payment.get`) — un pago sintético no existe en MP, así
 *   que este script usa el MISMO bypass mock que el storefront: header
 *   `x-mock-mp: true` + envelope `_mock`. El handler salta firma y fetch, y
 *   ejecuta la misma máquina de estados / escrituras de DB.
 *
 *   Para probar el reintento tras rechazo (la guarda `IN ('pending','failed')`):
 *     pnpm mock:mercado-pago <orderId> rejected   # → payment_status = failed
 *     pnpm mock:mercado-pago <orderId> approved    # → payment_status = paid
 *
 *   Idempotencia: re-correr `approved` sobre una orden ya 'paid' NO re-aplica.
 *
 * Verificación post-run (SQL):
 *   SELECT event_id, event_type, derived_status, signature_valid, error, processed_at
 *     FROM payment_events ORDER BY received_at DESC LIMIT 5;
 *   SELECT id, payment_status, mp_payment_id, payment_method, payment_ref
 *     FROM orders WHERE id='<orderId>';
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env.local');
try {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch {}

const orderId = process.argv[2];
const status = process.argv[3] ?? 'approved';

if (!orderId) {
  console.error('Usage: pnpm mock:mercado-pago <orderId> [status]');
  console.error(
    '  status: approved | pending | rejected | cancelled | refunded (default: approved)',
  );
  process.exit(1);
}

const OMS_URL = process.env.NEXT_PUBLIC_OMS_URL ?? 'http://localhost:3000';
const WEBHOOK = `${OMS_URL}/api/webhooks/mercado-pago`;

const paymentId = `mock-payment-${Date.now()}`;

// Envelope mock: mismo shape que envía storefront-actions.triggerMockMercadoPagoWebhook.
const payload = {
  type: 'payment',
  action: 'payment.updated',
  data: { id: paymentId },
  _mock: {
    paymentId,
    orderId,
    tenantId: null, // el handler resuelve el tenant desde la orden
    rawStatus: status, // approved | pending | rejected | cancelled | refunded
  },
};

console.log(`[mock-mp] POST ${WEBHOOK}  (x-mock-mp)`);
console.log(`[mock-mp]   order_id:   ${orderId}`);
console.log(`[mock-mp]   raw status: ${status}`);
console.log(`[mock-mp]   payment_id: ${paymentId}`);

const res = await fetch(WEBHOOK, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-mock-mp': 'true',
    'x-request-id': `mock-req-${Date.now()}`,
  },
  body: JSON.stringify(payload),
});

const json = await res.json().catch(() => ({}));
console.log(`[mock-mp] → HTTP ${res.status}`, JSON.stringify(json));

if (res.status !== 200) process.exit(1);
console.log('');
console.log('Verifica el resultado:');
console.log('  SELECT event_id, event_type, derived_status, signature_valid, error, processed_at');
console.log('    FROM payment_events ORDER BY received_at DESC LIMIT 5;');
console.log(
  `  SELECT id, payment_status, mp_payment_id, payment_method, payment_ref FROM orders WHERE id='${orderId}';`,
);
