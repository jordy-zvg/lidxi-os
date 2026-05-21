'use server';

import { resolveSingleMembership } from './membership';
import { resolveRequestOrigin } from './origin';
import { createSupabaseServerClient } from './server';

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResult> {
  const supabase = createSupabaseServerClient();
  const origin = resolveRequestOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    if (error.message.includes('already registered')) {
      return { ok: false, error: 'Este correo ya tiene una cuenta. Inicia sesión.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { ok: false, error: 'Confirma tu correo antes de ingresar. Revisa tu bandeja.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signInWithGoogle(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const supabase = createSupabaseServerClient();
  const origin = resolveRequestOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error || !data.url) {
    return { ok: false, error: error?.message ?? 'Error al iniciar con Google' };
  }
  return { ok: true, url: data.url };
}

export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  const supabase = createSupabaseServerClient();
  const origin = resolveRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resendConfirmationEmail(email: string): Promise<AuthResult> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Returns the tenant's onboarding status for the current user
export async function getTenantOnboardingStatus(): Promise<{
  onboarding_completed: boolean;
  tenant_id: string | null;
} | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from('user_tenants')
    .select('tenant_id, onboarding_completed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const data = resolveSingleMembership(rows, 'auth-actions.getTenantOnboardingStatus', user.id);
  if (!data) return null;
  return {
    onboarding_completed: data.onboarding_completed,
    tenant_id: data.tenant_id,
  };
}
