import { Card } from '@lidxi/ui';

/**
 * Pantalla de PIN. Implementación funcional pendiente: el formulario debe
 * postear al endpoint /api/auth/pin (también pendiente), que verifica el PIN
 * contra employees.pin_hash, firma un JWT con @lidxi/db/auth y lo guarda en
 * la cookie httpOnly `lidxi-session`.
 */
export default function LoginPage() {
  return (
    <Card padding="lg" className="w-[360px] text-center">
      <h1 className="text-xl font-semibold text-ink">LidxiOS</h1>
      <p className="mt-1 text-sm text-ink-300">Ingresa tu PIN para iniciar sesión.</p>
      <div className="mt-6 font-mono text-2xl tracking-[0.5em] text-ink-400">• • • •</div>
      <p className="mt-6 text-xs text-ink-400">
        Pantalla de login en construcción. Por ahora setea manualmente la cookie
        <code className="mx-1 rounded bg-canvas px-1 py-0.5 font-mono">lidxi-session</code>
        con un JWT válido para entrar.
      </p>
    </Card>
  );
}
