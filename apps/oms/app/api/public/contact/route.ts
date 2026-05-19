import { createSupabaseServiceClient } from '@kobi/db';
import { NextResponse } from 'next/server';

interface ContactPayload {
  nombre: string;
  email: string;
  telefono?: string;
  empresa: string;
  tipo: string;
  mensaje: string;
  acepto: boolean;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// TODO: conectar a tabla contact_messages cuando Fase 3 cree la migration
// TODO: disparar notificación por email vía Resend o similar
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const payload = body as Partial<ContactPayload>;

  // Server-side validation
  if (!payload.nombre?.trim()) {
    return NextResponse.json({ error: 'nombre requerido' }, { status: 422 });
  }
  if (!payload.email?.trim() || !isValidEmail(payload.email)) {
    return NextResponse.json({ error: 'email inválido' }, { status: 422 });
  }
  if (!payload.empresa?.trim()) {
    return NextResponse.json({ error: 'empresa requerida' }, { status: 422 });
  }
  if (!payload.tipo?.trim()) {
    return NextResponse.json({ error: 'tipo requerido' }, { status: 422 });
  }
  if (!payload.mensaje?.trim() || payload.mensaje.trim().length < 20) {
    return NextResponse.json({ error: 'mensaje muy corto' }, { status: 422 });
  }
  if (!payload.acepto) {
    return NextResponse.json({ error: 'debe aceptar los términos' }, { status: 422 });
  }

  // Persist to contact_messages — requires migration 20260518000001_multi_tenant.sql
  // Degrades gracefully if table doesn't exist yet (migration pending)
  try {
    const supabase = createSupabaseServiceClient();
    await (
      supabase as unknown as {
        from: (table: string) => {
          insert: (row: Record<string, unknown>) => Promise<unknown>;
        };
      }
    )
      .from('contact_messages')
      .insert({
        name: payload.nombre,
        email: payload.email,
        phone: payload.telefono ?? null,
        company: payload.empresa,
        type: payload.tipo,
        message: payload.mensaje,
      });
  } catch {}

  return NextResponse.json({ ok: true });
}
