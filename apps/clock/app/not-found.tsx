import { KobiWordmark } from '@kobi/ui';
import Link from 'next/link';

export const metadata = { title: 'No encontrado' };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
      <KobiWordmark size="md" />
      <p className="mt-3 text-4xl font-semibold text-ink-400 font-mono">404</p>
      <h1 className="mt-6 text-xl font-semibold text-ink">Esta página no existe</h1>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors"
      >
        Volver
      </Link>
    </main>
  );
}
