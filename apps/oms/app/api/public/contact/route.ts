import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  source: z.string().optional(),
});

// In-memory rate limiting (3 envíos/hora por IP)
// DEUDA TÉCNICA: Mover a Upstash/Redis cuando el backend multi-instance lo requiera.
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const MAX_REQUESTS = 3;
const TIME_WINDOW = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);

    if (userLimit && now - userLimit.timestamp < TIME_WINDOW) {
      if (userLimit.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Has alcanzado el límite de envíos. Intenta más tarde.' },
          { status: 429 },
        );
      }
      userLimit.count += 1;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.format() },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      source: parsed.data.source || 'web_contact_form',
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}
