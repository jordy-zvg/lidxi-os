#!/usr/bin/env node
/**
 * Mock de webhook Mercado Pago para validar el flujo de pagos en local
 * sin necesidad de credenciales reales de MP.
 *
 * Uso:
 *   pnpm mock:mercado-pago <orderId> [status]
 *
 * status: approved (default) | pending | rejected | cancelled | refunded
 *
 * Requiere:
 *   - OMS corriendo (NEXT_PUBLIC_OMS_URL, default http://localhost:3000)
 *   - MERCADO_PAGO_WEBHOOK_SECRET en .env.local (cualquier string en local)
 *
 * Qué hace:
 *   1. Construye un payload de webhook MP (type=payment, action=payment.updated).
 *   2. Firma con HMAC-SHA256 usando el secret de env.
 *   3. POSTea al endpoint /api/webhooks/mercado-pago.
 *   4. Reporta status code y el resultado.
 *
 * Cómo verificar después del run:
 *   psql ...c "SELECT event_id, event_type, derived_status, error, processed_at \
 *               FROM payment_events ORDER BY received_at DESC LIMIT 5;"
 *   psql ...c "SELECT id, payment_method, payment_ref FROM orders WHERE id='<orderId>';"
 */

import { createHmac } from 'node:crypto';
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
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch {}

const orderId = process.argv[2];
const status = process.argv[3] ?? 'approved';

if (!orderId) {
  console.error('Usage: pnpm mock:mercado-pago <orderId> [status]');
  console.error("  status: approved | pending | rejected | cancelled | refunded (default: approved)");
  process.exit(1);
}

const OMS_URL = process.env.NEXT_PUBLIC_OMS_URL ?? 'http://localhost:3000';
const SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? 'dev-mp-secret';
const WEBHOOK = `${OMS_URL}/api/webhooks/mercado-pago`;

const paymentId = `mock-payment-${Date.now()}`;
const eventId = `mock-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const payload = {
  id: eventId,
  type: 'payment',
  action: 'payment.updated',
  data: {
    id: paymentId,
    status,
    status_detail: status === 'approved' ? 'accredited' : status,
    external_reference: orderId,
    payment_method_id: 'visa',
    transaction_amount: 100,
    currency_id: 'MXN',
  },
};

const body = JSON.stringify(payload);
const signature = `v1=${createHmac('sha256', SECRET).update(body).digest('hex')}`;

console.log(`[mock-mp] POST ${WEBHOOK}`);
console.log(`[mock-mp]   order_id:  ${orderId}`);
console.log(`[mock-mp]   status:    ${status}`);
console.log(`[mock-mp]   event_id:  ${eventId}`);

const res = await fetch(WEBHOOK, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': signature,
    'x-request-id': `mock-req-${Date.now()}`,
  },
  body,
});

const json = await res.json().catch(() => ({}));
console.log(`[mock-mp] → HTTP ${res.status}`, JSON.stringify(json));

if (res.status !== 200) process.exit(1);
console.log('');
console.log('Verifica el resultado:');
console.log("  psql ... -c \"SELECT event_id, event_type, derived_status, signature_valid, error,");
console.log('              processed_at FROM payment_events ORDER BY received_at DESC LIMIT 3;"');
console.log("  psql ... -c \"SELECT id, payment_method, payment_ref FROM orders WHERE id='" + orderId + "';\"");
