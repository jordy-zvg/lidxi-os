import { createClient } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { supabase, response } = createClient(req, res);

  // getUser() valida el JWT contra Supabase Auth server (firma + expiración).
  // getSession() solo decodifica la cookie sin verificarla — un atacante con
  // cookie manipulada pasaría. Sprint 8 Fase 4: migrado a getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  // Zona 1: Panel Administrativo (Supabase Session)
  if (path.startsWith('/admin')) {
    if (!user) {
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

    // Validación de permisos admin (defensiva: si hay múltiples memberships,
    // tomamos la primera por created_at ASC para no reventar).
    const { data: rows } = await supabase
      .from('user_tenants')
      .select('role, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const userTenants = rows?.[0] ?? null;
    if (rows && rows.length > 1) {
      console.warn(
        `[middleware.admin-guard] User ${user.id} has ${rows.length} memberships. Using first by created_at.`,
      );
    }

    if (!userTenants || !['owner', 'admin'].includes(userTenants.role)) {
      return NextResponse.redirect(new URL('/admin/sin-acceso', req.url));
    }
    return response;
  }

  // Zona 2: Onboarding (Supabase Session)
  if (path.startsWith('/onboarding')) {
    if (!user) {
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
