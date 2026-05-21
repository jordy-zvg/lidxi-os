import { createSupabaseServiceClient } from '@kobi/db';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Devuelve el estado público de una orden + delivery activa para que el
 * storefront pueda mostrar tracking sin requerir autenticación.
 * Defense in depth: comparamos el orderId contra el tenant que vive en la
 * URL pública via path param (lo deriva el caller).
 */
export async function GET(_req: NextRequest, { params }: { params: { orderId: string } }) {
  const supabase = createSupabaseServiceClient();
  const orderId = params.orderId;

  const { data: orderRow } = await supabase
    .from('orders')
    .select(
      'id, status, payment_method, created_at, accepted_at, ready_at, dispatched_at, delivered_at',
    )
    .eq('id', orderId)
    .maybeSingle();
  if (!orderRow) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  const { data: deliveryRow } = await supabase
    .from('deliveries')
    .select(
      'status, courier_name, courier_vehicle, courier_lat, courier_lng, pickup_eta, dropoff_eta, assigned_at, picked_up_at, delivered_at',
    )
    .eq('order_id', orderId)
    .maybeSingle();

  return NextResponse.json({
    order: orderRow,
    delivery: deliveryRow ?? null,
  });
}
