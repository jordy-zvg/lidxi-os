import { createHmac } from 'node:crypto';
import { type TrackingSnapshot, publishTracking } from '@/lib/tracker';
import { type Database, createSupabaseServiceClient } from '@kobi/db';
import { type NextRequest, NextResponse } from 'next/server';

const secret = process.env.UBER_DIRECT_WEBHOOK_SECRET ?? '';

/** Verifica la firma HMAC-SHA256 del payload */
function verifySignature(body: string, signature: string | null): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  return signature === expected;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-uber-direct-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = payload.event_type as string;
  const orderId = payload.order_id as string | undefined;

  if (!orderId) return NextResponse.json({ ok: true }); // ignorar si no hay orderId

  const supabase = createSupabaseServiceClient();
  const now = new Date().toISOString();

  // Mapear evento a columnas de delivery_tracking
  type DTInsert = Database['public']['Tables']['delivery_tracking']['Insert'];
  const update: DTInsert = {
    order_id: orderId,
    last_event_at: now,
    updated_at: now,
    status: 'pending',
  };

  if (eventType === 'delivery.status_changed') {
    update.status = payload.status as string;
    if (payload.eta_seconds !== undefined) update.eta_seconds = payload.eta_seconds as number;
  }

  if (eventType === 'courier.update') {
    const courier = payload.courier as Record<string, unknown> | undefined;
    if (courier) {
      if (courier.lat !== undefined) update.courier_lat = courier.lat as number;
      if (courier.lng !== undefined) update.courier_lng = courier.lng as number;
      if (courier.name !== undefined) update.courier_name = courier.name as string;
      if (courier.phone !== undefined) update.courier_phone = courier.phone as string;
      if (courier.vehicle !== undefined) update.courier_vehicle = courier.vehicle as string;
      if (courier.photo_url !== undefined) update.courier_photo = courier.photo_url as string;
      if (courier.rating !== undefined) update.courier_rating = courier.rating as number;
      if (courier.plate !== undefined) update.plate = courier.plate as string;
    }
    if (payload.eta_seconds !== undefined) update.eta_seconds = payload.eta_seconds as number;
    if (payload.route_geometry !== undefined)
      update.route_geometry = payload.route_geometry as string;
  }

  if (eventType === 'delivery.completed') update.status = 'delivered';
  if (eventType === 'delivery.canceled') update.status = 'canceled';

  // Upsert en delivery_tracking
  const { data: row, error } = await supabase
    .from('delivery_tracking')
    .upsert(update, { onConflict: 'order_id' })
    .select('*')
    .single();

  if (error) {
    console.error('[uber-direct webhook] DB error:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  // Emitir snapshot al canal SSE
  if (row) {
    const snap: TrackingSnapshot = {
      orderId,
      status: (row as Record<string, unknown>).status as string,
      courierLat: (row as Record<string, unknown>).courier_lat as number | null,
      courierLng: (row as Record<string, unknown>).courier_lng as number | null,
      etaSeconds: (row as Record<string, unknown>).eta_seconds as number | null,
      courierName: (row as Record<string, unknown>).courier_name as string | null,
      courierPhone: (row as Record<string, unknown>).courier_phone as string | null,
      courierVehicle: (row as Record<string, unknown>).courier_vehicle as string | null,
      courierPhoto: (row as Record<string, unknown>).courier_photo as string | null,
      courierRating: (row as Record<string, unknown>).courier_rating as number | null,
      plate: (row as Record<string, unknown>).plate as string | null,
      routeGeometry: (row as Record<string, unknown>).route_geometry as string | null,
      lastEventAt: (row as Record<string, unknown>).last_event_at as string,
    };
    publishTracking(snap);
  }

  return NextResponse.json({ ok: true });
}
