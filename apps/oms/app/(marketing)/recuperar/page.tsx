import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RecuperarForm } from './RecuperarForm';

export const metadata = { title: 'Recuperar contraseña · Kobi' };

export default async function RecuperarPage() {
  // H15: si hay sesión activa, redirigir al panel — no exponer el form de recovery.
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/admin/inicio');
  }
  return <RecuperarForm />;
}
