import { inter, jetbrainsMono } from '@lidxi/tokens/fonts';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kobi',
  description: 'El sistema operativo de la cocina moderna',
  icons: { icon: '/brand/kobi-mark.svg', apple: '/brand/apple-touch-icon.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
