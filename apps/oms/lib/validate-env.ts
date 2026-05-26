/**
 * Validación de variables de entorno críticas al arranque de la app.
 * Se llama desde layout.tsx (root) para garantizar que falte algo, el error
 * es explícito y temprano, no un error obscuro más adelante.
 */

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const list = missing.map((k) => `  • ${k}`).join('\n');
    throw new Error(
      `Faltan variables de entorno críticas:\n${list}\n\nSin ellas, la app no puede arrancar. Revisa tu archivo .env.local o la configuración del servicio (Railway, Vercel, etc.).`,
    );
  }
}
