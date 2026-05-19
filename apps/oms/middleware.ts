import { createClient } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { supabase, response } = createClient(req, res);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  // Zona 1: Panel Administrativo (Supabase Session)
  if (path.startsWith('/admin')) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/ingresar';
      url.search = '';
      url.searchParams.set('redirectTo', path);
      return NextResponse.redirect(url);
    }

    // /admin/sin-acceso es accesible para cualquier sesión válida (página 403).
    if (path === '/admin/sin-acceso') {
      return response;
    }

    // Validación de permisos admin
    const { data: userTenants } = await supabase
      .from('user_tenants')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userTenants || !['owner', 'admin'].includes(userTenants.role)) {
      return NextResponse.redirect(new URL('/admin/sin-acceso', req.url));
    }
    return response;
  }

  // Zona 2: Onboarding (Supabase Session)
  if (path.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/ingresar', req.url));
    }
    return response;
  }

  // Zona 3: Operación (JWT con PIN - sin bridge de sesión)
  const opPaths = ['/pedidos', '/pos', '/kds', '/caja'];
  if (opPaths.some((p) => path.startsWith(p))) {
    // Aquí validamos la cookie de empleado (el token JWT)
    const empToken = req.cookies.get('kobi_op_token');
    if (!empToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return response;
  }

  return response;
}
