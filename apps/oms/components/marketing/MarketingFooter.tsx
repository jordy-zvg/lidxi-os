import { KobiWordmark } from '@kobi/ui';
import type { Route } from 'next';
import Link from 'next/link';

const FOOTER_LINKS = {
  Producto: [
    { label: 'Características', href: '/caracteristicas' },
    { label: 'Precios', href: '/precios' },
    { label: 'Integraciones', href: '/integraciones' },
    { label: 'Cambios', href: '/changelog' },
  ],
  Empresa: [
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Contacto', href: '/contacto' },
    { label: 'Trabaja con nosotros', href: '/empleos' },
    { label: 'Prensa', href: '/prensa' },
  ],
  Legal: [
    { label: 'Términos', href: '/terminos' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Aviso de privacidad', href: '/aviso-privacidad' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[#0A2540] text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <KobiWordmark size="sm" variant="dark" />
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              El sistema operativo de la cocina moderna. Conecta tu POS, tus marketplaces y tu
              cocina en una sola plataforma.
            </p>
            <p className="text-xs text-white/40">ventas@kobi.mx</p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as Route}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">© 2026 Kobi · Hecho en Ciudad de México</p>
          <div className="flex items-center gap-4">
            {/* Social placeholders */}
            {['LinkedIn', 'X', 'Instagram', 'YouTube'].map((name) => (
              <span key={name} className="text-xs text-white/30">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
