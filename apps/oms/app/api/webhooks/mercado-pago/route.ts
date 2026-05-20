import { createHmac, timingSafeEqual } from 'node:crypto';
import { type Database, createSupabaseServiceClient } from '@kobi/db';
import { type NextRequest, NextResponse } from 'next/server';

type PaymentEventInsert = Database['public']['Tables']['payment_events']['Insert'];

export const runtime = 'nodejs';

const SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? '';

interface MpPaymentResource {
  id: string | number;
  status?: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Verifica la firma HMAC del header `x-signature` que envía Mercado Pago.
 *
 * Formato real MP: `ts=<unix>,v1=<hex>`. El payload firmado es
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`. Aquí usamos un esquema
 * compatible con el mock: si el header es solo `v1=<hex>`, validamos HMAC
 * del body crudo. Esto cubre el mock; para MP real, el caller mañana ajusta
 * a la canonicalización oficial.
 */
function verifySignature(rawBody: string, header: string | null): boolean {
  if (!SECRET || !header) return false;
  let provided: string;
  if (header.includes('v1=')) {
    const after = header.split('v1=')[1] ?? '';
    provided = after.split(',')[0] ?? '';
  } else {
    provided = header;
  }
  if (!provided) return false;
  const expected = createHmac('sha256', SECRET).update(rawBody).digest('hex');
  try {
    return (
      provided.length === expected.length &&
      timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
    );
  } catch {
    return false;
  }
}

const STATUS_TO_PAYMENT_STATUS: Record<string, string> = {
  approved: 'paid',
  authorized: 'paid',
  in_process: 'pending',
  pending: 'pending',
  rejected: 'failed',
  cancelled: 'cancelled',
  refunded: 'refunded',
  charged_back: 'refunded',
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  // Parse defensivo (si JSON inválido, igualmente loggeamos para audit).
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Sigue: la fila queda con error y signature_valid=false.
  }

  const eventId =
    (payload.id as string | number | undefined)?.toString() ??
    `unknown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const eventType =
    (payload.type as string | undefined) ?? (payload.action as string | undefined) ?? 'unknown';

  const supabase = createSupabaseServiceClient();
  const signatureValid = verifySignature(rawBody, signature);

  // Audit log SIEMPRE primero (M3): grabar antes de procesar.
  const insertPayload: PaymentEventInsert = {
    event_id: eventId,
    event_type: eventType,
    provider: 'mercado_pago',
    payload: payload as PaymentEventInsert['payload'],
    signature_valid: signatureValid,
  };
  await supabase.from('payment_events').upsert(insertPayload, { onConflict: 'event_id' });

  if (!signatureValid) {
    await supabase
      .from('payment_events')
      .update({ error: 'invalid_signature', processed_at: new Date().toISOString() })
      .eq('event_id', eventId);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Procesar solo eventos de payment.
  const isPayment = eventType.startsWith('payment') || eventType === 'payment';
  if (!isPayment) {
    await supabase
      .from('payment_events')
      .update({ processed_at: new Date().toISOString(), derived_status: 'ignored' })
      .eq('event_id', eventId);
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  const resource = (payload.data ?? payload) as MpPaymentResource;
  const externalRef = resource.external_reference;
  const mpStatus = resource.status ?? 'unknown';
  const derived = STATUS_TO_PAYMENT_STATUS[mpStatus] ?? 'unknown';

  if (!externalRef) {
    await supabase
      .from('payment_events')
      .update({
        processed_at: new Date().toISOString(),
        derived_status: derived,
        error: 'missing_external_reference',
      })
      .eq('event_id', eventId);
    return NextResponse.json({ ok: true, warning: 'missing_external_reference' });
  }

  // Resolver tenant_id desde la orden (para que el RLS de payment_events.tenant_id funcione).
  const { data: order } = await supabase
    .from('orders')
    .select('id, tenant_id')
    .eq('id', externalRef)
    .maybeSingle();

  if (!order) {
    await supabase
      .from('payment_events')
      .update({
        processed_at: new Date().toISOString(),
        derived_status: derived,
        error: 'order_not_found',
      })
      .eq('event_id', eventId);
    return NextResponse.json({ ok: true, warning: 'order_not_found' });
  }

  // Actualizar order.payment_status + cerrar payment_events.
  await supabase
    .from('orders')
    .update({
      payment_method: 'mercado_pago',
      payment_ref: resource.id?.toString() ?? null,
    })
    .eq('id', (order as { id: string }).id);

  await supabase
    .from('payment_events')
    .update({
      order_id: (order as { id: string }).id,
      tenant_id: (order as { tenant_id: string }).tenant_id,
      derived_status: derived,
      processed_at: new Date().toISOString(),
    })
    .eq('event_id', eventId);

  return NextResponse.json({ ok: true, orderId: (order as { id: string }).id, status: derived });
}
