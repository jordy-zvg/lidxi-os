import { verifyEmployeeJWT } from '@lidxi/db/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth gating del OMS.
 *
 *   • Rutas dentro de `(auth)` (ej: /login) son públicas.
 *   • Cualquier otra ruta requiere cookie `lidxi-session` con un JWT válido
 *     firmado por nuestro JWT_SECRET (ver @lidxi/db/auth).
 *
 * Cuando la sesión es inválida o falta, redirigimos a /login con `?next=`
 * para regresar al destino original tras autenticar.
 */

const PUBLIC_PREFIXES = ['/login', '/_next', '/favicon', '/api/auth'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('lidxi-session')?.value;
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
