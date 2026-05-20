import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Called after email/password sign-in to determine where to redirect.
function safeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/admin/')) return null;
  return raw;
}

// Resolve the public origin honoring proxy headers (Cloudflare tunnel, Vercel, etc.)
// to avoid leaking the internal hostname (`localhost:3000`) in Location headers.
function resolveOrigin(request: NextRequest): string {
  const envOverride = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envOverride && /^https?:\/\//.test(envOverride)) return envOverride;

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = forwardedHost ?? request.headers.get('host');
  if (host) {
    const proto = forwardedProto ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
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
