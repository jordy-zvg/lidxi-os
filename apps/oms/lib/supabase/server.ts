import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server client for Server Components, Route Handlers and Server Actions
export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (err) {
            // "Cookies can only be modified..." error en Server Components read-only.
            // Loguear y continuar — si la cookie es crítica, la siguiente request
            // detectará la falta de sesión.
            if (err instanceof Error && err.message.includes('Cookies can only be modified')) {
              console.warn('[Supabase SSR] No se pudo actualizar cookies en contexto read-only');
            } else {
              throw err;
            }
          }
        },
      },
    },
  );
};
