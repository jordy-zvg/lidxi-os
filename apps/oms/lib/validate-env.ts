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

const REQUIRED_IN_PRODUCTION = ['NEXT_PUBLIC_APP_URL'];

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const list = missing.map((k) => `  • ${k}`).join('\n');
    throw new Error(
      `Faltan variables de entorno críticas:\n${list}\n\nSin ellas, la app no puede arrancar. Revisa tu archivo .env.local o la configuración del servicio (Railway, Vercel, etc.).`,
    );
  }

  // En build (next build) NODE_ENV ya es 'production' pero las env de runtime
  // (Railway) no aplican: validar ahí rompería el build local/CI sin secretos.
  // El chequeo real ocurre al boot del servidor.
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    const missingProd = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
    if (missingProd.length > 0) {
      const list = missingProd.map((k) => `  • ${k}`).join('\n');
      throw new Error(
        `Faltan variables de entorno requeridas en producción:\n${list}\n\nRevisa la configuración del servicio (Railway, Vercel, etc.).`,
      );
    }
  }
}
