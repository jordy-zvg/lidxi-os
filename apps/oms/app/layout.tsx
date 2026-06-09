import { validateEnv } from '@/lib/validate-env';
import { fraunces, inter, jetbrainsMono } from '@kobi/tokens/fonts';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

validateEnv();

// URL pública canónica de la app: leer de env para no requerir refactor al
// migrar de *.up.railway.app → kobi.mx (basta con cambiar la env var).
// En producción la env var es OBLIGATORIA: sin ella, OG tags y metadataBase
// apuntarían a localhost en builds desplegados — un bug sutil con impacto en
// SEO/social previews. El build falla explícitamente para evitarlo.
function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXT_PUBLIC_APP_URL es requerida en producción. ' +
          'Sin ella, los Open Graph tags y metadataBase apuntarían a localhost. ' +
          'Configúrala en las variables de entorno del servicio (Railway).',
      );
    }
    return 'http://localhost:3000';
  }
  return url;
}

const APP_URL = getAppUrl();

export const metadata: Metadata = {
  title: { default: 'Kobi', template: '%s · Kobi' },
  description: 'El sistema operativo de la cocina moderna',
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Kobi',
    description: 'El sistema operativo de la cocina moderna',
    url: APP_URL,
    siteName: 'Kobi',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#7C71FF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
