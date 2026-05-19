'use client';

import { KobiWordmark } from '@kobi/ui';
import { IconMenu2, IconX } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Características', href: '/caracteristicas' },
  { label: 'Para quién', href: '/para-quien' },
  { label: 'Precios', href: '/precios' },
  { label: 'Nosotros', href: '/nosotros' },
];

// Routes where the nav must be solid from the start (forms / dark panels).
const SOLID_NAV_ROUTES = [
  '/registro',
  '/ingresar',
  '/contacto',
  '/recuperar',
  '/auth/reset-password',
];

function isSolidRoute(pathname: string): boolean {
  if (!pathname) return false;
  return SOLID_NAV_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function MarketingNav() {
  const pathname = usePathname() ?? '';
  const solidRoute = isSolidRoute(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (solidRoute) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solidRoute]);

  const solid = solidRoute || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200 ${
        solid
          ? solidRoute
            ? 'border-b border-ink/10 bg-canvas'
            : 'border-b border-ink/10 bg-white/80 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <KobiWordmark size="sm" variant="light" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href as Route}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/ingresar"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4f48d9] active:scale-95"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-2 text-ink/70 transition-colors hover:text-ink md:hidden"
          aria-label="Menú"
        >
          {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-ink/10 bg-canvas px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href as Route}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-ink/10 pt-4">
            <Link
              href="/ingresar"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg bg-[#635BFF] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#4f48d9]"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
