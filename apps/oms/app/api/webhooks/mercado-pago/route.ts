import { type Database, createSupabaseServiceClient } from '@kobi/db';
import { MercadoPago } from '@kobi/integrations';
import { type NextRequest, NextResponse } from 'next/server';

type PaymentEventInsert = Database['public']['Tables']['payment_events']['Insert'];
type PaymentEventUpdate = Database['public']['Tables']['payment_events']['Update'];

export const runtime = 'nodejs';

const SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? '';

/** Payload `_mock` que inyecta el flujo mock (storefront / CLI). */
interface MockEvent {
  paymentId: string;
  orderId: string;
  tenantId: string | null;
  rawStatus: string;
}

/**
 * Estados de pago desde los que SÍ se permite transicionar al estado derivado.
 * Garantiza idempotencia y la monotonicidad correcta de la máquina:
 *   - paid     gana sobre 'pending' Y sobre un intento previo 'failed' — Checkout
 *              Pro permite reintentar tras un rechazo bajo la misma preferencia,
 *              así que un approve posterior debe ganar.
 *   - failed   solo aplica si seguía 'pending' (un rechazo TARDÍO no degrada una
 *              orden ya pagada).
 *   - refunded solo aplica sobre un pago ya 'paid'.
 *   - pending  nunca degrada (no-op de transición).
 * Re-aplicar el mismo estado terminal es no-op (el origen no se incluye a sí
 * mismo) → idempotente ante reenvíos de MP.
 */
const ALLOWED_SOURCE_STATES: Record<string, readonly string[] | null> = {
  paid: ['pending', 'failed'],
  failed: ['pending'],
  refunded: ['paid'],
  pending: null,
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  const isMockMp = req.headers.get('x-mock-mp') === 'true';

  // Parse defensivo (si el JSON es inválido, igual loggeamos para audit).
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Sigue: la fila queda con error y signature_valid=false.
  }

  const data = (payload.data ?? {}) as Record<string, unknown>;
  const dataId = (data.id ?? payload.id)?.toString() ?? null;

  // event_id estable para idempotencia del LOG: id de notificación si existe,
  // si no el id del recurso. El upsert ON CONFLICT event_id dedup reenvíos.
  const eventId =
    (payload.id ?? data.id)?.toString() ??
    `unknown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const eventType =
    (payload.type as string | undefined) ?? (payload.action as string | undefined) ?? 'unknown';

  const supabase = createSupabaseServiceClient();

  const closeEvent = (fields: PaymentEventUpdate) =>
    supabase
      .from('payment_events')
      .update({ processed_at: new Date().toISOString(), ...fields })
      .eq('event_id', eventId);

  // ── Firma: mocks sin firma; MP real exige la canonicalización oficial. ──
  const signatureValid = isMockMp
    ? true
    : MercadoPago.verifyMercadoPagoSignature({ xSignature, xRequestId, dataId, secret: SECRET });

  // ── Audit log SIEMPRE primero: grabar antes de procesar. ──
  const insertPayload: PaymentEventInsert = {
    event_id: eventId,
    event_type: eventType,
    provider: 'mercado_pago',
    payload: payload as PaymentEventInsert['payload'],
    signature_valid: signatureValid,
  };
  const { error: auditErr } = await supabase
    .from('payment_events')
    .upsert(insertPayload, { onConflict: 'event_id' });
  if (auditErr) {
    // Audit-first de verdad: sin log no se procesa. 5xx para que MP reintente
    // (el upsert es idempotente por onConflict event_id, así que es seguro).
    return NextResponse.json({ error: 'audit_log_failed' }, { status: 503 });
  }

  if (!signatureValid) {
    await closeEvent({ error: 'invalid_signature' });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Procesar solo eventos de payment.
  const isPayment = eventType.startsWith('payment');
  if (!isPayment) {
    await closeEvent({ derived_status: 'ignored' });
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  // ── Obtener el status AUTORITATIVO ──
  // Mock: se sintetiza desde `_mock`. Real: se CONSULTA a la API de MP (nunca se
  // confía en el status del payload — la notificación real solo trae data.id).
  let mpPaymentId: string;
  let orderId: string;
  let tenantHint: string | null;
  let derived: string;
  let rawStatus: string;

  if (isMockMp) {
    const mock = payload._mock as MockEvent | undefined;
    if (!mock) {
      await closeEvent({ error: 'mock_event_missing' });
      return NextResponse.json({ ok: true, warning: 'mock_event_missing' });
    }
    mpPaymentId = mock.paymentId;
    orderId = mock.orderId;
    tenantHint = mock.tenantId;
    rawStatus = mock.rawStatus;
    derived = MercadoPago.mapMercadoPagoStatus(mock.rawStatus);
  } else {
    if (!dataId) {
      await closeEvent({ error: 'missing_data_id' });
      return NextResponse.json({ ok: true, warning: 'missing_data_id' });
    }
    const environment = MercadoPago.resolveMercadoPagoEnvironment();
    const fetched = await MercadoPago.fetchMercadoPagoPayment(environment, dataId);
    if (!fetched.ok) {
      const fetchStatus = fetched.error.status ?? 502;
      await closeEvent({ error: `fetch_failed:${fetched.error.code}:${fetchStatus}` });
      // < 500 → permanente (404 pago inexistente, etc.): responder TERMINAL (200)
      // para que MP DEJE de reintentar y no spamee el audit log. ≥ 500 →
      // transitorio: responder 5xx para que MP reintente.
      if (fetchStatus < 500) {
        return NextResponse.json({
          ok: true,
          warning: 'payment_fetch_terminal',
          code: fetched.error.code,
        });
      }
      return NextResponse.json(
        { error: 'No se pudo consultar el pago en MP', code: fetched.error.code },
        { status: fetchStatus },
      );
    }
    mpPaymentId = fetched.data.mpPaymentId;
    orderId = fetched.data.orderId;
    tenantHint = fetched.data.tenantId;
    rawStatus = fetched.data.rawStatus;
    derived = fetched.data.status;
  }

  // ── Match contra la orden ──
  const { data: order } = await supabase
    .from('orders')
    .select('id, tenant_id, payment_status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    await closeEvent({ derived_status: derived, error: 'order_not_found' });
    return NextResponse.json({ ok: true, warning: 'order_not_found' });
  }

  const orderRow = order as { id: string; tenant_id: string | null; payment_status: string };
  const allowedSources = ALLOWED_SOURCE_STATES[derived];

  // ── Marca idempotente del estado de pago ──
  // El `.in('payment_status', allowedSources)` hace el UPDATE atómico y
  // condicional: la transición ocurre una sola vez aunque MP reenvíe.
  let applied = false;
  if (allowedSources?.includes(orderRow.payment_status)) {
    try {
      const { data: updated, error: updateErr } = await supabase
        .from('orders')
        .update({
          payment_status: derived,
          mp_payment_id: mpPaymentId,
          payment_method: 'mercado_pago',
          payment_ref: mpPaymentId,
        })
        .eq('id', orderRow.id)
        .in('payment_status', allowedSources as string[])
        .select('id');

      if (updateErr) {
        // 23505 = unique_violation en orders.mp_payment_id: este pago YA se aplicó
        // (otra entrega del mismo webhook). Es idempotente, NO un error → 200.
        if (updateErr.code === '23505') {
          await closeEvent({
            order_id: orderRow.id,
            tenant_id: orderRow.tenant_id ?? tenantHint,
            derived_status: derived,
            error: 'duplicate_payment_idempotent',
          });
          return NextResponse.json({
            ok: true,
            orderId: orderRow.id,
            status: derived,
            applied: false,
          });
        }
        // Error real de DB: 5xx para que MP reintente.
        await closeEvent({
          order_id: orderRow.id,
          tenant_id: orderRow.tenant_id ?? tenantHint,
          derived_status: derived,
          error: `update_failed:${updateErr.code}`,
        });
        return NextResponse.json({ error: 'DB update falló' }, { status: 500 });
      }

      applied = (updated?.length ?? 0) > 0;
    } catch (e) {
      // Red de seguridad: cualquier excepción de unicidad/transitoria → idempotente.
      const code = (e as { code?: string })?.code;
      if (code === '23505') {
        await closeEvent({
          order_id: orderRow.id,
          tenant_id: orderRow.tenant_id ?? tenantHint,
          derived_status: derived,
          error: 'duplicate_payment_idempotent',
        });
        return NextResponse.json({
          ok: true,
          orderId: orderRow.id,
          status: derived,
          applied: false,
        });
      }
      await closeEvent({
        order_id: orderRow.id,
        tenant_id: orderRow.tenant_id ?? tenantHint,
        derived_status: derived,
        error: 'update_exception',
      });
      return NextResponse.json({ error: 'DB update excepción' }, { status: 500 });
    }
  }

  await closeEvent({
    order_id: orderRow.id,
    tenant_id: orderRow.tenant_id ?? tenantHint,
    derived_status: derived,
  });

  return NextResponse.json({
    ok: true,
    orderId: orderRow.id,
    status: derived,
    rawStatus,
    applied,
  });
}
