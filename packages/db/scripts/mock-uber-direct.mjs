#!/usr/bin/env node
/**
 * Simulador de webhooks Uber Direct para desarrollo.
 *
 * Uso:
 *   pnpm mock:uber-direct <orderId>
 *   node packages/db/scripts/mock-uber-direct.mjs <orderId>
 *
 * Requiere: OMS corriendo en NEXT_PUBLIC_OMS_URL (default http://localhost:3000)
 * Requiere: UBER_DIRECT_WEBHOOK_SECRET en .env.local (puede ser cualquier string en dev)
 *
 * Qué hace:
 *   1. Avanza el status del courier por: accepted → picking_up → on_route → arrived → delivered
 *   2. Mueve la posición del courier en línea recta hacia el cliente cada 3s
 *   3. Reduce el ETA con cada update
 *   4. Envía los eventos como POST al webhook handler del OMS
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
    const v = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
} catch {}

const orderId = process.argv[2];
if (!orderId) {
  console.error('Usage: pnpm mock:uber-direct <orderId>');
  process.exit(1);
}

const OMS_URL = process.env.NEXT_PUBLIC_OMS_URL ?? 'http://localhost:3000';
const SECRET = process.env.UBER_DIRECT_WEBHOOK_SECRET ?? 'dev-secret';
const WEBHOOK = `${OMS_URL}/api/webhooks/uber-direct`;

// Coordenadas: cocina → cliente (demo Roma Norte CDMX)
const START = { lat: 19.4194, lng: -99.1678 };
const END = { lat: 19.4142, lng: -99.1617 };

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sign(body) {
  return createHmac('sha256', SECRET).update(body).digest('hex');
}

async function send(eventType, extra = {}) {
  const payload = JSON.stringify({ event_type: eventType, order_id: orderId, ...extra });
  const res = await fetch(WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-uber-direct-signature': sign(payload),
    },
    body: payload,
  });
  console.log(`[mock] ${eventType} → ${res.status}`);
}

const STEPS = [
  { status: 'accepted', delay: 2000, etaSeconds: 900 },
  { status: 'picking_up', delay: 5000, etaSeconds: 600 },
  { status: 'on_route', delay: 3000, etaSeconds: 480 },
  { status: 'on_route', delay: 3000, etaSeconds: 300 },
  { status: 'on_route', delay: 3000, etaSeconds: 180 },
  { status: 'arrived', delay: 3000, etaSeconds: 60 },
  { status: 'delivered', delay: 2000, etaSeconds: 0 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n🚴 Simulando entrega Uber Direct para orden: ${orderId}`);
console.log(`   Webhook: ${WEBHOOK}\n`);

// Enviar info del courier al aceptar
await send('delivery.status_changed', {
  status: 'accepted',
  eta_seconds: 900,
  courier: {
    name: 'Andrés López (mock)',
    phone: '+52 55 1234 5678',
    vehicle: 'bike',
    rating: 4.92,
    plate: 'MOCK-01',
    lat: START.lat,
    lng: START.lng,
  },
});

for (let i = 0; i < STEPS.length; i++) {
  const step = STEPS[i];
  await sleep(step.delay);

  const t = i / (STEPS.length - 1);
  const lat = lerp(START.lat, END.lat, t);
  const lng = lerp(START.lng, END.lng, t);

  await send('delivery.status_changed', { status: step.status, eta_seconds: step.etaSeconds });
  await send('courier.update', {
    eta_seconds: step.etaSeconds,
    courier: { lat, lng, name: 'Andrés López (mock)', vehicle: 'bike' },
  });
}

console.log('\n✅ Simulación completada. Orden entregada.');
