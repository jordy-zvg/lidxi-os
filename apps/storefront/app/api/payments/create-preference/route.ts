import { buildMercadoPagoClient } from '@/lib/mercado-pago';
import { createSupabaseServiceClient } from '@kobi/db';
import { Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const itemSchema = z.object({
  title: z.string().min(1).max(120),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

const bodySchema = z.object({
  orderId: z.string().uuid(),
  tenantId: z.string().uuid(),
  items: z.array(itemSchema).min(1),
  total: z.number().positive(),
  payerEmail: z.string().email(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Body inválido', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { orderId, tenantId, items, payerEmail } = parsed.data;
  const supabase = createSupabaseServiceClient();

  // Resolver modo del tenant: 'test' o 'production'.
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('payment_mode')
    .eq('id', tenantId)
    .maybeSingle();

  if (tenantErr || !tenant) {
    return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
  }

  const mode = (
    (tenant as { payment_mode: string }).payment_mode === 'production' ? 'production' : 'test'
  ) as 'test' | 'production';

  const client = buildMercadoPagoClient(mode);
  if (!client) {
    return NextResponse.json(
      { error: `Mercado Pago no configurado para modo ${mode}` },
      { status: 503 },
    );
  }

  // Self-reference: cada app usa NEXT_PUBLIC_APP_URL para apuntar a sí misma.
  // En storefront, esta var debe apuntar al hostname público del storefront.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        external_reference: orderId,
        payer: { email: payerEmail },
        items: items.map((it, i) => ({
          id: `${orderId}-${i}`,
          title: it.title,
          quantity: it.quantity,
          unit_price: it.unit_price,
          currency_id: 'MXN',
        })),
        back_urls: {
          success: `${appUrl}/pago/exito?orderId=${orderId}`,
          failure: `${appUrl}/pago/error?orderId=${orderId}`,
          pending: `${appUrl}/pago/pendiente?orderId=${orderId}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_OMS_URL ?? 'http://localhost:3000'}/api/webhooks/mercado-pago`,
        metadata: { tenant_id: tenantId, mode },
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: mode === 'production' ? result.init_point : result.sandbox_init_point,
    });
  } catch (err) {
    console.error('[create-preference] MP error:', err);
    return NextResponse.json({ error: 'No se pudo crear la preference' }, { status: 502 });
  }
}
