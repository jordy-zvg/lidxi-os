import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Aviso de privacidad' };

export default function AvisoPrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
      <h1
        className="mb-6 text-3xl font-semibold text-[#0A2540]"
        style={{ letterSpacing: '-0.02em' }}
      >
        Aviso de privacidad
      </h1>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <p className="font-medium mb-2">En proceso de redacción</p>
        <p className="leading-relaxed">
          Este aviso está siendo redactado por nuestro equipo legal conforme a la LFPDPPP. La
          versión definitiva estará disponible antes del lanzamiento público.
        </p>
        <p className="mt-3 leading-relaxed">
          Para consultas urgentes, escríbenos a{' '}
          <a href="mailto:legal@kobi.com.mx" className="font-medium underline">
            legal@kobi.com.mx
          </a>{' '}
          y te respondemos en menos de 48 horas.
        </p>
      </div>
      <p className="mt-8 text-sm text-ink/40">Última actualización: próximamente.</p>
    </div>
  );
}
