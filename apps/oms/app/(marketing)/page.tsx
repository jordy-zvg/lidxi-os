'use client';

import { CTASection, FeatureGrid, SectionHeader } from '@/components/marketing';
import { HeroVisual } from '@/components/marketing/HeroVisual';
import { SavingsChart } from '@/components/marketing/SavingsChart';
import {
  ChainIllustration,
  KitchenIllustration,
  RestaurantIllustration,
} from '@/components/marketing/illustrations';
import {
  IconBolt,
  IconBox,
  IconDeviceDesktop,
  IconGlobe,
  IconLayoutGrid,
  IconPackage,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';

const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

const FEATURES = [
  {
    icon: <IconBox size={20} />,
    title: 'POS rápido',
    description: 'Cobra en segundos. Funciona offline. Sin curva de aprendizaje para tu equipo.',
  },
  {
    icon: <IconLayoutGrid size={20} />,
    title: 'Multi-canal',
    description: 'Uber Eats, Rappi, Didi Food y tu propio sitio. Un solo tablero donde todo pasa.',
  },
  {
    icon: <IconGlobe size={20} />,
    title: 'Storefront propio',
    description:
      'Recibe pedidos directos desde tu sitio. Sin comisiones de marketplaces. Tu marca, tus clientes, tus datos.',
  },
  {
    icon: <IconDeviceDesktop size={20} />,
    title: 'Cocina conectada',
    description:
      'Pantalla KDS con timers, prioridad automática y notificaciones cuando un platillo se está pasando del SLA.',
  },
  {
    icon: <IconPackage size={20} />,
    title: 'Inventario en vivo',
    description:
      'El stock baja con cada venta. Alertas antes de quedarte sin lo importante. Sin sorpresas en el corte de caja.',
  },
  {
    icon: <IconBolt size={20} />,
    title: 'Automatización',
    description:
      'Reglas que aceptan pedidos, suben precios en rush hour, pausan el menú cuando falta producto. Tu equipo en lo importante.',
  },
];

const PROFILES = [
  {
    Illustration: KitchenIllustration,
    title: 'Dark kitchens',
    description:
      'Operación 100% delivery. Multi-marca. Cocinas que necesitan moverse a velocidad de marketplace.',
    href: '/para-quien#dark-kitchens',
  },
  {
    Illustration: RestaurantIllustration,
    title: 'Restaurantes con delivery',
    description:
      'Sala + delivery sin fricción. POS para mesa y tablero de marketplaces en la misma cocina.',
    href: '/para-quien#restaurantes',
  },
  {
    Illustration: ChainIllustration,
    title: 'Cadenas multi-sucursal',
    description:
      'Vista consolidada de todas tus sucursales. Configuración central. Reportes que cuentan la historia completa.',
    href: '/para-quien#cadenas',
  },
];

const INTEGRATIONS = [
  'Uber Eats',
  'Rappi',
  'Didi Food',
  'Uber Direct',
  'Stripe',
  'WhatsApp Business',
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F6F9FC] pt-32 pb-16 sm:pt-40 sm:pb-24">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#635BFF 1px, transparent 1px), linear-gradient(to right, #635BFF 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[55fr_45fr]">
            {/* Text */}
            <div>
              <motion.p
                {...FADE}
                className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#635BFF]"
              >
                Punto de venta · Operaciones · Delivery
              </motion.p>
              <motion.h1
                {...FADE}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
                className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl lg:text-[56px]"
                style={{ letterSpacing: '-0.03em' }}
              >
                El sistema operativo de la cocina moderna.
              </motion.h1>
              <motion.p
                {...FADE}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-[#0A2540]/60 sm:text-xl"
              >
                Kobi conecta tu POS, tus marketplaces y tu cocina en una sola plataforma. Más
                pedidos, menos comisiones, operación que se mueve sola.
              </motion.p>
              <motion.div
                {...FADE}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.22 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/registro"
                  className="rounded-lg bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4f48d9] active:scale-[0.98]"
                >
                  Empezar gratis
                </Link>
                <Link
                  href="/caracteristicas"
                  className="rounded-lg border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-all hover:border-ink/40 active:scale-[0.98]"
                >
                  Ver características
                </Link>
              </motion.div>
              <motion.div
                {...FADE}
                transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.3 }}
                className="mt-10 flex flex-wrap gap-6"
              >
                {['14 días gratis', 'Sin tarjeta', 'Setup en 10 minutos'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-[#0A2540]/50">
                    <span className="text-[#635BFF]">✓</span>
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.15 }}
              className="hidden lg:block"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LOGO CLOUD ───────────────────────────────────────────────── */}
      <section className="border-y border-ink/8 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.p
            {...FADE}
            className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-ink/35"
          >
            Integraciones nativas con las plataformas que ya usas
          </motion.p>
          {/* TODO: reemplazar por logos oficiales con permisos correspondientes */}
          <motion.div
            {...FADE}
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {INTEGRATIONS.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-ink/30 transition-colors hover:text-ink/50"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURE GRID ─────────────────────────────────────────────── */}
      <section className="bg-[#F6F9FC] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Plataforma completa"
            headline="Todo lo que tu restaurante necesita, en un lugar."
            subheadline="Olvídate de pegar sistemas con cinta adhesiva. Kobi reemplaza tu POS, tu KDS, tu tablero de marketplaces y tu sistema de inventario con una sola plataforma diseñada para operar."
          />
          <div className="mt-14">
            <FeatureGrid features={FEATURES} columns={3} />
          </div>
        </div>
      </section>

      {/* ─── SAVINGS ──────────────────────────────────────────────────── */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div {...FADE}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#635BFF]">
                Economía del delivery
              </p>
              <h2
                className="mb-4 text-4xl font-semibold leading-[1.2] tracking-tight text-[#0A2540] sm:text-[40px]"
                style={{ letterSpacing: '-0.02em' }}
              >
                Ahorra hasta 28% en comisiones.
              </h2>
              <p className="mb-6 max-w-sm text-lg leading-relaxed text-ink/60">
                Las plataformas se quedan con 25-30% de cada pedido. Tu storefront propio reduce esa
                dependencia y devuelve margen a tu operación.
              </p>
              <ul className="space-y-2.5 text-sm text-ink/70">
                {[
                  'Cobra solo lo que vale Uber Direct por entrega (≈7-10%)',
                  'Tus clientes te encuentran directo, sin compartir tráfico',
                  'Datos completos del cliente para campañas de retención',
                  'WhatsApp automático para confirmaciones y reorders',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-px text-[#635BFF]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={'/caracteristicas' as Route}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#635BFF] hover:underline"
              >
                Ver cómo funciona →
              </Link>
            </motion.div>
            <motion.div
              {...FADE}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
              className="rounded-2xl border border-ink/10 bg-[#F6F9FC] p-8"
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-ink/40">
                Comparativa de comisiones
              </p>
              <SavingsChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PROFILES ─────────────────────────────────────────────────── */}
      <section className="bg-[#F6F9FC] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Para quienes operan"
            headline="Hecho para quien tiene la cocina prendida, no para quien diseña."
            subheadline="Kobi se construyó observando turnos reales en cocinas reales. Cada decisión de UI responde a una fricción que vimos en operación."
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PROFILES.map(({ Illustration, title, description, href }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Illustration className="h-44 w-full" />
                <div className="p-6">
                  <h3 className="mb-2 text-base font-semibold text-[#0A2540]">{title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-ink/60">{description}</p>
                  <Link
                    href={href as Route}
                    className="text-sm font-medium text-[#635BFF] hover:underline"
                  >
                    Ver más →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ──────────────────────────────────────────────── */}
      {/* TODO: validar quote con cliente PoC antes de publicar */}
      <section className="bg-[#0A2540] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.blockquote {...FADE} className="mx-auto max-w-3xl text-center">
            <p className="text-2xl font-medium leading-relaxed text-white sm:text-[28px]">
              &ldquo;Antes pegábamos con scripts entre Uber Eats, nuestro POS y la cocina. Con Kobi
              todo pasa en un solo tablero y mi equipo dejó de copiar pedidos a mano.&rdquo;
            </p>
            <footer className="mt-8 flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF]/20 text-base font-semibold text-white">
                M
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Director de Operaciones</p>
                <p className="text-sm text-white/50">Miztli Pardo · Cocina oscura en Roma Norte</p>
              </div>
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────────── */}
      <CTASection
        headline="Tu cocina merece software de clase mundial."
        subheadline="Setup en menos de 10 minutos. Sin contratos. Cancela cuando quieras."
        primaryCta={{ label: 'Empezar gratis', href: '/registro' }}
        secondaryCta={{ label: 'Agendar demo', href: '/contacto' }}
      />
    </>
  );
}
