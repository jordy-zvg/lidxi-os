import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

/**
 * Fuentes del sistema. Las apps inyectan las CSS vars en el <html> del layout
 * raíz para que tokens.css y el preset Tailwind puedan referenciarlas.
 *
 *   <html className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
 *
 * Inter es la cara UI; JetBrains Mono se usa para todo dato numérico
 * (IDs, dinero, timers, SKUs, cantidades, horas). Fraunces es la display serif
 * del marketing (headlines del landing) — clase `font-display`.
 */

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});
