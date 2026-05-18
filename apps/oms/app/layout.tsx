import { inter, jetbrainsMono } from '@kobi/tokens/fonts';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Kobi', template: '%s · Kobi' },
  description: 'El sistema operativo de la cocina moderna',
  metadataBase: new URL('https://kobi.com.mx'),
  openGraph: {
    title: 'Kobi',
    description: 'El sistema operativo de la cocina moderna',
    url: 'https://kobi.com.mx',
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
