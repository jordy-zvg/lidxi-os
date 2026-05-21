import { resolveOriginFromRequest } from '@/lib/supabase/origin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Called after email/password sign-in to determine where to redirect.
function safeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/admin/')) return null;
  return raw;
}

export async function GET(request: NextRequest) {
  // Helper centralizado: headers PRIMERO (no env var, que es susceptible al
  // inlining de NEXT_PUBLIC_* en build-time con valor stale).
  const origin = resolveOriginFromRequest(request);
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get('redirectTo'));
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/ingresar`);
  }

  const { data: rows } = await (
    supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => {
            order: (
              col: string,
              opts: { ascending: boolean },
            ) => Promise<{ data: Array<{ onboarding_completed: boolean }> | null }>;
          };
        };
      };
    }
  )
    .from('user_tenants')
    .select('onboarding_completed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (rows && rows.length > 1) {
    console.warn(
      `[post-login] User ${user.id} has ${rows.length} memberships. Using first by created_at.`,
    );
  }
  const membership = rows?.[0] ?? null;

  if (!membership?.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding/restaurante`);
  }

  return NextResponse.redirect(`${origin}${redirectTo ?? '/admin/inicio'}`);
}
