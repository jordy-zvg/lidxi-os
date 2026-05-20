'use client';

import { CTASection, FAQ } from '@/components/marketing';
import type { FAQItem } from '@/components/marketing';
import { PricingFeatureTable } from '@/components/marketing/PricingFeatureTable';
import { PricingToggle } from '@/components/marketing/PricingToggle';
import { motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import { PLANS as CANONICAL_PLANS, formatMXN } from '@/lib/constants/plans';

const PLANS = CANONICAL_PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  priceMonthly: formatMXN(p.priceMonthlyMXN),
  priceAnnual: formatMXN(p.priceAnnualMXN),
  priceSub: p.priceSub,
  description: p.description,
  features: p.features,
  cta: {
    label: p.id === 'escala' ? 'Hablar con ventas' : 'Empezar gratis 14 días',
    href: (p.id === 'escala' ? '/contacto?tipo=escala' : `/registro?plan=${p.id}`) as Route,
  },
  highlighted: p.highlighted,
  badge: p.badge,
}));

const FAQ_ITEMS: FAQItem[] = [
  {
    question: '¿Hay costo de setup?',
    answer:
      'No. Setup completo en menos de 10 minutos, self-service. Si necesitas onboarding dedicado, está incluido en plan Escala.',
  },
  {
    question: '¿Cobran comisión por transacción?',
    answer:
      'No. Pagas tu plan mensual fijo. Las únicas comisiones que pagas son las de tus pasarelas de pago (Stripe, etc.) y las de tus marketplaces (Uber, Rappi). Kobi no se queda con nada por encima.',
  },
  {
    question: '¿Necesito tarjeta para empezar?',
    answer: 'No. Tienes 14 días gratis sin tarjeta. Si no te convence, no hay cargo.',
  },
  {
    question: '¿Qué pasa después de los 14 días?',
    answer:
      'Te avisamos por correo 3 días antes y vuelves a elegir plan. Si no respondes, tu cuenta queda en pausa, no se te cobra automáticamente.',
  },
  {
    question: '¿Puedo cambiar de plan?',
    answer: 'Sí, en cualquier momento. Los cobros son prorrateados.',
  },
  {
    question: '¿Hay contrato mínimo?',
    answer:
      'No. Mensual o anual, cancelas cuando quieras. El anual da 20% de descuento pero tampoco te ata más allá del mes en curso.',
  },
  {
    question: '¿Cómo se cobra "por sucursal"?',
    answer:
      'Cada local físico u operación lógica cuenta como sucursal. Una dark kitchen con 5 marcas virtuales pero una sola cocina cuenta como 1 sucursal.',
  },
  {
    question: '¿Tienen descuentos para asociaciones de restaurantes?',
    answer: 'Sí. Escríbenos a ventas@kobi.mx con el detalle de tu asociación.',
  },
];

const FADE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' } as const,
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

function PlanCard({
  plan,
  annual,
  index,
}: { plan: (typeof PLANS)[0]; annual: boolean; index: number }) {
  const price = annual ? plan.priceAnnual : plan.priceMonthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay: index * 0.1 }}
      className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        plan.highlighted
          ? 'border-[#635BFF] bg-[#635BFF] text-white'
          : 'border-ink/10 bg-white text-[#0A2540]'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#0A2540] px-3 py-1 text-xs font-semibold text-white">
          {plan.badge}
        </span>
      )}

      <div className="mb-6">
        <h3
          className={`text-xs font-semibold uppercase tracking-widest ${plan.highlighted ? 'text-white/70' : 'text-ink/50'}`}
        >
          {plan.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-1.5">
          {price ? (
            <>
              <span className="text-4xl font-semibold">{price}</span>
              <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-ink/50'}`}>
                {plan.priceSub}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold">Cotización</span>
          )}
        </div>
        {annual && price && (
          <p className={`mt-1 text-xs ${plan.highlighted ? 'text-white/60' : 'text-[#635BFF]'}`}>
            Facturado anualmente · Ahorra 20%
          </p>
        )}
        <p
          className={`mt-3 text-sm leading-relaxed ${plan.highlighted ? 'text-white/70' : 'text-ink/60'}`}
        >
          {plan.description}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 shrink-0 text-base leading-none ${plan.highlighted ? 'text-white' : 'text-[#635BFF]'}`}
            >
              ✓
            </span>
            <span className={plan.highlighted ? 'text-white/80' : 'text-ink/70'}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.cta.href}
        className={`block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all active:scale-[0.98] ${
          plan.highlighted
            ? 'bg-white text-[#635BFF] hover:bg-white/90'
            : 'bg-[#635BFF] text-white hover:bg-[#4f48d9]'
        }`}
      >
        {plan.cta.label}
      </Link>
    </motion.div>
  );
}

export default function PreciosPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F9FC] pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            {...FADE}
            className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#635BFF]"
          >
            Precios
          </motion.p>
          <motion.h1
            {...FADE}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.07 }}
            className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0A2540] sm:text-5xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            Precios claros. Sin sorpresas.
          </motion.h1>
          <motion.p
            {...FADE}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.14 }}
            className="mt-6 mx-auto max-w-xl text-lg leading-relaxed text-[#0A2540]/60"
          >
            Paga por sucursal activa. Sin comisiones por transacción. Sin contratos largos. Si Kobi
            no te funciona, cancelas y listo.
          </motion.p>
        </div>
      </section>

      {/* Toggle */}
      <section className="bg-[#F6F9FC] pb-12 text-center">
        <PricingToggle annual={annual} onChange={setAnnual} />
      </section>

      {/* Plans */}
      <section className="bg-[#F6F9FC] pb-24 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} annual={annual} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2
              className="text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Compara cada plan.
            </h2>
            <p className="mt-3 text-ink/50">Todo lo que incluye cada nivel.</p>
          </div>
          <PricingFeatureTable />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F6F9FC] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            className="mb-10 text-2xl font-semibold tracking-tight text-[#0A2540] sm:text-3xl"
            style={{ letterSpacing: '-0.02em' }}
          >
            Preguntas frecuentes.
          </h2>
          <FAQ items={FAQ_ITEMS} />
        </div>
      </section>

      <CTASection
        headline="14 días gratis, sin tarjeta."
        subheadline="Empieza hoy y descubre si Kobi encaja con tu operación."
        primaryCta={{ label: 'Empezar gratis', href: '/registro' }}
        secondaryCta={{ label: 'Hablar con ventas', href: '/contacto' }}
      />
    </>
  );
}
