import { inter, jetbrainsMono } from '@kobi/tokens/fonts';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

// URL pública canónica de la app: leer de env para no requerir refactor al
// migrar de *.up.railway.app → kobi.mx (basta con cambiar la env var).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
  themeColor: '#635BFF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
