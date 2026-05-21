import { resolveOriginFromRequest } from '@/lib/supabase/origin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Handles Supabase email confirmation redirect.
// Supabase sends user here with ?code=... after clicking the email link.
export async function GET(request: NextRequest) {
  // Importante: no usar `new URL(request.url).origin` directo — detrás del
  // proxy de Railway eso puede reportar `localhost:3000` (host interno).
  // resolveOriginFromRequest prioriza x-forwarded-host del proxy.
  const origin = resolveOriginFromRequest(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding/restaurante';

  if (!code) {
    return NextResponse.redirect(`${origin}/ingresar?error=missing_code`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/ingresar?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
