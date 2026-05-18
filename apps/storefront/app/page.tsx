/**
 * Landing genérica de Kobi (cuando la app se sirve sin un dominio de cliente
 * mapeado). En producción esto vive en kobi.com.mx y es sustituido por la
 * página de marketing.
 */
export default function RootLandingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold">Kobi</h1>
      <p className="mt-2 text-ink-300">
        El sistema operativo de la cocina moderna. Cada cliente vive en su propio dominio (ej.
        miztli.mx) o en /[restaurantSlug] dentro de esta app.
      </p>
    </main>
  );
}
