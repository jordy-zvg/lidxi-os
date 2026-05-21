/**
 * Mock de Uber Direct con state-machine determinístico por tiempo.
 *
 * Diseño:
 *   - Cada delivery vive en un Map en memoria del proceso Node.
 *   - El "estado actual" se computa por la diferencia entre `now()` y
 *     el `createdAt` del delivery. No hay setTimeout: el estado es una
 *     función pura del tiempo elapsed.
 *   - El polling del caller llama `getDelivery(id)` y obtiene siempre
 *     el snapshot consistente con el wall clock.
 *   - La posición del courier se interpola linealmente entre pickup y
 *     dropoff coordinates durante la fase `picked_up`.
 *
 * Ventajas frente a setTimeout:
 *   - Determinístico: dos llamadas a getDelivery() en el mismo instante
 *     devuelven exactamente lo mismo. Reiniciar el server no rompe nada
 *     porque el state se persiste implícitamente en el `createdAt`.
 *   - Sin race conditions: no hay timer queue que limpiar.
 *   - Trivial de testear: avanzas Date.now() mockeado.
 *
 * Trade-off:
 *   - El Map vive en memoria del proceso. Si el server se reinicia, los
 *     deliveries en curso pierden su state interno. Compensamos persistiendo
 *     el delivery en la tabla `deliveries` de Postgres en el caller.
 */

import type {
  UberDirectCourier,
  UberDirectDelivery,
  UberDirectDeliveryStatus,
  UberDirectQuote,
  UberDirectQuoteRequest,
} from './types';

// ---------------------------------------------------------------------------
// State machine: stages por elapsed time desde createDelivery()
// ---------------------------------------------------------------------------
// Los tiempos son ACELERADOS para que en mock se pueda ver el ciclo completo
// en < 2 minutos. En real, Uber Direct entrega típicamente en 25-40 min.

interface Stage {
  fromSeconds: number;
  status: UberDirectDeliveryStatus;
  /** % del trayecto pickup→dropoff que ha recorrido el courier en esta fase. */
  progress: number;
}

const STAGES: Stage[] = [
  { fromSeconds: 0, status: 'pending', progress: 0 }, // sin courier asignado todavía
  { fromSeconds: 15, status: 'courier_assigned', progress: 0 }, // courier acepta, en camino al restaurante
  { fromSeconds: 45, status: 'pickup_arrived', progress: 0 }, // courier llega al restaurante
  { fromSeconds: 65, status: 'picked_up', progress: 0 }, // courier recoge orden, sale al cliente
  { fromSeconds: 110, status: 'dropoff_arrived', progress: 1 }, // courier llega al cliente
  { fromSeconds: 125, status: 'delivered', progress: 1 }, // entregada, fin
];

const TOTAL_DELIVERY_SECONDS = 125;

const COURIER_POOL: UberDirectCourier[] = [
  {
    name: 'Carlos M.',
    phone: '+52 55 1234 5678',
    vehicle: 'motorcycle',
    plate: 'MEX-A12',
    rating: 4.92,
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=carlos&backgroundType=solid',
  },
  {
    name: 'Diana R.',
    phone: '+52 55 2345 6789',
    vehicle: 'bike',
    plate: '—',
    rating: 4.87,
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=diana&backgroundType=solid',
  },
  {
    name: 'Iván T.',
    phone: '+52 55 3456 7890',
    vehicle: 'scooter',
    plate: 'MEX-B33',
    rating: 4.95,
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=ivan&backgroundType=solid',
  },
];

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
interface MockDeliveryRecord {
  id: string;
  createdAt: number; // Date.now() ms
  quote: UberDirectQuote;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  courier: UberDirectCourier;
  canceledAt: number | null;
  cancelReason: string | null;
}

const deliveries = new Map<string, MockDeliveryRecord>();
const quotes = new Map<string, UberDirectQuoteContext>();

interface UberDirectQuoteContext {
  quote: UberDirectQuote;
  request: UberDirectQuoteRequest;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const randomId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`;

const isoIn = (ms: number): string => new Date(Date.now() + ms).toISOString();

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Distancia Haversine en metros. Si alguno de los lat/lng falta,
 * cae a un valor por defecto razonable (~2.5 km).
 */
function haversineMeters(
  lat1: number | undefined,
  lng1: number | undefined,
  lat2: number | undefined,
  lng2: number | undefined,
): number {
  if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) {
    return 2_500;
  }
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Cálculo de tarifa: base + por-km, con un mínimo y máximo realistas.
 * Refleja aproximadamente la estructura real de Uber Direct MX.
 */
function calculateFeeCents(distanceMeters: number): number {
  const BASE_CENTS = 3_500; // $35 MXN base
  const PER_KM_CENTS = 1_200; // $12 MXN/km
  const km = distanceMeters / 1_000;
  const raw = BASE_CENTS + PER_KM_CENTS * km;
  const clamped = Math.max(4_000, Math.min(15_000, Math.round(raw))); // $40–$150 MXN
  return clamped;
}

function pickCourierForId(deliveryId: string): UberDirectCourier {
  let hash = 0;
  for (let i = 0; i < deliveryId.length; i++) {
    hash = (hash * 31 + deliveryId.charCodeAt(i)) >>> 0;
  }
  // biome-ignore lint/style/noNonNullAssertion: COURIER_POOL no está vacío.
  return COURIER_POOL[hash % COURIER_POOL.length]!;
}

function currentStage(elapsedSeconds: number): Stage {
  // biome-ignore lint/style/noNonNullAssertion: STAGES tiene al menos un elemento.
  let active: Stage = STAGES[0]!;
  for (const s of STAGES) {
    if (elapsedSeconds >= s.fromSeconds) active = s;
  }
  return active;
}

/**
 * Calcula la posición del courier dado el estado y % de progreso.
 *
 *   - pending / courier_assigned: courier aún no en pickup → lo dibujamos
 *     en una posición "acercándose" (interpolación entre fuera-de-mapa y
 *     pickup, basada en el sub-progreso dentro de la fase).
 *   - pickup_arrived: courier en pickup exacto.
 *   - picked_up: interpolación lineal pickup → dropoff por % elapsed.
 *   - dropoff_arrived / delivered: courier en dropoff.
 */
function computeCourierPosition(
  elapsedSeconds: number,
  stage: Stage,
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
): { lat: number; lng: number } {
  switch (stage.status) {
    case 'pending':
    case 'courier_assigned': {
      // Sub-progreso dentro de pending+courier_assigned (0s a 45s)
      const t = Math.min(1, elapsedSeconds / 45);
      // Aproximación al pickup desde un punto al norte
      const startLat = pickupLat + 0.01;
      const startLng = pickupLng + 0.01;
      return { lat: lerp(startLat, pickupLat, t), lng: lerp(startLng, pickupLng, t) };
    }
    case 'pickup_arrived':
      return { lat: pickupLat, lng: pickupLng };
    case 'picked_up': {
      // De segundo 65 a segundo 110 (45s de viaje)
      const t = Math.min(1, Math.max(0, (elapsedSeconds - 65) / 45));
      return { lat: lerp(pickupLat, dropoffLat, t), lng: lerp(pickupLng, dropoffLng, t) };
    }
    case 'dropoff_arrived':
    case 'delivered':
    case 'returned':
      return { lat: dropoffLat, lng: dropoffLng };
    case 'canceled':
    case 'error':
      return { lat: pickupLat, lng: pickupLng };
  }
}

// ---------------------------------------------------------------------------
// API mock pública
// ---------------------------------------------------------------------------

export function createMockQuote(req: UberDirectQuoteRequest): UberDirectQuote {
  const distanceMeters = haversineMeters(
    req.pickupAddress.lat,
    req.pickupAddress.lng,
    req.dropoffAddress.lat,
    req.dropoffAddress.lng,
  );
  const durationSeconds = Math.round(180 + (distanceMeters / 1_000) * 180); // base 3 min + 3 min/km
  const feeCents = calculateFeeCents(distanceMeters);
  const quote: UberDirectQuote = {
    id: randomId('qt'),
    feeCents,
    currency: 'MXN',
    distanceMeters,
    durationSeconds,
    pickupEta: isoIn(15 * 1_000), // 15s en mock (∼15 min en real)
    dropoffEta: isoIn(durationSeconds * 100), // ms compactados x10
    expiresAt: isoIn(5 * 60_000), // 5 min real
  };
  quotes.set(quote.id, { quote, request: req });
  return quote;
}

export function createMockDelivery(
  quoteId: string,
  externalIdSeed?: string,
): UberDirectDelivery | null {
  const ctx = quotes.get(quoteId);
  if (!ctx) return null;

  const id = externalIdSeed ?? randomId('del');
  const pickupLat = ctx.request.pickupAddress.lat ?? 19.4326;
  const pickupLng = ctx.request.pickupAddress.lng ?? -99.1332;
  const dropoffLat = ctx.request.dropoffAddress.lat ?? 19.42;
  const dropoffLng = ctx.request.dropoffAddress.lng ?? -99.15;

  const record: MockDeliveryRecord = {
    id,
    createdAt: Date.now(),
    quote: ctx.quote,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    courier: pickCourierForId(id),
    canceledAt: null,
    cancelReason: null,
  };
  deliveries.set(id, record);

  return (
    getMockDelivery(id) ?? {
      id,
      status: 'pending',
      trackingUrl: trackingUrlFor(id),
    }
  );
}

export function getMockDelivery(id: string): UberDirectDelivery | null {
  const r = deliveries.get(id);
  if (!r) return null;

  if (r.canceledAt) {
    return {
      id: r.id,
      status: 'canceled',
      trackingUrl: trackingUrlFor(r.id),
      cancelReason: r.cancelReason ?? 'Cancelado por el restaurante',
    };
  }

  const elapsedSeconds = (Date.now() - r.createdAt) / 1_000;
  const stage = currentStage(elapsedSeconds);
  const pos = computeCourierPosition(
    elapsedSeconds,
    stage,
    r.pickupLat,
    r.pickupLng,
    r.dropoffLat,
    r.dropoffLng,
  );

  // En 'pending' no exponemos courier aún (el dispatcher Uber lo asigna en
  // segundos pero NO está confirmado), salvo opcionalmente.
  const courier: UberDirectCourier | undefined =
    stage.status === 'pending' ? undefined : { ...r.courier, lat: pos.lat, lng: pos.lng };

  const dropoffEta = new Date(r.createdAt + TOTAL_DELIVERY_SECONDS * 1_000).toISOString();
  const pickupEta = new Date(r.createdAt + 45 * 1_000).toISOString();

  return {
    id: r.id,
    status: stage.status,
    trackingUrl: trackingUrlFor(r.id),
    courier,
    pickupEta,
    dropoffEta,
    proofOfDeliveryUrl:
      stage.status === 'delivered' ? `https://track.example.test/${r.id}/proof.jpg` : undefined,
  };
}

export function cancelMockDelivery(id: string, reason?: string): boolean {
  const r = deliveries.get(id);
  if (!r) return false;
  const elapsedSeconds = (Date.now() - r.createdAt) / 1_000;
  const stage = currentStage(elapsedSeconds);
  // No se puede cancelar si ya fue entregada.
  if (stage.status === 'delivered') return false;
  r.canceledAt = Date.now();
  r.cancelReason = reason ?? null;
  return true;
}

function trackingUrlFor(id: string): string {
  // En real esto es un sub-dominio público de Uber Direct; en mock apuntamos
  // a /[restaurantSlug]/seguimiento del storefront vía relative path,
  // pero el caller del wrapper sustituye con su propia URL si quiere.
  return `https://track.uberdirect.example/${id}`;
}

/**
 * Solo para tests / debugging interno. NO usar desde rutas de UI.
 */
export function _resetMockState(): void {
  deliveries.clear();
  quotes.clear();
}

/**
 * Solo para tests: avanza el reloj artificial. En producción la mock
 * usa Date.now() real, pero el helper permite avanzar deliveries para
 * verificar transiciones.
 */
export function _forceDeliveryStatus(id: string, status: UberDirectDeliveryStatus): boolean {
  const r = deliveries.get(id);
  if (!r) return false;
  const target = STAGES.find((s) => s.status === status);
  if (!target) {
    if (status === 'canceled') {
      r.canceledAt = Date.now();
      r.cancelReason = r.cancelReason ?? 'Cancelado (test)';
      return true;
    }
    return false;
  }
  // Reescribimos createdAt para que `elapsedSeconds = target.fromSeconds + 1`
  r.createdAt = Date.now() - (target.fromSeconds + 1) * 1_000;
  return true;
}
