import { verifyEmployeeJWT } from '@kobi/db/auth';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth gating del OMS — tres zonas:
 *
 *   PÚBLICA       — Marketing landing, auth pages, assets.
 *                   Acceso libre sin sesión.
 *
 *   ONBOARDING    — /onboarding/*
 *                   Requiere sesión Supabase (tenant admin).
 *                   Si no hay sesión → /ingresar.
 *
 *   OMS           — Todo lo demás (/pedidos, /pos, /kds, …)
 *                   Requiere kobi-session JWT (empleado PIN) — capa existente.
 *                   Si no hay sesión → /login.
 */

const PUBLIC_PREFIXES = [
  '/',
  '/caracteristicas',
  '/para-quien',
  '/precios',
  '/nosotros',
  '/contacto',
  '/ingresar',
  '/registro',
  '/recuperar',
  '/auth',
  '/terminos',
  '/privacidad',
  '/cookies',
  '/aviso-privacidad',
  '/login',
  '/_next',
  '/favicon',
  '/api/auth',
  '/api/public',
];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── ZONA PÚBLICA ──────────────────────────────────────────────────────────
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ── ZONA ADMIN / ONBOARDING (Supabase tenant auth) ──────────────────────
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/admin')) {
    return handleAdminAuth(req);
  }

  // ── ZONA OMS (employee PIN JWT) ───────────────────────────────────────────
  return handleOmsAuth(req);
}

function isPublic(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => p !== '/' && pathname.startsWith(p));
}

async function handleAdminAuth(req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/ingresar', req.url));
  }

  return response;
}

async function handleOmsAuth(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get('kobi-session')?.value;
  if (!token) return redirectToLogin(req);

  try {
    await verifyEmployeeJWT(token);
    return NextResponse.next();
  } catch {
    return redirectToLogin(req);
  }
}

const redirectToLogin = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(url);
};
