import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Called after email/password sign-in to determine where to redirect.
// Checks onboarding_completed and routes accordingly.
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
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

  const { data: membership } = await (
    supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (
            col: string,
            val: string,
          ) => {
            single: () => Promise<{ data: { onboarding_completed: boolean } | null }>;
          };
        };
      };
    }
  )
    .from('user_tenants')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  if (!membership?.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding/restaurante`);
  }

  // Onboarding complete — send to admin dashboard (Supabase auth zone).
  return NextResponse.redirect(`${origin}/admin/inicio`);
}
