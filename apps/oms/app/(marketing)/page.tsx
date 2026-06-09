'use client';

import { FAQ } from '@/components/marketing';
import { MiztliPOSMockup } from '@/components/marketing/MiztliPOSMockup';
import { SavingsCalculator } from '@/components/marketing/SavingsCalculator';
import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

// ───────────────────────────────────────────────────────────────────────────
// Helpers de presentación (paleta cálida del home v4 — ver tokens --mkt-*)
// ───────────────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98]';
const BTN_PRIMARY = `${BTN_BASE} bg-brand text-white shadow-sm hover:bg-brand-hover hover:-translate-y-0.5`;
const BTN_GHOST = `${BTN_BASE} border border-[var(--mkt-line)] text-[var(--mkt-ink)] hover:border-[var(--mkt-ink-soft)] hover:-translate-y-0.5`;
const BTN_DARK = `${BTN_BASE} bg-[var(--mkt-ink)] text-[var(--cream)] hover:bg-[var(--espresso-2)]`;
const BTN_SM = 'px-[22px] py-[11px] text-[15px]';
const BTN_LG = 'px-[30px] py-[15px] text-base';

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({
  eyebrow,
  eyebrowClass = 'text-[var(--terra)]',
  children,
  sub,
}: {
  eyebrow: string;
  eyebrowClass?: string;
  children: ReactNode;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-[660px] text-center">
      <span
        className={`mb-4 inline-block text-[12.5px] font-bold uppercase tracking-[0.1em] ${eyebrowClass}`}
      >
        {eyebrow}
      </span>
      <h2 className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-[var(--mkt-ink)] sm:text-[44px]">
        {children}
      </h2>
      {sub && (
        <p className="mt-4 text-[17.5px] leading-relaxed text-[var(--mkt-ink-soft)]">{sub}</p>
      )}
    </Reveal>
  );
}

const Em = ({ children }: { children: ReactNode }) => (
  <em className="font-medium text-brand">{children}</em>
);

const Check = () => <span className="mt-0.5 shrink-0 font-bold text-[var(--mkt-ok)]">✓</span>;

// ───────────────────────────────────────────────────────────────────────────
// Data
// ───────────────────────────────────────────────────────────────────────────

const CHANNELS = [
  { label: 'Uber Eats', dot: '#06C167', own: false },
  { label: 'Rappi', dot: '#FF441F', own: false },
  { label: 'Didi Food', dot: '#FF8000', own: false },
  { label: 'Tu tienda · 1.5%', dot: 'var(--brand)', own: true },
  { label: 'Mostrador', dot: '#8B8378', own: false },
];

const STEPS = [
  {
    num: '01',
    title: 'Recibe de todos lados',
    desc: 'Los pedidos de tu tienda, de Uber Eats, Rappi y Didi, y de mostrador caen en una sola pantalla.',
  },
  {
    num: '02',
    title: 'Prepara y despacha',
    desc: 'La cocina ve cada comanda al instante. ¿Es a domicilio? Pides un repartidor de Uber Direct con un clic.',
  },
  {
    num: '03',
    title: 'Cobra y cuadra',
    desc: 'Cobras en efectivo o tarjeta y cierras tu caja con arqueo real, billete por billete, al final del turno.',
  },
];

type FeatTag = 'ready' | 'soon' | 'vision';
const TAG_LABEL: Record<FeatTag, string> = { ready: 'Listo', soon: 'Pronto', vision: 'En camino' };
const TAG_CLASS: Record<FeatTag, string> = {
  ready: 'bg-[var(--mkt-ok-soft)] text-[var(--mkt-ok)]',
  soon: 'bg-brand-soft text-brand',
  vision: 'bg-[var(--terra-soft)] text-[var(--terra)]',
};

const FEATURES: { icon: string; title: string; desc: string; tag: FeatTag }[] = [
  {
    icon: '🧾',
    title: 'Punto de venta',
    desc: 'Mostrador, para llevar o a domicilio. Cobro en efectivo y tarjeta con cálculo de cambio.',
    tag: 'ready',
  },
  {
    icon: '🏪',
    title: 'Tu tienda propia',
    desc: 'Tu sitio de pedidos con tu marca. Comisión de solo 1.5% y nada de cargos a tu cliente.',
    tag: 'ready',
  },
  {
    icon: '🛵',
    title: 'Despacho Uber Direct',
    desc: 'Repartidores a demanda sin tener flota. Pagas solo los viajes que usas.',
    tag: 'ready',
  },
  {
    icon: '📺',
    title: 'Pantalla de cocina',
    desc: 'Comandas digitales en tiempo real. Sin papelitos, sin errores, sin gritos.',
    tag: 'ready',
  },
  {
    icon: '💵',
    title: 'Caja con arqueo',
    desc: 'Fondo inicial, conteo por denominación y diferencia automática al cierre del turno.',
    tag: 'ready',
  },
  {
    icon: '🔌',
    title: 'Marketplaces conectados',
    desc: 'Uber Eats, Rappi y Didi centralizados en tu misma pantalla de pedidos.',
    tag: 'ready',
  },
  {
    icon: '🔁',
    title: 'Clientes que vuelven',
    desc: 'Quién te pide, qué pide y cada cuánto. Conoce a tus mejores clientes.',
    tag: 'soon',
  },
  {
    icon: '🎟️',
    title: 'Cupones y promos',
    desc: 'Descuentos para atraer pedidos directos y premiar a quienes repiten.',
    tag: 'soon',
  },
  {
    icon: '🤖',
    title: 'Atención con IA',
    desc: 'Un agente que responde y toma pedidos por WhatsApp 24/7, sin que estés pendiente.',
    tag: 'vision',
  },
];

const KOBI_ITEMS = [
  'POS completo con tipos de pedido',
  'KDS — pantalla de cocina',
  'Marketplaces conectados (Uber/Rappi/Didi)',
  'Tienda propia · 1.5% — sin cargo al cliente',
  'Despacho Uber Direct',
  'Caja con arqueo real',
  'Usuarios ilimitados',
];

type FudoItem = { label: string; kind: 'ok' | 'extra'; tag?: string };
const FUDO_ITEMS: FudoItem[] = [
  { label: 'POS base (Avanzado $690)', kind: 'ok' },
  { label: 'KDS — módulo aparte', kind: 'extra', tag: '+$200' },
  { label: 'Delivery Apps — módulo aparte', kind: 'extra', tag: '+$200' },
  { label: 'Tienda online · 1.9% + $10 al cliente', kind: 'extra', tag: 'por venta' },
  { label: 'Uber Direct (incluido en tienda)', kind: 'ok' },
  { label: 'Caja con arqueo', kind: 'ok' },
  { label: 'Usuarios ilimitados', kind: 'ok' },
];

type Plan = {
  name: string;
  for: string;
  price: string;
  featured?: boolean;
  badge?: string;
  cta: { label: string; href: Route };
  features: { text: string; strong?: boolean }[];
};
const PLANS: Plan[] = [
  {
    name: 'Arranque',
    for: 'Para cocinas que empiezan',
    price: '399',
    cta: { label: 'Empezar gratis', href: '/registro' as Route },
    features: [
      { text: 'Punto de venta completo' },
      { text: 'Tu tienda propia de pedidos' },
      { text: 'Despacho con Uber Direct' },
      { text: 'Pantalla de cocina (KDS)' },
      { text: 'Caja con arqueo' },
      { text: 'Hasta 3 usuarios' },
    ],
  },
  {
    name: 'Profesional',
    for: 'Para el dark kitchen en crecimiento',
    price: '699',
    featured: true,
    badge: 'El favorito de las cocinas',
    cta: { label: 'Empezar gratis', href: '/registro' as Route },
    features: [
      { text: 'Todo lo de Arranque, más:', strong: true },
      { text: 'Marketplaces conectados (Uber/Rappi/Didi)' },
      { text: 'Inventario por receta' },
      { text: 'Reportes avanzados' },
      { text: 'Clientes y promociones' },
      { text: 'Usuarios ilimitados' },
      { text: 'Soporte prioritario' },
    ],
  },
  {
    name: 'Escala',
    for: 'Para varias sucursales',
    price: '1,199',
    cta: { label: 'Hablar con nosotros', href: '/contacto' as Route },
    features: [
      { text: 'Todo lo de Profesional, más:', strong: true },
      { text: 'Multi-sucursal' },
      { text: 'Reportes consolidados' },
      { text: 'Facturación electrónica' },
      { text: 'Soporte dedicado' },
      { text: 'Onboarding asistido' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: '¿Me ayudan a migrar desde mi sistema actual?',
    answer:
      'Sí. Si hoy usas Wansoft, Soft Restaurant u otro sistema, te acompañamos a cargar tu menú y dejar todo listo para operar. La mayoría de las cocinas arranca el mismo día.',
  },
  {
    question: '¿Necesito instalar algo o comprar hardware?',
    answer:
      'No. Kobi funciona en el navegador de cualquier computadora, tablet o teléfono. Si ya tienes impresora de tickets, la conectamos.',
  },
  {
    question: '¿Qué pasa con mis ventas de Uber Eats y Rappi?',
    answer:
      'Siguen igual — solo que ahora las ves y gestionas desde Kobi, junto con las de tu tienda propia y mostrador. Todos tus canales en una sola pantalla.',
  },
  {
    question: '¿Cómo funciona la comisión del 1.5%?',
    answer:
      'Aplica únicamente a las ventas de tu tienda propia Kobi — muy por debajo del 25–30% que cobran los marketplaces. Las ventas de mostrador y las de las apps no pagan comisión a Kobi.',
  },
  {
    question: '¿Hay permanencia o contratos forzosos?',
    answer:
      'No. Pagas mes a mes y puedes cancelar cuando quieras. Si pagas semestral o anual, obtienes descuento — pero nunca te amarramos.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-[var(--cream)] text-[var(--mkt-ink)]">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <header className="relative px-6 pt-[158px] pb-[70px]">
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[600px] w-[1100px] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse 50% 45% at 50% 25%, rgba(99,91,255,0.09), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-[880px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
            className="mb-[30px] inline-flex items-center gap-[9px] rounded-full border border-[var(--mkt-line)] bg-surface px-[17px] py-2 text-[13.5px] font-semibold text-[var(--mkt-ink-soft)] shadow-sm"
          >
            <span className="relative h-[7px] w-[7px] rounded-full bg-[var(--mkt-ok)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--mkt-ok)]" />
            </span>
            Para dark kitchens y restaurantes con delivery
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="font-display text-[42px] font-semibold leading-[1.04] tracking-tight sm:text-[64px] lg:text-[80px]"
          >
            Tu cocina, tus pedidos,
            <br />
            <Em>tus ganancias.</Em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.28 }}
            className="mx-auto mt-[26px] max-w-[600px] text-[17px] leading-relaxed text-[var(--mkt-ink-soft)] sm:text-[20px]"
          >
            Todos tus canales de venta —marketplaces, tu propia tienda y mostrador— en una sola
            pantalla. Sin módulos sueltos, sin sorpresas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
            className="mt-9 flex flex-wrap justify-center gap-[14px]"
          >
            <Link href={'/registro' as Route} className={`${BTN_PRIMARY} ${BTN_LG}`}>
              Empieza gratis
            </Link>
            <a href="#como" className={`${BTN_GHOST} ${BTN_LG}`}>
              Ver cómo funciona
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            className="mt-[22px] flex flex-wrap justify-center gap-[22px]"
          >
            {['Sin tarjeta para probar', 'Sin permanencia', 'Te acompañamos al arrancar'].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-[7px] text-[13.5px] font-medium text-[var(--mkt-muted)]"
                >
                  <span className="text-[var(--mkt-ok)]">✓</span>
                  {item}
                </span>
              ),
            )}
          </motion.div>

          {/* Channels */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.62 }}
            className="mt-[70px]"
          >
            <div className="flex flex-wrap justify-center gap-[11px]">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.label}
                  className={`inline-flex items-center gap-[9px] rounded-full border px-[19px] py-[11px] text-[15px] font-semibold shadow-sm ${
                    ch.own
                      ? 'border-[#d9d6ff] bg-brand-soft text-brand'
                      : 'border-[var(--mkt-line)] bg-surface text-[var(--mkt-ink-soft)]'
                  }`}
                >
                  <span
                    className="h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: ch.dot }}
                  />
                  {ch.label}
                </div>
              ))}
            </div>
            <div className="my-5 flex flex-col items-center gap-1.5">
              <span className="h-4 w-0.5 rounded-full bg-[var(--mkt-line)]" />
              <span className="h-4 w-0.5 rounded-full bg-[#cfc5b4]" />
              <span className="h-2 w-2 rounded-full bg-brand" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* ─── POS MOCKUP ───────────────────────────────────────────────── */}
      <section className="px-6 pt-[10px] pb-[90px]">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <MiztliPOSMockup />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-[22px] text-center text-sm text-[var(--mkt-muted)]">
              El punto de venta de Kobi operando con el menú de{' '}
              <strong className="font-semibold text-[var(--mkt-ink-soft)]">Miztli Pardo</strong>,
              una dark kitchen real en Roma Norte, CDMX.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── HOW ──────────────────────────────────────────────────────── */}
      <section
        id="como"
        className="border-y border-[var(--mkt-line)] bg-surface px-6 py-24 scroll-mt-20"
      >
        <div className="mx-auto max-w-[1180px]">
          <SectionHead
            eyebrow="Cómo funciona"
            sub="Sin sistemas separados, sin comandas en papel, sin saltar entre apps."
          >
            De la cocina al cliente, <Em>sin fricción</Em>
          </SectionHead>
          <div className="grid grid-cols-1 gap-11 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.08}>
                <div className="mb-4 font-display text-[52px] font-medium italic leading-none text-brand opacity-85">
                  {step.num}
                </div>
                <h3 className="mb-[9px] text-[21px] font-semibold tracking-tight text-[var(--mkt-ink)]">
                  {step.title}
                </h3>
                <p className="text-[15.5px] leading-relaxed text-[var(--mkt-ink-soft)]">
                  {step.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────── */}
      <section id="producto" className="px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-[1180px]">
          <SectionHead
            eyebrow="Todo en uno"
            sub="Lo que otros cobran en módulos sueltos, aquí viene incluido. Y lo que falta, te lo decimos de frente."
          >
            Una plataforma. <Em>Toda tu operación.</Em>
          </SectionHead>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="relative h-full rounded-[18px] border border-[var(--mkt-line)] bg-surface p-[26px] transition-all hover:-translate-y-1 hover:shadow-md">
                  <span
                    className={`absolute right-[19px] top-[19px] rounded-full px-[10px] py-1 text-[10.5px] font-bold uppercase tracking-[0.05em] ${TAG_CLASS[f.tag]}`}
                  >
                    {TAG_LABEL[f.tag]}
                  </span>
                  <div className="mb-[17px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-[var(--sand)] text-[21px]">
                    {f.icon}
                  </div>
                  <h3 className="mb-[7px] text-[17px] font-bold tracking-tight text-[var(--mkt-ink)]">
                    {f.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-[var(--mkt-ink-soft)]">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-9 flex flex-wrap justify-center gap-[22px]">
            {(
              [
                { label: 'Listo — disponible hoy', color: 'var(--mkt-ok)' },
                { label: 'Pronto — en desarrollo', color: 'var(--brand)' },
                { label: 'En camino — en nuestro roadmap', color: 'var(--terra)' },
              ] as const
            ).map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--mkt-muted)]"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── CALC (espresso) ──────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-[10px]">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[30px] bg-[var(--espresso)] text-[#f5efe5]">
          <div
            className="pointer-events-none absolute right-[-80px] top-[-120px] h-[480px] w-[480px]"
            style={{ background: 'radial-gradient(circle, rgba(99,91,255,0.35), transparent 62%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-[-140px] left-[-60px] h-[420px] w-[420px]"
            style={{
              background: 'radial-gradient(circle, rgba(201,111,61,0.22), transparent 62%)',
            }}
          />
          <div className="relative grid grid-cols-1 items-center gap-14 p-7 sm:p-[56px] md:grid-cols-2">
            <Reveal>
              <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-[0.1em] text-[#e5a37e]">
                Tu canal propio
              </span>
              <h2 className="mb-4 font-display text-[28px] font-semibold leading-[1.1] tracking-tight text-[#fbf7ef] sm:text-[40px]">
                Cada venta directa <em className="font-medium text-[#a9a2ff]">te deja más</em>
              </h2>
              <p className="text-[16.5px] leading-relaxed text-[#b8ac99]">
                Los marketplaces te traen clientes nuevos; tu tienda propia te deja quedarte con
                casi todo. Con Kobi creces en ambos — y llevas a tus clientes frecuentes al canal
                que más te conviene.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <SavingsCalculator />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── COMPARATIVA ──────────────────────────────────────────────── */}
      <section className="border-y border-[var(--mkt-line)] bg-surface px-6 py-24">
        <div className="mx-auto max-w-[1180px]">
          <SectionHead
            eyebrow="Compara sin letra chica"
            sub="Números reales, sin configuradores que suman módulos hasta que el precio ya no parece lo que viste al principio."
          >
            Lo que otros cobran aparte, <Em>aquí viene incluido.</Em>
          </SectionHead>
          <Reveal className="mx-auto grid max-w-[860px] grid-cols-1 gap-[22px] md:grid-cols-2">
            {/* Kobi */}
            <div className="rounded-[20px] border border-[#d9d6ff] bg-brand-soft p-[30px]">
              <div className="mb-[14px] flex items-center gap-[10px]">
                <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-brand text-sm font-black text-white">
                  K
                </span>
                <span className="text-[17px] font-bold text-[var(--mkt-ink)]">
                  Kobi Profesional
                </span>
              </div>
              <div className="mb-5 flex items-baseline gap-[5px]">
                <span className="font-display text-[38px] font-semibold tracking-tight text-brand">
                  $699
                </span>
                <span className="text-[15px] text-[var(--mkt-ink-soft)]">/mes</span>
              </div>
              <div className="mb-5 flex flex-col gap-[10px]">
                {KOBI_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-[9px] bg-[rgba(30,126,90,0.08)] px-[10px] py-2 text-[14.5px] font-medium text-[var(--mkt-ok)]"
                  >
                    <span className="font-bold">✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--mkt-line)] pt-4 text-[15px] font-semibold text-[var(--mkt-ok)]">
                Total: <strong className="text-[18px]">$699/mes</strong>
              </div>
            </div>
            {/* Fudo */}
            <div className="rounded-[20px] border border-[var(--mkt-line)] bg-surface p-[30px]">
              <div className="mb-[14px] flex items-center gap-[10px]">
                <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#ff4f00] text-base font-black text-white">
                  f
                </span>
                <span className="text-[17px] font-bold text-[var(--mkt-ink-soft)]">
                  Fudo equivalente
                </span>
              </div>
              <div className="mb-5 flex items-baseline gap-[5px]">
                <span className="font-display text-[38px] font-semibold tracking-tight text-[var(--mkt-ink-soft)]">
                  $690
                </span>
                <span className="text-[15px] text-[var(--mkt-ink-soft)]">/mes</span>
                <span className="ml-[6px] rounded-full bg-[var(--sand)] px-[9px] py-[3px] text-[11px] font-bold text-[var(--mkt-muted)]">
                  plan base
                </span>
              </div>
              <div className="mb-5 flex flex-col gap-[10px]">
                {FUDO_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between gap-2 rounded-[9px] px-[10px] py-2 text-[14.5px] font-medium ${
                      item.kind === 'extra'
                        ? 'bg-[#fff3ee] text-[#c05621]'
                        : 'bg-[var(--cream)] text-[var(--mkt-ink-soft)]'
                    }`}
                  >
                    <span>
                      <span className="mr-1 font-bold">{item.kind === 'extra' ? '+' : '✓'}</span>
                      {item.label}
                    </span>
                    {item.tag && (
                      <span className="whitespace-nowrap rounded-full bg-[#fddccf] px-2 py-[2px] text-[12px] font-bold text-[#c05621]">
                        {item.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--mkt-line)] pt-4 text-[15px] font-semibold text-[var(--mkt-ink-soft)]">
                Total real:{' '}
                <strong className="text-[18px] text-[var(--mkt-ink)]">$1,090+/mes</strong>{' '}
                <span className="font-normal text-[var(--mkt-muted)]">+ comisiones</span>
              </div>
            </div>
          </Reveal>
          <Reveal className="mx-auto mt-[22px] max-w-[680px] text-center text-[13px] text-[var(--mkt-muted)]">
            Los precios de Fudo son públicos en fu.do/es-mx/precios. Kobi no cobra módulos separados
            por KDS ni por conectar tus marketplaces.
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section id="precios" className="px-6 py-24 scroll-mt-20">
        <div className="mx-auto max-w-[1180px]">
          <SectionHead
            eyebrow="Precios"
            sub="Todo lo esencial viene incluido en cada plan. Empieza gratis y cambia o cancela cuando quieras."
          >
            Un precio. <Em>Sin módulos sorpresa.</Em>
          </SectionHead>
          <div className="mx-auto grid max-w-[420px] grid-cols-1 items-stretch gap-[22px] lg:max-w-none lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-[22px] bg-surface p-8 transition-all hover:-translate-y-1.5 hover:shadow-md ${
                    plan.featured
                      ? 'border-2 border-brand shadow-[0_14px_36px_rgba(99,91,255,0.18)]'
                      : 'border border-[var(--mkt-line)]'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-4 py-[5px] text-[11.5px] font-bold uppercase tracking-[0.05em] text-white">
                      {plan.badge}
                    </span>
                  )}
                  <div className="font-display text-[23px] font-semibold text-[var(--mkt-ink)]">
                    {plan.name}
                  </div>
                  <div className="mb-5 min-h-[21px] text-[14px] text-[var(--mkt-muted)]">
                    {plan.for}
                  </div>
                  <div className="mb-[6px] flex items-baseline gap-1">
                    <span className="text-[15px] text-[var(--mkt-ink-soft)]">$</span>
                    <span className="font-display text-[46px] font-semibold tracking-tight text-[var(--mkt-ink)]">
                      {plan.price}
                    </span>
                    <span className="text-[15px] font-medium text-[var(--mkt-ink-soft)]">/mes</span>
                  </div>
                  <span className="mb-6 self-start rounded-full bg-[var(--mkt-ok-soft)] px-3 py-1 text-[13.5px] font-semibold text-[var(--mkt-ok)]">
                    1.5% en tu tienda
                  </span>
                  <Link
                    href={plan.cta.href}
                    className={`mb-[26px] w-full rounded-xl py-3 ${plan.featured ? BTN_PRIMARY : BTN_DARK}`}
                  >
                    {plan.cta.label}
                  </Link>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat.text}
                        className="flex items-start gap-[10px] text-[14.5px] text-[var(--mkt-ink-soft)]"
                      >
                        <Check />
                        {feat.strong ? (
                          <strong className="font-semibold text-[var(--mkt-ink)]">
                            {feat.text}
                          </strong>
                        ) : (
                          feat.text
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-[34px] text-center text-[15px] text-[var(--mkt-ink-soft)]">
            ¿No sabes cuál? <em className="font-display italic">Empieza con Profesional</em> —
            puedes cambiar de plan cuando quieras, sin penalización.
          </Reveal>
          <p className="mx-auto mt-[26px] max-w-[680px] text-center text-[12.5px] leading-relaxed text-[var(--mkt-muted)]">
            Precios en pesos mexicanos, no incluyen IVA. La comisión de 1.5% aplica solo a ventas de
            tu tienda directa. El procesamiento de pago con tarjeta lo cobra tu proveedor de pagos
            por separado. Descuentos de 10% y 15% en pago semestral y anual.
          </p>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-[20px]">
        <div className="mx-auto max-w-[1180px]">
          <SectionHead eyebrow="Dudas comunes">
            Lo que nos preguntan <Em>antes de empezar</Em>
          </SectionHead>
          <Reveal className="mx-auto max-w-[720px]">
            <FAQ items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="px-6 pb-[115px] pt-[105px] text-center">
        <Reveal className="mx-auto max-w-[1180px]">
          <h2 className="font-display text-[40px] font-semibold leading-[1.06] tracking-tight text-[var(--mkt-ink)] sm:text-[58px]">
            Todo tu negocio,
            <br />
            <Em>en una sola plataforma.</Em>
          </h2>
          <p className="mx-auto mb-[34px] mt-[18px] max-w-[480px] text-[18px] text-[var(--mkt-ink-soft)]">
            Empieza gratis hoy. Tu cocina lo va a agradecer.
          </p>
          <Link href={'/registro' as Route} className={`${BTN_PRIMARY} ${BTN_LG}`}>
            Empieza gratis
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
