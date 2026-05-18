import { KobiWordmark } from '@kobi/ui';

/**
 * Landing genérica de Kobi (cuando la app se sirve sin un dominio de cliente
 * mapeado). En producción esto vive en kobi.com.mx y es sustituido por la
 * página de marketing.
 */
export default function RootLandingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <KobiWordmark size="lg" withTagline />
      <p className="mt-6 text-ink-300">
        Cada cliente vive en su propio dominio (ej. miztli.mx) o en /[restaurantSlug] dentro de esta
        app.
      </p>
    </main>
  );
}
