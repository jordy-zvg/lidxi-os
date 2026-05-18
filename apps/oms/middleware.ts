import { verifyEmployeeJWT } from '@kobi/db/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth gating del OMS.
 *
 * Capas:
 *   1. Rutas de marketing (landing público) → siempre públicas.
 *   2. Rutas de auth de empleados (/login) → públicas.
 *   3. Todo lo demás → requiere cookie `kobi-session` con JWT de empleado válido.
 *
 * La auth de tenant admins (Supabase user auth) se añade en Fase 3.
 */

const PUBLIC_PREFIXES = [
  // Marketing / landing público
  '/',
  '/caracteristicas',
  '/para-quien',
  '/precios',
  '/nosotros',
  '/contacto',
  '/ingresar',
  '/registro',
  '/onboarding',
  '/terminos',
  '/privacidad',
  '/cookies',
  '/aviso-privacidad',
  // Auth de empleados (existente)
  '/login',
  // Internos de Next.js y assets
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

  // Permitir raíz exacta y prefijos públicos
  if (pathname === '/' || PUBLIC_PREFIXES.some((p) => p !== '/' && pathname.startsWith(p))) {
    return NextResponse.next();
  }

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
